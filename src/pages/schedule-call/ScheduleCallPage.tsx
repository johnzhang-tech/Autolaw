import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { PageShell } from '../PageShell';
import { PageHero } from '../PageHero';
import { Section } from '../../components/primitives/Section';
import { Button } from '../../components/primitives/Button';
import { BOOKING_URL, CONTACT_EMAIL, CONTACT_ENDPOINT, SECURITY_URL } from '../../config';
import './ScheduleCallPage.css';

/**
 * The questions, in the order they are asked and in the order they appear in the composed
 * message. Practice area is first because it is not a demographic — personal injury and
 * workers' compensation are separate products, so the answer decides which conversation
 * this becomes. Asking it after the name would be asking it after we had already guessed.
 *
 * Each label is the *visible* label of its control, character for character. These strings
 * are what the error summary announces, and a summary that says "Name" for a control the
 * screen reader announces as "Your name" sends someone looking for a field that does not
 * exist by that name. If you rename a label below, rename it here in the same edit.
 */
const FIELDS = [
  { name: 'practice', label: 'Which do you practice?' },
  { name: 'name', label: 'Your name' },
  { name: 'firm', label: 'Firm' },
  { name: 'email', label: 'Work email' },
  { name: 'volume', label: 'Open cases right now' },
] as const;

type FieldName = (typeof FIELDS)[number]['name'];

const PRACTICES = ['Personal injury', 'Workers’ compensation', 'Both'];

/** `?practice=pi|wc|both` → index into PRACTICES; anything else preselects nothing. */
export function practiceFromSearch(search: string): number | null {
  const v = new URLSearchParams(search).get('practice');
  return v === 'pi' ? 0 : v === 'wc' ? 1 : v === 'both' ? 2 : null;
}

const VOLUMES = ['Under 50', '50–200', '200–500', 'More than 500'];

/** Ids are derived, never spelled twice — a label and its control drifting apart is silent. */
const inputId = (name: FieldName) => `field-${name}`;
const errorId = (name: FieldName) => `field-${name}-error`;
const hintId = (name: FieldName) => `field-${name}-hint`;
const radioId = (i: number) => `${inputId('practice')}-${i}`;

/**
 * Where the error summary sends you. A radio group has no single control to link to, so
 * the first option is the landing point — from there the arrow keys are the answer.
 */
const anchorFor = (name: FieldName) => (name === 'practice' ? radioId(0) : inputId(name));

/**
 * How this page behaves, in priority order.
 *
 * `booking`  — BOOKING_URL is set: the Google appointment schedule is the whole funnel.
 * `endpoint` — CONTACT_ENDPOINT is set and BOOKING_URL is not: the form POSTs natively.
 * `compose`  — neither: the form composes a message the visitor sends themselves.
 *
 * Booking wins over endpoint deliberately. Google's booking form already collects the
 * name, the email, and the practice-area question, so rendering our form beside it would
 * ask the same three things twice on the highest-intent action on the site.
 */
export type ScheduleMode = 'booking' | 'endpoint' | 'compose';

export const scheduleMode = (booking: string | null, endpoint: string | null): ScheduleMode =>
  booking ? 'booking' : endpoint ? 'endpoint' : 'compose';

/**
 * Google serves the same appointment schedule in two shapes at one URL: the standalone
 * booking page, and — with `gv=true` — the variant meant to be framed. BOOKING_URL is
 * documented as the plain link, so the embed derives its own src rather than asking the
 * owner to paste the URL twice and keep the two in step.
 */
export function bookingEmbedSrc(url: string): string {
  if (/[?&]gv=true(?:&|$)/.test(url)) return url;
  return `${url}${url.includes('?') ? '&' : '?'}gv=true`;
}

/**
 * The message the visitor sends. Exported so it can be asserted directly: the composed
 * body is the entire product of this form, and a test that only clicked the button would
 * pass while the body silently lost a field.
 */
