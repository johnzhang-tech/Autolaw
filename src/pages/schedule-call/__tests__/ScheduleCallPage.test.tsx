import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import {
  ScheduleCallPage,
  bookingEmbedSrc,
  composeMailto,
  composePreview,
  scheduleMode,
} from '../ScheduleCallPage';
import { SecurityPage } from '../../security/SecurityPage';
import { AboutPage } from '../../about/AboutPage';
import App from '../../../App';
import { CONTACT_EMAIL } from '../../../config';

/*
 * This page has three states and two config values choose between them, so the config is
 * mocked through getters. The page reads BOOKING_URL and CONTACT_ENDPOINT at render, and
 * a getter is re-read on every render, so a test can put the page in any state without
 * reloading the module graph.
 *
 * The defaults are the shipped values — both null — so every test that does not opt in is
 * asserting the page a visitor gets today. Nothing here asserts that the real config is
 * still null: that assertion would fail the suite the day the owner pastes a booking link
 * in, which is the one thing this page is built to make easy.
 */
const config = vi.hoisted(() => ({
  bookingUrl: null as string | null,
  contactEndpoint: null as string | null,
}));

vi.mock('../../../config', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../config')>();
  return {
    ...actual,
    get BOOKING_URL() {
      return config.bookingUrl;
    },
    get CONTACT_ENDPOINT() {
      return config.contactEndpoint;
    },
  };
});

beforeEach(() => {
  config.bookingUrl = null;
  config.contactEndpoint = null;
});

/** A booking link shaped like the one Google hands out from Share → copy link. */
const BOOKING = 'https://calendar.google.com/calendar/appointments/schedules/AcZssZ0ExAmPlE';

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

/**
 * Whether the page let the submit event through to the browser.
 *
 * The difference between "composes a message" and "posts to an endpoint" is exactly one
 * preventDefault(), and jsdom cannot perform the navigation that would prove it. So this
 * listens above the React root — where React's own handler has already run — and records
 * whether the event was still cancellable by the time it got there, then cancels it so
 * jsdom is never asked to submit a form it cannot submit.
 */
