import { useEffect, useRef, useState, type FormEvent } from 'react';
import { PageShell } from '../PageShell';
import { PageHero } from '../PageHero';
import { Section } from '../../components/primitives/Section';
import { Button } from '../../components/primitives/Button';
import { CONTACT_EMAIL, CONTACT_ENDPOINT, SECURITY_URL } from '../../config';
import './ScheduleCallPage.css';

/**
 * The questions, in the order they are asked and in the order they appear in the composed
 * message. Practice area is first because it is not a demographic — personal injury and
 * workers' compensation are separate products, so the answer decides which conversation
 * this becomes. Asking it after the name would be asking it after we had already guessed.
 */
const FIELDS = [
  { name: 'practice', label: 'Practice area' },
  { name: 'name', label: 'Name' },
  { name: 'firm', label: 'Firm' },
  { name: 'email', label: 'Work email' },
  { name: 'volume', label: 'Open cases' },
] as const;

type FieldName = (typeof FIELDS)[number]['name'];

const PRACTICES = ['Personal injury', 'Workers’ compensation', 'Both'];

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

export function ScheduleCallPage() {
  /*
   * Validation is the browser's: `required` and `type="email"` are the constraints, and
   * every message below is the browser's own `validationMessage`. What is added here is
   * where those messages are *shown*. The native bubble is transient, points at one field
   * at a time, and vanishes on the next keystroke — so a screen-reader user gets one
   * announcement and no way back to it. preventDefault() on the invalid event suppresses
   * only that bubble; the browser still blocks the submission and still moves focus to the
   * first offending control.
   */
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [composed, setComposed] = useState<{ href: string; preview: string } | null>(null);
  const readyRef = useRef<HTMLDivElement>(null);

  /*
   * Focus moves in an effect, not in the submit handler: the panel does not exist until
   * React has committed the state change, and focusing a ref that is still null fails
   * silently — which is the whole class of bug this panel exists to avoid.
   */
  useEffect(() => {
    if (composed) readyRef.current?.focus();
  }, [composed]);

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
    if (CONTACT_ENDPOINT) return; // A real endpoint exists: let the browser POST to it.

    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const values = Object.fromEntries(FIELDS.map((f) => [f.name, String(data.get(f.name) ?? '')]));
    setErrors({});
    setComposed({ href: composeMailto(values), preview: composePreview(values) });
  }

  const errorList = FIELDS.filter((f) => errors[f.name]);

  /** Only ids that actually render — a dangling aria-describedby is silent and destructive. */
  const describedBy = (name: FieldName, hasHint: boolean) =>
    [hasHint ? hintId(name) : null, errors[name] ? errorId(name) : null]
      .filter(Boolean)
      .join(' ') || undefined;

  return (
    <PageShell>
      <PageHero
        eyebrow="Talk to us"
        title="Schedule a call"
        intro="Tell us which practice you run and the call follows that practice. Personal injury and workers’ compensation are separate products here, so the first question decides the whole conversation."
      />

      <Section
        id="what-happens"
        eyebrow="What happens next"
        heading="Three steps, and none of them is a sales sequence"
        intro="There is no booking calendar on this page yet, so this is handled by email — which has one advantage: you can see exactly what gets sent."
      >
        <ol className="al-sched__steps">
          <li>
            <b>You send the message</b>
            <span>
              Your own mail app opens with these answers filled in. You press send, so nothing
              leaves your machine that you have not read.
            </span>
          </li>
          <li>
            <b>We reply within one business day</b>
            <span>With times that fit your week, and the name of who you will be talking to.</span>
          </li>
          <li>
            <b>The call follows your practice area</b>
            <span>
              A workers&rsquo; compensation firm never sits through a personal injury demo. That
              is what the first question below is for.
            </span>
          </li>
        </ol>
      </Section>

      <Section
        id="request"
        eyebrow="Your details"
        heading="Five questions"
        intro="Everything here is used to prepare the call and nothing else."
      >
        <div className="al-sched__layout">
          <form
            className="al-sched__form"
            onSubmit={onSubmit}
            action={CONTACT_ENDPOINT ?? undefined}
            method={CONTACT_ENDPOINT ? 'post' : undefined}
          >
            {errorList.length > 0 && (
              /*
               * role="alert" so the summary is announced when it appears rather than only
               * being coloured. Each entry links to its control, which is the difference
               * between "something is wrong" and "here is where".
               */
              <div className="al-sched__summary" role="alert">
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
                Personal injury and workers&rsquo; compensation are built separately. This answer
                decides which product the call is about.
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
                      aria-invalid={errors.practice ? true : undefined}
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
              <Button type="submit" variant="primary" size="lg">
                {CONTACT_ENDPOINT ? 'Request a call' : 'Compose this as an email'}
              </Button>
              {!CONTACT_ENDPOINT && (
                <p className="al-sched__fine">
                  Autolaw has no form inbox yet, so this does not submit anywhere. It opens the
                  message in your own mail app with the answers filled in, and nothing is sent
                  until you press send there.
                </p>
              )}
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

          {/* al-on-navy flips the inherited --al-ring: the default teal-on-canvas ring is
              2.68:1 against this panel and effectively invisible. */}
          <aside className="al-sched__aside al-on-navy" aria-label="Before the call">
            <h3>If security reviews first</h3>
            <p>
              Some firms run a security review before a first call. The controls are written up
              rather than promised on the phone.
            </p>
            <Button href={SECURITY_URL} variant="inverse-secondary" size="md" withCaret>
              Read the security page
            </Button>
            <p className="al-sched__aside-note">
              The SOC&nbsp;2 Type&nbsp;II report is available under NDA and a BAA is signed on
              request &mdash; ask in the message and we will have both ready.
            </p>
          </aside>
        </div>
      </Section>
    </PageShell>
  );
}
