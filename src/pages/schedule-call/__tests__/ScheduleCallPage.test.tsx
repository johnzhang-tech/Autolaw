import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ScheduleCallPage, composeMailto, composePreview } from '../ScheduleCallPage';
import { CONTACT_ENDPOINT, CONTACT_EMAIL } from '../../../config';

const form = () => screen.getByRole('main').querySelector('form')!;

/** Every control the browser will validate and submit, in document order. */
const controls = () =>
  [...form().querySelectorAll<HTMLInputElement | HTMLSelectElement>('input, select, textarea')];

async function fillValidly(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('radio', { name: 'Personal injury' }));
  await user.type(screen.getByLabelText(/your name/i), 'Jane Roe');
  await user.type(screen.getByLabelText(/^firm$/i), 'Roe & Partners');
  await user.type(screen.getByLabelText(/work email/i), 'jane@roe.example');
  await user.selectOptions(screen.getByLabelText(/open cases/i), '50–200');
}

describe('ScheduleCallPage — the questions', () => {
  /*
   * Practice area first is not a layout preference. Personal injury and workers'
   * compensation are separate products, so this answer decides which conversation the
   * call is — asking it after the name would be asking it after we had already guessed.
   * Asserted on DOM order rather than on CSS, because CSS order is not what a screen
   * reader or a keyboard follows.
   */
  it('asks practice area before anything else', () => {
    render(<ScheduleCallPage />);
    const first = controls()[0];
    expect(first).toHaveAttribute('type', 'radio');
    expect(first).toHaveAttribute('name', 'practice');
    expect(first).toHaveAccessibleName('Personal injury');
  });

  it('offers personal injury, workers’ compensation, and both', () => {
    render(<ScheduleCallPage />);
    const names = screen.getAllByRole('radio').map((r) => r.getAttribute('value'));
    expect(names).toEqual(['Personal injury', 'Workers’ compensation', 'Both']);
  });

  it('asks for name, firm, work email, and open-case volume', () => {
    render(<ScheduleCallPage />);
    expect(screen.getByLabelText(/your name/i)).toHaveAttribute('name', 'name');
    expect(screen.getByLabelText(/^firm$/i)).toHaveAttribute('name', 'firm');
    expect(screen.getByLabelText(/work email/i)).toHaveAttribute('name', 'email');
    expect(screen.getByLabelText(/open cases/i)).toHaveAttribute('name', 'volume');
  });
});

describe('ScheduleCallPage — labels and native validation', () => {
  /*
   * A placeholder is not a label: it disappears the moment there is a value, it is not
   * reliably announced, and it fails at the exact moment someone is checking their answers.
   * This asserts the real thing — that each control resolves to an accessible name through
   * a <label>, and that no control is leaning on placeholder text instead.
   */
  it('gives every control a real label, and uses no placeholder in place of one', () => {
    render(<ScheduleCallPage />);
    const unlabelled = controls().filter((el) => !el.labels?.length);
    expect(unlabelled.map((el) => el.outerHTML.slice(0, 80))).toEqual([]);
    controls().forEach((el) => expect(el).toHaveAccessibleName());

    const placeholders = controls().filter((el) => el.getAttribute('placeholder'));
    expect(placeholders.map((el) => el.getAttribute('name'))).toEqual([]);
  });

  it('declares its constraints in HTML, so validation works without JavaScript', () => {
    render(<ScheduleCallPage />);
    controls().forEach((el) => expect(el).toBeRequired());
    expect(screen.getByLabelText(/work email/i)).toHaveAttribute('type', 'email');
    // No novalidate: the browser's own constraint check is the gate, not a script.
    expect(form()).not.toHaveAttribute('novalidate');
  });

  it('groups the radios under a legend rather than a floating heading', () => {
    render(<ScheduleCallPage />);
    const group = form().querySelector('fieldset')!;
    expect(within(group).getByText(/which do you practice/i).tagName).toBe('LEGEND');
    expect(within(group).getAllByRole('radio')).toHaveLength(3);
  });
});