function watchSubmit() {
  const cancelledByPage: boolean[] = [];
  const listener = (e: Event) => {
    cancelledByPage.push(e.defaultPrevented);
    e.preventDefault();
  };
  document.addEventListener('submit', listener);
  return {
    cancelledByPage,
    stop: () => document.removeEventListener('submit', listener),
  };
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
  /**
   * The visible label of every control, which is also what the summary must call it.
   * Escaped because one of them ends in a question mark.
   */
  const VISIBLE_LABELS = [
    'Which do you practice?',
    'Your name',
    'Firm',
    'Work email',
    'Open cases right now',
  ];
  const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  it('blocks an empty submission and announces every problem in a live region', async () => {
    const user = userEvent.setup();
    render(<ScheduleCallPage />);

    await user.click(screen.getByRole('button', { name: /compose this as an email/i }));

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent(/5 answers need attention/i);
    // Named, and linked — "something is wrong" versus "here is where".
    VISIBLE_LABELS.forEach((label) => {
      expect(within(alert).getByText(new RegExp(`^${escapeRe(label)}:`))).toBeInTheDocument();
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

  /*
   * The summary calls each field what the field calls itself. Hearing "Name" in the
   * summary, following the link, and landing on a control announced as "Your name" is a
   * screen-reader user looking for a field that does not exist under the name they were
   * given — so the two strings are asserted against each other rather than transcribed.
   */
  it('names each field exactly as its own label does', async () => {
    const user = userEvent.setup();
    render(<ScheduleCallPage />);
    await user.click(screen.getByRole('button', { name: /compose this as an email/i }));

    const links = within(screen.getByRole('alert')).getAllByRole('link');
    const summaryNames = links.map((a) => a.textContent!.split(':')[0]);
    expect(summaryNames).toEqual(VISIBLE_LABELS);

    // And each of those names is a real accessible name on the control it links to.
    links.forEach((a, i) => {
      const target = document.getElementById(a.getAttribute('href')!.slice(1)) as
        | HTMLInputElement
        | HTMLSelectElement;
      const heard =
        target.getAttribute('type') === 'radio'
          ? form().querySelector('legend')!.textContent
          : target.labels![0].textContent;
      expect(heard).toBe(VISIBLE_LABELS[i]);
    });
  });

  /*
   * Focus has to move, and nothing moves it for us. The browser's "focus the first
   * invalid control" step only looks at controls whose invalid event went unhandled, and
   * the page cancels every one of them to suppress the native bubble — so the browser
   * focuses nothing and, without this, the button appears to do nothing at all.
   */
  it('moves focus to the summary when a submission is rejected', async () => {
    const user = userEvent.setup();
    render(<ScheduleCallPage />);
    await user.click(screen.getByRole('button', { name: /compose this as an email/i }));

    const alert = screen.getByRole('alert');
    expect(alert).toHaveFocus();
    // A focus target, not a tab stop: tabbing through the form must not stop here again.
    expect(alert).toHaveAttribute('tabindex', '-1');
  });

  it('does not snatch focus back while the answers are being fixed', async () => {
    const user = userEvent.setup();
    render(<ScheduleCallPage />);
    await user.click(screen.getByRole('button', { name: /compose this as an email/i }));

    const name = screen.getByLabelText(/your name/i);
    await user.click(name);
    await user.type(name, 'Jane Roe');
    // Four errors remain, so the summary re-renders — but it must not pull the caret out
    // of the field being typed in.
    expect(screen.getByRole('alert')).toHaveTextContent(/4 answers need attention/i);
    expect(name).toHaveFocus();
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
    render(<ScheduleCallPage />);
    expect(form()).not.toHaveAttribute('action');
    expect(form()).not.toHaveAttribute('method');
  });

  it('says up front that this does not submit anywhere', () => {
    render(<ScheduleCallPage />);
    expect(screen.getByText(/no form inbox yet, so this does not submit anywhere/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /compose this as an email/i })).toHaveAttribute('type', 'submit');
  });

  /*
   * "Up front" is a claim about document order, not about pixels. A caveat that renders
   * after the button is a caveat a screen-reader user meets after pressing it.
   */
  it('puts that notice before the button, not after it', () => {
    render(<ScheduleCallPage />);
    const notice = screen.getByText(/does not submit anywhere/i);
    const button = screen.getByRole('button', { name: /compose this as an email/i });
    expect(notice.compareDocumentPosition(button) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('composes every answer into a mail message once the form is valid', async () => {
    const user = userEvent.setup();
    const watcher = watchSubmit();
    render(<ScheduleCallPage />);
    await fillValidly(user);
    await user.click(screen.getByRole('button', { name: /compose this as an email/i }));
    watcher.stop();

    // The page cancelled the submission itself — nothing was left for a browser to POST.
    expect(watcher.cancelledByPage).toEqual([true]);

    const panel = screen.getByTestId('composed');
    expect(panel).toHaveTextContent(/nothing has been sent yet/i);

    // The composed message is shown, not just described, so nothing about it is hidden.
    expect(within(panel).getByText(/Which do you practice\?: Personal injury/)).toBeInTheDocument();

    const href = within(panel).getByRole('link', { name: /open this in your email app/i }).getAttribute('href')!;
    expect(href.startsWith(`mailto:${CONTACT_EMAIL}?`)).toBe(true);
    const body = decodeURIComponent(new URL(href).search.match(/body=([^&]*)/)![1]);
    expect(body).toContain('Which do you practice?: Personal injury');
    expect(body).toContain('Your name: Jane Roe');
    expect(body).toContain('Firm: Roe & Partners');
    expect(body).toContain('Work email: jane@roe.example');
    expect(body).toContain('Open cases right now: 50–200');
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

/*
 * The second half of the CONTACT_ENDPOINT switch, which shipped untested: every assertion
 * above describes the null branch, so nothing would have failed if setting an endpoint had
 * left the page composing mailto links into a form nobody reads.
 */
describe('ScheduleCallPage — with a form endpoint configured', () => {
  const ENDPOINT = 'https://forms.example.test/autolaw-call';
  beforeEach(() => {
    config.contactEndpoint = ENDPOINT;
  });

  it('posts natively to the endpoint rather than through a script', () => {
    render(<ScheduleCallPage />);
    expect(form()).toHaveAttribute('action', ENDPOINT);
    expect(form()).toHaveAttribute('method', 'post');
    expect(screen.getByRole('button', { name: /request a call/i })).toHaveAttribute('type', 'submit');
  });

  it('lets the submission through instead of composing a message', async () => {
    const user = userEvent.setup();
    const watcher = watchSubmit();
    render(<ScheduleCallPage />);
    await fillValidly(user);
    await user.click(screen.getByRole('button', { name: /request a call/i }));
    watcher.stop();

    // Not cancelled by the page: the browser would have performed the POST.
    expect(watcher.cancelledByPage).toEqual([false]);
    expect(screen.queryByTestId('composed')).not.toBeInTheDocument();
  });

  it('drops the "does not submit anywhere" notice, which is no longer true', () => {
    render(<ScheduleCallPage />);
    expect(screen.queryByText(/does not submit anywhere/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /compose this as an email/i })).not.toBeInTheDocument();
  });

  it('still validates natively before any of that happens', async () => {
    const user = userEvent.setup();
    const watcher = watchSubmit();
    render(<ScheduleCallPage />);
    await user.click(screen.getByRole('button', { name: /request a call/i }));
    watcher.stop();

    expect(watcher.cancelledByPage).toEqual([]); // the browser never fired submit at all
    expect(screen.getByRole('alert')).toHaveTextContent(/5 answers need attention/i);
  });
});

describe('ScheduleCallPage — with a booking page configured', () => {
  beforeEach(() => {
    config.bookingUrl = BOOKING;
  });

  it('frames the booking page, named for a screen reader and loaded lazily', () => {
    render(<ScheduleCallPage />);
    const embed = screen.getByTestId('booking-embed');
    expect(embed.tagName).toBe('IFRAME');
    expect(embed).toHaveAttribute('src', `${BOOKING}?gv=true`);
    // A frame with no title is announced as "frame" and nothing else.
    expect(embed).toHaveAttribute('title', 'Book a call with Autolaw');
    expect(embed).toHaveAccessibleName('Book a call with Autolaw');
    expect(embed).toHaveAttribute('loading', 'lazy');
  });

  /*
   * The point of the embed. Google's booking form already asks the name, the email, and
   * the practice-area question, so a qualifying form beside it asks the same person the
   * same three things twice — on the highest-intent action on the site.
   */
  it('asks nothing the booking form already asks', () => {
    render(<ScheduleCallPage />);
    expect(screen.getByRole('main').querySelector('form')).toBeNull();
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/your name/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/work email/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /compose this as an email/i })).not.toBeInTheDocument();
  });

  it('keeps the context around the calendar — the steps and the security aside', () => {
    const { container } = render(<ScheduleCallPage />);
    const main = within(screen.getByRole('main'));
    expect(container.querySelectorAll('.al-sched__steps li')).toHaveLength(3);
    expect(main.getByText(/you pick a time/i)).toBeInTheDocument();
    expect(main.getByText(/the call follows your practice area/i)).toBeInTheDocument();
    expect(main.getByRole('link', { name: /read the security page/i })).toBeInTheDocument();
  });

  /*
   * A framed page is the one thing on this site a visitor cannot rescue themselves from:
   * if the browser blocks third-party frames, the calendar is simply a blank rectangle and
   * there is nothing to click. So the same URL is always present as an ordinary link.
   */
  it('offers the same booking page as a plain link for a browser that blocks frames', () => {
    render(<ScheduleCallPage />);
    const link = screen.getByRole('link', { name: /open the booking page directly/i });
    expect(link).toHaveAttribute('href', BOOKING);
  });

  /* Free Google Calendar sends the invitee no reminder. Saying so is cheaper than the
     missed call, and the page must never imply a reminder is coming. */
  it('does not promise a reminder it cannot send', () => {
    render(<ScheduleCallPage />);
    expect(screen.getByText(/cannot send you a reminder/i)).toBeInTheDocument();
    expect(screen.queryByText(/we.ll remind you|reminder email will/i)).not.toBeInTheDocument();
  });

  it('stops describing the page as having no booking calendar', () => {
    render(<ScheduleCallPage />);
    expect(screen.queryByText(/no booking calendar on this page yet/i)).not.toBeInTheDocument();
  });

  /*
   * Booking beats a form endpoint. Both configured is a real state — an endpoint may
   * already exist when the calendar goes up — and the answer is one place to book, not a
   * calendar with a form under it repeating its questions.
   */
  it('wins over a form endpoint when both are configured', () => {
    config.contactEndpoint = 'https://forms.example.test/autolaw-call';
    render(<ScheduleCallPage />);
    expect(screen.getByTestId('booking-embed')).toBeInTheDocument();
    expect(screen.getByRole('main').querySelector('form')).toBeNull();
  });

  /*
   * Framing Google's booking page lets Google set cookies and read its own storage for
   * whoever loads it. Someone reading /security/ — the page that tells firms how their
   * data is handled — never asked for that, so the embed belongs to the one page whose
   * purpose is booking a call and to no shared shell. Asserted by rendering the other
   * pages with a booking URL configured and finding no frame on any of them.
   */
  const OTHER_PAGES: Array<[string, () => ReactElement]> = [
    ['/security/', () => <SecurityPage />],
    ['/about/', () => <AboutPage />],
    ['the home page', () => <App />],
  ];

  it.each(OTHER_PAGES)('loads no third-party frame on %s', (_name, Page) => {
    const { container } = render(<Page />);
    expect(container.querySelectorAll('iframe')).toHaveLength(0);
  });
});

describe('bookingEmbedSrc', () => {
  /*
   * BOOKING_URL is documented as the link Google gives you, so the embeddable variant is
   * derived rather than pasted a second time. Two URLs kept in step by hand drift, and the
   * failure is a frame that renders the standalone page inside the page.
   */
  it('asks Google for the embeddable variant', () => {
    expect(bookingEmbedSrc('https://calendar.google.com/x/AcZ')).toBe(
      'https://calendar.google.com/x/AcZ?gv=true'
    );
  });

  it('keeps a query string the link already carries', () => {
    expect(bookingEmbedSrc('https://calendar.google.com/x/AcZ?hl=en')).toBe(
      'https://calendar.google.com/x/AcZ?hl=en&gv=true'
    );
  });

  it('does not add gv=true to a link that already has it', () => {
    const embed = 'https://calendar.google.com/x/AcZ?gv=true';
    expect(bookingEmbedSrc(embed)).toBe(embed);
    expect(bookingEmbedSrc('https://calendar.google.com/x/AcZ?gv=true&hl=en')).toBe(
      'https://calendar.google.com/x/AcZ?gv=true&hl=en'
    );
  });
});

describe('scheduleMode', () => {
  it('prefers a booking page, then an endpoint, then composing a message', () => {
    expect(scheduleMode(BOOKING, 'https://forms.example.test/x')).toBe('booking');
    expect(scheduleMode(BOOKING, null)).toBe('booking');
    expect(scheduleMode(null, 'https://forms.example.test/x')).toBe('endpoint');
    expect(scheduleMode(null, null)).toBe('compose');
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
        'Which do you practice?: Both',
        'Your name: Jane Roe',
        'Firm: Roe & Partners',
        'Work email: jane@roe.example',
        'Open cases right now: More than 500',
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
  /*
   * "Within one business day" is a deadline, and this site has no on-call rota, no stated
   * timezone, and no definition of a holiday. A hedge that is kept beats a promise that is
   * missed by a visitor in Perth on a Friday afternoon.
   */
  it('hedges the reply time rather than promising a deadline it has not defined', () => {
    render(<ScheduleCallPage />);
    const main = within(screen.getByRole('main'));
    expect(main.getByText(/we reply, usually the next business day/i)).toBeInTheDocument();
    expect(main.queryByText(/within one business day/i)).not.toBeInTheDocument();
    expect(main.getByText(/the name of the person you will be talking to/i)).toBeInTheDocument();
  });

  it('says there is no booking calendar, for exactly as long as there is none', () => {
    render(<ScheduleCallPage />);
    expect(
      within(screen.getByRole('main')).getByText(/no booking calendar on this page yet/i)
    ).toBeInTheDocument();
  });
});

describe('ScheduleCallPage — the security-review aside', () => {
  /*
   * The aside used to be labelled "Before the call" while the heading inside it read "If
   * security reviews first": a screen-reader user hears one name for the region and then
   * reads another. Pointing aria-labelledby at the visible heading makes the two the same
   * string by construction rather than by discipline.
   */
  it('is named by the heading a reader will then read', () => {
    render(<ScheduleCallPage />);
    const aside = screen.getByRole('complementary');
    const id = aside.getAttribute('aria-labelledby');
    expect(id).toBeTruthy();

    const heading = document.getElementById(id!)!;
    expect(heading.tagName).toBe('H3');
    expect(aside).not.toHaveAttribute('aria-label');
    expect(aside).toHaveAccessibleName(heading.textContent!);
    expect(heading).toHaveTextContent('If your security review comes first');
  });
});