export function composeMailto(values: Record<string, string>): string {
  const body = `${composePreview(values)}\n\nSent from the schedule-a-call page on autolaw.ai.`;
  const subject = `Call request — ${values.practice ?? ''}`.trim();
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/** The same answers as plain text, shown to the visitor so nothing about it is hidden. */
export function composePreview(values: Record<string, string>): string {
  return FIELDS.map((f) => `${f.label}: ${values[f.name] ?? ''}`).join('\n');
}

/**
 * What actually happens next, which is a different sequence in each mode. The steps are
 * kept beside the booking embed rather than replaced by it — someone deciding whether to
 * pick a slot still wants to know what the call is — but a step that says "your mail app
 * opens" above a calendar that books instantly would be describing a page that is no
 * longer here.
 */
function stepsFor(mode: ScheduleMode): Array<{ title: string; body: ReactNode }> {
  const reply = {
    title: 'We reply, usually the next business day',
    body: 'With times that fit your week, and the name of the person you will be talking to.',
  };
  const practice = {
    title: 'The call follows your practice area',
    body: (
      <>
        A workers&rsquo; compensation firm never sits through a personal injury demo. That is
        what the first question {mode === 'booking' ? 'on the booking form' : 'below'} is for.
      </>
    ),
  };

  if (mode === 'booking') {
    return [
      {
        title: 'You pick a time',
        body: 'The calendar below shows what is open. Choosing a slot books it there and then — no reply needed first.',
      },
      {
        title: 'The slot is held',
        body: 'It comes off the calendar the moment you book it, so it is not offered to anyone else afterwards.',
      },
      practice,
    ];
  }

  return [
    mode === 'endpoint'
      ? {
          title: 'You send the form',
          body: 'The answers reach us directly. Nothing else is asked of you.',
        }
      : {
          title: 'You send the message',
          body: 'Your own mail app opens with these answers filled in. You press send, so nothing leaves your machine that you have not read.',
        },
    reply,
    practice,
  ];
}

/** The steps section's standfirst, which is a claim about the page and so is mode-bound. */
function introFor(mode: ScheduleMode): string {
  if (mode === 'booking') {
    return 'Pick a slot and the call is booked. The booking page asks the three things we would have asked anyway, so there is no second form on this page.';
  }
  if (mode === 'endpoint') {
    return 'There is no booking calendar on this page yet, so the form below reaches us directly and we come back with times.';
  }
  return 'There is no booking calendar on this page yet, so this is handled by email — which has one advantage: you can see exactly what gets sent.';
}

const ASIDE_HEADING_ID = 'security-review-aside-heading';

/**
 * The same aside in every mode. A firm that runs a security review before a first call is
 * doing it whether the call is booked in a calendar or requested by email.
 */
function SecurityReviewAside() {
  return (
    /* al-on-navy flips the inherited --al-ring: the default teal-on-canvas ring is
       2.68:1 against this panel and effectively invisible.

       aria-labelledby points at the visible heading rather than restating it in an
       aria-label. A hand-written label that drifts from the <h3> under it means a
       screen-reader user hears one name for this region and then reads another. */
    <aside className="al-sched__aside al-on-navy" aria-labelledby={ASIDE_HEADING_ID}>
      <h3 id={ASIDE_HEADING_ID}>If your security review comes first</h3>
      <p>
        Some firms run a security review before a first call. The controls are written up
        rather than promised on the phone.
      </p>
      <Button href={SECURITY_URL} variant="inverse-secondary" size="md" withCaret>
        Read the security page
      </Button>
      <p className="al-sched__aside-note">
        The full Trust Pack, with the evidence behind each control, is sent under a
        confidentiality agreement &mdash; ask in the message and we will start one.
      </p>
    </aside>
  );
}

/**
 * The Google appointment schedule, framed.
 *
 * The iframe is rendered here and nowhere else — not in PageShell, not in SiteFooter, not
 * in any shared component. Framing Google's booking page lets Google set cookies and read
 * its own storage for whoever loads it, and someone who came to read /security/ never
 * asked for that. Confining it to the one page whose entire purpose is booking a call
 * keeps the exchange something the visitor opted into by navigating here. loading="lazy"
 * holds it back further, until it is close to the viewport.
 *
 * There is no `sandbox`: the booking page needs scripts and its own origin's storage, and
 * a sandbox that withheld either would render a frame that silently never works.
 *
 * One thing this page cannot do anything about: "Require email verification" is a paid
 * Google Calendar feature, so on the free tier anyone can book a slot with an address they
 * do not own. If junk bookings start arriving, the fix is upstream in Google — an upgrade,
 * or a shorter availability window — not a change here.
 */
function BookingEmbed({ url }: { url: string }) {
  return (
    <div className="al-sched__booking">
      <iframe
        className="al-sched__embed"
        src={bookingEmbedSrc(url)}
        title="Book a call with Autolaw"
        width="100%"
        height={700}
        loading="lazy"
        data-testid="booking-embed"
      />
      <p className="al-sched__fine">
        The calendar is Google&rsquo;s, framed in this page. If your browser blocks
        third-party frames it will stay blank &mdash;{' '}
        <a href={url}>open the booking page directly</a> and it works exactly the same way.
      </p>
      {/* Automatic reminder emails to the invitee are a paid Google Calendar feature and
          this schedule is on a free account, so the page must not imply one is coming.
          Saying so is cheaper than a missed call. */}
      <p className="al-sched__fine">
        We cannot send you a reminder before the call, so put the time in your own calendar
        while you have it open.
      </p>
    </div>
  );
}

/**
 * The qualifying form: five questions, native validation, and no pretence of submitting.
 *
 * Rendered only when there is no booking page. Google's booking form asks for the name,
 * the email, and the practice area itself, so keeping this alongside it would be asking
 * the same person the same three questions twice, on the one action the whole site is
 * pointed at.
 */
function QualifyingForm({ endpoint }: { endpoint: string | null }) {
  /*
   * Validation is the browser's: `required` and `type="email"` are the constraints, and
   * every message below is the browser's own `validationMessage`. What is added here is
   * where those messages are *shown*. The native bubble is transient, points at one field
   * at a time, and vanishes on the next keystroke — so a screen-reader user gets one
   * announcement and no way back to it. preventDefault() on the invalid event suppresses
   * that bubble; the browser still blocks the submission.
   */
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [composed, setComposed] = useState<{ href: string; preview: string } | null>(null);
  const readyRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  /*
   * The closing section's practice switch carries its choice here as `?practice=`, so the
   * first question this form asks arrives already answered. A junk or absent value
   * preselects nothing — the visitor still has to choose.
   */
  const preset = typeof window === 'undefined' ? null : practiceFromSearch(window.location.search);

  const errorList = FIELDS.filter((f) => errors[f.name]);
  const hasErrors = errorList.length > 0;

  /*
   * Focus moves in an effect, not in the submit handler: the panel does not exist until
   * React has committed the state change, and focusing a ref that is still null fails
   * silently — which is the whole class of bug this panel exists to avoid.
   */
  useEffect(() => {
    if (composed) readyRef.current?.focus();
  }, [composed]);

  /*
   * And focus moves to the error summary when a submission is rejected, because nothing
   * else moves it. The browser's "focus the first invalid control" step only considers
   * controls whose invalid event went *unhandled*, and onInvalid below cancels every one
   * of them to suppress the native bubble — so that list is empty and the browser focuses
   * nothing at all. Without this, a sighted keyboard user presses the button, sees the
   * page apparently do nothing, and has to shift-tab back through the entire form.
   *
   * The summary rather than the first bad control, because the summary names all of them.
   * Keyed on has-errors, not on the list itself: fixing one field of five must not yank
   * focus out of the field being typed in.
   */
  useEffect(() => {
    if (hasErrors) summaryRef.current?.focus();
  }, [hasErrors]);

  function onInvalid(e: FormEvent<HTMLInputElement | HTMLSelectElement>) {
    e.preventDefault();
    const el = e.currentTarget;
    setErrors((prev) => ({ ...prev, [el.name]: el.validationMessage }));
  }

  /*
   * Clearing is per-field and driven by the same constraints, so an error cannot outlive
   * the problem it describes. `validity.valid` is read rather than checkValidity() called:
   * checkValidity() fires another invalid event, which would re-add the error we are here
   * to remove.
   */
  function onFieldChange(e: FormEvent<HTMLInputElement | HTMLSelectElement>) {
    const el = e.currentTarget;
    if (el.validity.valid) {
      setErrors((prev) => {
        if (!(el.name in prev)) return prev;
        const next = { ...prev };
        delete next[el.name as FieldName];
        return next;
      });
    }
    // Any edit invalidates a message composed from the answers as they were.
    setComposed(null);
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    // Reached only once every constraint is satisfied; the browser blocks it otherwise.
    if (endpoint) return; // A real endpoint exists: let the browser POST to it.

    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const values = Object.fromEntries(FIELDS.map((f) => [f.name, String(data.get(f.name) ?? '')]));
    setErrors({});
    setComposed({ href: composeMailto(values), preview: composePreview(values) });
  }

  /** Only ids that actually render — a dangling aria-describedby is silent and destructive. */
  const describedBy = (name: FieldName, hasHint: boolean) =>
    [hasHint ? hintId(name) : null, errors[name] ? errorId(name) : null]
      .filter(Boolean)
      .join(' ') || undefined;

  return (
    <form
      className="al-sched__form"
      onSubmit={onSubmit}
      action={endpoint ?? undefined}
      method={endpoint ? 'post' : undefined}
    >
      {hasErrors && (
        /*
         * role="alert" so the summary is announced when it appears rather than only
         * being coloured. Each entry links to its control, which is the difference
         * between "something is wrong" and "here is where". tabIndex={-1} makes it the
         * target of the effect above without adding a tab stop of its own.
         */
        <div className="al-sched__summary" role="alert" ref={summaryRef} tabIndex={-1}>
          <b>
            {errorList.length === 1
              ? 'One answer needs attention:'
              : `${errorList.length} answers need attention:`}
          </b>
          <ul>
            {errorList.map((f) => (
              <li key={f.name}>
                <a href={`#${anchorFor(f.name)}`}>
                  {f.label}: {errors[f.name]}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <fieldset className="al-sched__fieldset">
        <legend>Which do you practice?</legend>
        <p className="al-sched__hint" id={hintId('practice')}>
          Personal injury and workers&rsquo; compensation run as separate workflows. This
          answer decides which workflow the call is about.
        </p>
        {errors.practice && (
          <p className="al-sched__error" id={errorId('practice')}>{errors.practice}</p>
        )}
        <div className="al-sched__radios">
          {PRACTICES.map((value, i) => (
            <div key={value} className="al-sched__radio">
              <input
                type="radio"
                id={radioId(i)}
                name="practice"
                value={value}
                required
                defaultChecked={preset === i}
                // No aria-invalid here: unlike the other fields' roles, the ARIA "radio"
                // role does not support aria-invalid (only "radiogroup" does). The error
                // is still announced via aria-describedby below and the alert summary above.
                aria-describedby={describedBy('practice', true)}
                onInvalid={onInvalid}
                onChange={onFieldChange}
              />
              <label htmlFor={radioId(i)}>{value}</label>
            </div>
          ))}
        </div>
      </fieldset>

      <div className="al-sched__row">
        <div className="al-sched__field">
          <label htmlFor={inputId('name')}>Your name</label>
          {errors.name && <p className="al-sched__error" id={errorId('name')}>{errors.name}</p>}
          <input
            id={inputId('name')}
            name="name"
            type="text"
            autoComplete="name"
            required
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={describedBy('name', false)}
            onInvalid={onInvalid}
            onChange={onFieldChange}
          />
        </div>

        <div className="al-sched__field">
          <label htmlFor={inputId('firm')}>Firm</label>
          {errors.firm && <p className="al-sched__error" id={errorId('firm')}>{errors.firm}</p>}
          <input
            id={inputId('firm')}
            name="firm"
            type="text"
            autoComplete="organization"
            required
            aria-invalid={errors.firm ? true : undefined}
            aria-describedby={describedBy('firm', false)}
            onInvalid={onInvalid}
            onChange={onFieldChange}
          />
        </div>
      </div>

      <div className="al-sched__row">
        <div className="al-sched__field">
          <label htmlFor={inputId('email')}>Work email</label>
          <p className="al-sched__hint" id={hintId('email')}>
            We reply here, so a firm address reaches you faster than a personal one.
          </p>
          {errors.email && <p className="al-sched__error" id={errorId('email')}>{errors.email}</p>}
          <input
            id={inputId('email')}
            name="email"
            type="email"
            autoComplete="email"
            required
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={describedBy('email', true)}
            onInvalid={onInvalid}
            onChange={onFieldChange}
          />
        </div>

        <div className="al-sched__field">
          <label htmlFor={inputId('volume')}>Open cases right now</label>
          <p className="al-sched__hint" id={hintId('volume')}>
            A rough range is all we need &mdash; it tells us what scale to show.
          </p>
          {errors.volume && <p className="al-sched__error" id={errorId('volume')}>{errors.volume}</p>}
          <select
            id={inputId('volume')}
            name="volume"
            defaultValue=""
            required
            aria-invalid={errors.volume ? true : undefined}
            aria-describedby={describedBy('volume', true)}
            onInvalid={onInvalid}
            onChange={onFieldChange}
          >
            <option value="" disabled>Choose a range</option>
            {VOLUMES.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="al-sched__actions">
        {/* Before the button, not after it. What the button is about to do is the last
            thing someone reads before pressing it, and a caveat underneath is a caveat
            they meet afterwards — in document order, which is the order a screen reader
            follows, that is too late to be a caveat at all. */}
        {!endpoint && (
          <p className="al-sched__fine">
            Autolaw has no form inbox yet, so this does not submit anywhere. It opens the
            message in your own mail app with the answers filled in, and nothing is sent
            until you press send there.
          </p>
        )}
        <Button type="submit" variant="primary" size="lg">
          {endpoint ? 'Request a call' : 'Compose this as an email'}
        </Button>
      </div>

      {composed && (
        /*
         * The confirmation is a destination, not a toast: the visitor still has to
         * press the link, so it has to survive being read slowly. tabIndex={-1} makes
         * it a focus target for the effect above without adding a tab stop.
         */
        <div
          className="al-sched__ready"
          role="status"
          ref={readyRef}
          tabIndex={-1}
          data-testid="composed"
        >
          <h3>Your message is ready &mdash; nothing has been sent yet</h3>
          <p>
            Open it in your mail app, check it reads the way you want, and send it from your
            own address so our reply lands in the right thread.
          </p>
          <pre className="al-sched__preview">{composed.preview}</pre>
          <div className="al-sched__ready-ctas">
            <Button href={composed.href} variant="primary" size="lg">
              Open this in your email app
            </Button>
            <p className="al-sched__fine">
              Nothing opened? Some browsers have no mail app set. Send the lines above to{' '}
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> and we will pick it up
              the same way.
            </p>
          </div>
        </div>
      )}
    </form>
  );
}

export function ScheduleCallPage() {
  /*
   * Read at render rather than at module load, so the page has one source of truth for
   * which of the three states it is in and nothing can be baked in before config is.
   */
  const bookingUrl = BOOKING_URL;
  const endpoint = CONTACT_ENDPOINT;
  const mode = scheduleMode(bookingUrl, endpoint);

  return (
    <PageShell>
      <PageHero
        eyebrow="Talk to us"
        title="Schedule a call"
        intro="Tell us which practice you run and the call follows that practice. Personal injury and workers’ compensation are separate workflows here, so the first question decides the whole conversation."
      />

      <Section
        id="what-happens"
        eyebrow="What happens next"
        heading="Three steps, and none of them is a sales sequence"
        intro={introFor(mode)}
      >
        <ol className="al-sched__steps">
          {stepsFor(mode).map((step) => (
            <li key={step.title}>
              <b>{step.title}</b>
              <span>{step.body}</span>
            </li>
          ))}
        </ol>
      </Section>

      <Section
        id="request"
        eyebrow={mode === 'booking' ? 'Pick a time' : 'Your details'}
        heading={mode === 'booking' ? 'The calendar is the form' : 'Five questions'}
        intro={
          mode === 'booking'
            ? 'The booking page asks your name, your email, and which practice you run. That is everything we need to prepare the call.'
            : 'Everything here is used to prepare the call.'
        }
      >
        <div className="al-sched__layout">
          {/*
            Every branch on this page reads `mode` and nothing else. Testing bookingUrl
            here as well would be a second copy of the priority rule, free to disagree
            with scheduleMode the day the rule changes — and the disagreement would be a
            calendar with a form underneath it asking the same three questions again.
            The `&& bookingUrl` is only there to narrow the type; scheduleMode has already
            guaranteed it is set whenever the mode is booking.
          */}
          {mode === 'booking' && bookingUrl ? (
            <BookingEmbed url={bookingUrl} />
          ) : (
            <QualifyingForm endpoint={mode === 'endpoint' ? endpoint : null} />
          )}
          <SecurityReviewAside />
        </div>
      </Section>
    </PageShell>
  );
}