describe('ScheduleCallPage — errors are announced, not just coloured', () => {
  it('blocks an empty submission and announces every problem in a live region', async () => {
    const user = userEvent.setup();
    render(<ScheduleCallPage />);

    await user.click(screen.getByRole('button', { name: /compose this as an email/i }));

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent(/5 answers need attention/i);
    // Named, and linked — "something is wrong" versus "here is where".
    ['Practice area', 'Name', 'Firm', 'Work email', 'Open cases'].forEach((label) => {
      expect(within(alert).getByText(new RegExp(`^${label}:`))).toBeInTheDocument();
    });
    within(alert)
      .getAllByRole('link')
      .forEach((a) => {
        const id = a.getAttribute('href')!.slice(1);
        expect(document.getElementById(id), `${a.getAttribute('href')} resolves`).not.toBeNull();
      });

    // Nothing was composed, and nothing pretended to be sent.
    expect(screen.queryByTestId('composed')).not.toBeInTheDocument();
  });

  it('marks each offending control invalid and points it at its own message', async () => {
    const user = userEvent.setup();
    render(<ScheduleCallPage />);
    await user.click(screen.getByRole('button', { name: /compose this as an email/i }));

    const email = screen.getByLabelText(/work email/i);
    expect(email).toHaveAttribute('aria-invalid', 'true');
    const described = (email.getAttribute('aria-describedby') ?? '').split(/\s+/);
    const messages = described.map((id) => document.getElementById(id));
    expect(messages.every(Boolean)).toBe(true);
    expect(messages.some((el) => el?.className.includes('al-sched__error'))).toBe(true);
  });

  it('rejects an address that is not an address, using the browser’s own check', async () => {
    const user = userEvent.setup();
    render(<ScheduleCallPage />);
    await fillValidly(user);

    const email = screen.getByLabelText(/work email/i) as HTMLInputElement;
    await user.clear(email);
    await user.type(email, 'jane at roe dot example');
    expect(email.validity.typeMismatch).toBe(true);

    await user.click(screen.getByRole('button', { name: /compose this as an email/i }));
    expect(screen.getByRole('alert')).toHaveTextContent(/work email/i);
    expect(screen.queryByTestId('composed')).not.toBeInTheDocument();
  });

  it('clears a message as soon as its field is fixed, so no error outlives its cause', async () => {
    const user = userEvent.setup();
    render(<ScheduleCallPage />);
    await user.click(screen.getByRole('button', { name: /compose this as an email/i }));
    expect(screen.getByRole('alert')).toHaveTextContent(/5 answers need attention/i);

    await user.type(screen.getByLabelText(/your name/i), 'Jane Roe');
    expect(screen.getByRole('alert')).toHaveTextContent(/4 answers need attention/i);
    expect(screen.getByLabelText(/your name/i)).not.toHaveAttribute('aria-invalid');
  });
});

