import { PageShell } from '../PageShell';
import { PageHero } from '../PageHero';
import { Section } from '../../components/primitives/Section';
import { Button } from '../../components/primitives/Button';
import { CONTACT_EMAIL, SCHEDULE_URL, SECURITY_URL } from '../../config';
import './AboutPage.css';

/*
 * ---------------------------------------------------------------------------
 * OWNER SLOTS — the three things this page cannot say until someone who was
 * there writes them. Each is empty, and each section renders nothing while it
 * is empty, following the CUSTOMER_LOGOS pattern in src/config.ts: an absent
 * asset shows as absence, never as a placeholder.
 *
 * Filling one in is the whole edit — no JSX change is needed.
 * ---------------------------------------------------------------------------
 */

/**
 * OWNER SLOT — company story. Why Autolaw was started, by whom, and what they saw that
 * made it worth building. Prose paragraphs; one string per paragraph.
 *
 * Deliberately empty rather than drafted. A founding story invented by a contractor is
 * the one piece of copy an attorney can catch you on, because the person it describes
 * will eventually be in the room.
 */
export const STORY: ReadonlyArray<string> = [];

/**
 * OWNER SLOT — team. `name` and `role` only; no photographs until there are real ones
 * and permission to use them.
 */
export const TEAM: ReadonlyArray<{ name: string; role: string }> = [];

/**
 * OWNER SLOT — careers. `url` should be the actual application destination; a role with
 * nowhere to apply is worse than no listing.
 */
export const OPEN_ROLES: ReadonlyArray<{ title: string; location: string; url: string }> = [];

const PRINCIPLES = [
  {
    title: 'Every fact cites where it came from',
    body: 'A fact in an Autolaw case file names the document, the page, and the sentence it came from, and one click opens it. A summary you cannot check is a summary you have to redo.',
  },
  {
    title: 'Disagreements stay visible',
    body: 'When two records disagree, both stay on the page with their dates and sources. Picking one silently is the failure mode that makes a tool unusable for a chronology a defense expert will be deposed on.',
  },
  {
    title: 'A finding with no source stays separate',
    body: 'Anything without support in the record is kept apart from what has it, and labeled. Mixing the two is how an unsupported line ends up in a demand letter.',
  },
];

export function AboutPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="About"
        title="What Autolaw is"
        intro={
          <>
            Autolaw is case intelligence for personal injury and workers&rsquo; compensation
            firms. It reads what is already in a matter &mdash; intake calls, medical records,
            expert reports &mdash; and builds one connected case file in which every fact cites
            the document, page, and sentence it came from.
          </>
        }
      />

      <Section
        id="how"
        eyebrow="What we build"
        heading="A case file you can check"
        intro="Three commitments describe the product more precisely than any adjective, because each one is a behavior you can watch it perform."
      >
        <div className="al-about__grid">
          {PRINCIPLES.map((p) => (
            <div key={p.title} className="al-about__card">
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section
        id="practices"
        eyebrow="Practice areas"
        heading="Two practices, two products"
        intro="Personal injury and workers’ compensation look adjacent from outside the work. They are not, and building one product for both would mean building neither."
      >
        <div className="al-about__pair">
          <div className="al-about__card">
            <h3>Personal injury</h3>
            <p>
              A case built on liability, causation, and damages, assembled out of the treatment history. The
              chronology has to survive a defense expert reading it line by line.
            </p>
          </div>
          <div className="al-about__card">
            <h3>Workers&rsquo; compensation</h3>
            <p>
              A claim governed by a state system with its own forms, its own deadlines, and its
              own definition of what counts. Compensability turns on facts a personal injury
              file does not even collect.
            </p>
          </div>
        </div>
        <p className="al-about__note">
          So they are set up as two products with their own intake, their own screens, and their
          own outputs &mdash; not one product with the labels swapped. It is more work, and it is
          the difference between a tool that fits the practice and a demo that impresses.
        </p>
      </Section>

      <Section
        id="principle"
        tone="navy"
        eyebrow="The principle"
        heading="Autolaw proposes. An attorney confirms."
        intro="This is the one design decision everything else in Autolaw follows from, so it is worth stating plainly."
      >
        <p className="al-about__lede">
          Autolaw reads a document and proposes a value. It never writes case truth on its own.
          An attorney confirms each value before it counts as a fact.
        </p>
        <p className="al-about__lede al-about__lede--muted">
          The reason is legal, not technical. Establishing date of injury, employer, and claim
          status carries statute-of-limitations and jurisdictional consequences &mdash; a value
          that decides whether a claim is still alive, and where it can be brought, is not
          something software gets to assert. A product that quietly recorded its own guesses
          would be faster, right up until the first time it was wrong about a date.
        </p>
        <p className="al-about__more">
          <Button href={SECURITY_URL} variant="inverse-secondary" size="md" withCaret>
            How this is enforced
          </Button>
        </p>
      </Section>

      {/*
        The three owner slots. Each renders only when its data exists — see the exported
        constants at the top of this file. Nothing here needs editing to fill one in.
      */}

      {STORY.length > 0 && (
        <Section id="story" eyebrow="Our story" heading="Why we built this">
          <div className="al-about__story">
            {STORY.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </Section>
      )}

      {TEAM.length > 0 && (
        <Section id="team" eyebrow="Team" heading="Who builds Autolaw">
          <ul className="al-about__team">
            {TEAM.map((member) => (
              <li key={member.name}>
                <b>{member.name}</b>
                <span>{member.role}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {OPEN_ROLES.length > 0 && (
        <Section id="careers" eyebrow="Careers" heading="Open roles">
          <ul className="al-about__roles">
            {OPEN_ROLES.map((role) => (
              <li key={role.title}>
                <a href={role.url}>{role.title}</a>
                <span>{role.location}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section
        id="talk"
        eyebrow="Talk to us"
        heading="The fastest way to judge this is on your own file"
        intro="Tell us which practice you run and the conversation follows that practice — personal injury and workers’ compensation are set up separately."
      >
        <div className="al-about__ctas">
          <Button href={SCHEDULE_URL} variant="primary" size="lg" withCaret>
            Schedule a call
          </Button>
          {/* "Email us", not "Talk to us": the link opens a mail client, and this reader
              would rather be told that than discover it. */}
          <Button href={`mailto:${CONTACT_EMAIL}`} variant="secondary" size="lg">
            Email us
          </Button>
        </div>
      </Section>
    </PageShell>
  );
}