describe('ScheduleCallPage — what submitting actually does', () => {
  /*
   * There is no form backend. The one outcome this page must never produce is a form that
   * looks like it worked: a POST into a URL nobody is listening on, a green tick, and a
   * visitor who stops looking for another way to reach us. So while CONTACT_ENDPOINT is
   * null the form composes a message the visitor sends themselves, from their own address,
   * and says so in as many words.
   */
  it('has no endpoint, and therefore no action to post to', () => {
    expect(CONTACT_ENDPOINT).toBeNull();
    render(<ScheduleCallPage />);
    expect(form()).not.toHaveAttribute('action');
    expect(form()).not.toHaveAttribute('method');
  });

  it('says up front that this does not submit anywhere', () => {
    render(<ScheduleCallPage />);
    expect(screen.getByText(/no form inbox yet, so this does not submit anywhere/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /compose this as an email/i })).toHaveAttribute('type', 'submit');
  });

  it('composes every answer into a mail message once the form is valid', async () => {
    const user = userEvent.setup();
    render(<ScheduleCallPage />);
    await fillValidly(user);
    await user.click(screen.getByRole('button', { name: /compose this as an email/i }));

    const panel = screen.getByTestId('composed');
    expect(panel).toHaveTextContent(/nothing has been sent yet/i);

    // The composed message is shown, not just described, so nothing about it is hidden.
    expect(within(panel).getByText(/Practice area: Personal injury/)).toBeInTheDocument();

    const href = within(panel).getByRole('link', { name: /open this in your email app/i }).getAttribute('href')!;
    expect(href.startsWith(`mailto:${CONTACT_EMAIL}?`)).toBe(true);
    const body = decodeURIComponent(new URL(href).search.match(/body=([^&]*)/)![1]);
    expect(body).toContain('Practice area: Personal injury');
    expect(body).toContain('Name: Jane Roe');
    expect(body).toContain('Firm: Roe & Partners');
    expect(body).toContain('Work email: jane@roe.example');
    expect(body).toContain('Open cases: 50–200');
  });

  it('withdraws a composed message the moment an answer changes', async () => {
    const user = userEvent.setup();
    render(<ScheduleCallPage />);
    await fillValidly(user);
    await user.click(screen.getByRole('button', { name: /compose this as an email/i }));
    expect(screen.getByTestId('composed')).toBeInTheDocument();

    await user.type(screen.getByLabelText(/^firm$/i), ' LLP');
    // A panel still showing the old firm name is a message the visitor would send by
    // mistake, believing they had corrected it.
    expect(screen.queryByTestId('composed')).not.toBeInTheDocument();
  });

  it('keeps a route open for a visitor with no mail app configured', async () => {
    const user = userEvent.setup();
    render(<ScheduleCallPage />);
    await fillValidly(user);
    await user.click(screen.getByRole('button', { name: /compose this as an email/i }));

    const panel = within(screen.getByTestId('composed'));
    expect(panel.getByText(/nothing opened\?/i)).toBeInTheDocument();
    expect(panel.getByRole('link', { name: CONTACT_EMAIL })).toHaveAttribute('href', `mailto:${CONTACT_EMAIL}`);
  });
});

describe('composeMailto', () => {
  const values = {
    practice: 'Both',
    name: 'Jane Roe',
    firm: 'Roe & Partners',
    email: 'jane@roe.example',
    volume: 'More than 500',
  };

  it('labels every answer, in the order it was asked', () => {
    expect(composePreview(values)).toBe(
      [
        'Practice area: Both',
        'Name: Jane Roe',
        'Firm: Roe & Partners',
        'Work email: jane@roe.example',
        'Open cases: More than 500',
      ].join('\n')
    );
  });

  it('puts the practice area in the subject, where it routes the reply', () => {
    const subject = decodeURIComponent(composeMailto(values).match(/subject=([^&]*)/)![1]);
    expect(subject).toBe('Call request — Both');
  });

  it('escapes values so an ampersand in a firm name cannot truncate the body', () => {
    const href = composeMailto(values);
    // A raw "&" would end the body parameter and drop everything after the firm name.
    expect(href).not.toContain('Roe & Partners');
    expect(href).toContain('Roe%20%26%20Partners');
    const body = decodeURIComponent(href.match(/body=([^&]*)/)![1]);
    expect(body).toContain('Work email: jane@roe.example');
  });
});

describe('ScheduleCallPage — what it promises', () => {
  it('says what happens after sending, and how fast', () => {
    render(<ScheduleCallPage />);
    const main = within(screen.getByRole('main'));
    expect(main.getByText(/we reply within one business day/i)).toBeInTheDocument();
    expect(main.getByText(/no booking calendar on this page yet/i)).toBeInTheDocument();
  });
});
