/**
 * The blog, as data.
 *
 * Same contract as src/data/product.ts: a post is a record here, never JSX in a page
 * component. Writing a post means adding an entry and a route; the layout is already
 * written, so no post can quietly acquire its own typography or its own idea of what a
 * heading level means.
 *
 * Every sentence a post ships passes the claim guard in src/__tests__/claims.test.tsx,
 * which is the reason several of the questions below are phrased as "ask for the report"
 * rather than "ask whether they are certified" — the shorter phrasing is the one that is
 * not true of anybody, Autolaw included.
 *
 * There is no author field. Posts are published by the firm, not by an invented person,
 * for the same reason CUSTOMER_LOGOS is empty: a byline nobody stands behind is the kind
 * of small fiction that costs the whole page its credibility.
 */

export interface PostSection {
  /**
   * The fragment this section answers to. A checklist gets quoted a question at a time,
   * so each one is addressable: /blog/<slug>/#refusals rather than "scroll to the
   * fourth". Written here rather than derived from the heading, which would change a
   * published URL every time the wording is edited.
   */
  id: string;
  /** Rendered as the <h2>. Written as the question a firm would actually ask. */
  heading: string;
  body: ReadonlyArray<string>;
  /** The "what a good answer sounds like" list. Optional: not every section earns one. */
  points?: ReadonlyArray<string>;
}

export interface Post {
  slug: string;
  title: string;
  /** The standfirst, one sentence, shown on the index and under the title on the post. */
  dek: string;
  /** ISO date. Rendered through toLocaleDateString, never hand-formatted per page. */
  published: string;
  readingMinutes: number;
  intro: ReadonlyArray<string>;
  sections: ReadonlyArray<PostSection>;
  /** The last word. Kept separate from `sections` because it carries no heading. */
  close: ReadonlyArray<string>;
  meta: { title: string; description: string };
}

export const POSTS: ReadonlyArray<Post> = [
  {
    slug: 'evaluating-ai-case-intelligence',
    title: 'Eight questions to ask an AI vendor before your files go in',
    dek: 'A plaintiff firm gets one shot at each case. Here is how to tell a tool that earns that risk from one that only demonstrates well.',
    published: '2026-10-15',
    readingMinutes: 7,
    intro: [
      'Every AI demo for a plaintiff firm looks the same from the outside. A thousand-page file goes in, a tidy chronology comes out, and the room is impressed. The demo is not the thing you are buying. What you are buying is what happens on the file the vendor did not choose — the one with two conflicting operative reports, a six-month treatment gap nobody explained, and a records custodian who sent the wrong patient.',
      'These are the eight questions that separate the two. None of them are about the model. They are about what the tool can show you, what it refuses to do, and what the vendor will put in writing.',
    ],
    sections: [
      {
        id: 'sources',
        heading: 'Can it show you where every fact came from?',
        body: [
          'A summary you cannot check is a summary you have to re-read the file to trust, which means it saved you nothing. The question is not whether the tool cites sources — most say they do — but how precisely, and how fast you can get from the claim to the page.',
          'Ask to click a single number in the demo. Watch whether it lands you on the document and the line, or on a 400-page PDF and a search box.',
        ],
        points: [
          'Every fact resolves to a document, a page, and the sentence it came from.',
          'The link works from inside the export, not only inside the vendor’s own viewer.',
          'A fact with no source is shown as having no source, rather than quietly omitted.',
        ],
      },
      {
        id: 'contradictions',
        heading: 'What happens when the record disagrees with itself?',
        body: [
          'Real files contradict themselves constantly. The treating physician and the defense examiner describe different injuries. An intake form says one accident date and the ambulance run sheet says another. A tool that resolves these silently has made a litigation decision on your behalf, and you will not find out which one until a deposition.',
          'The honest behaviour is to surface both sources and let an attorney decide. Ask to see that screen. If it does not exist, the tool is averaging your evidence.',
        ],
      },
      {
        id: 'processors',
        heading: 'Who sees your client’s records, and do they learn from them?',
        body: [
          'Almost every tool in this category sends document text to a third-party model provider. That is not disqualifying, but it is a fact your client’s file deserves an answer about, and the answer is rarely on the marketing page.',
          'ABA Formal Opinion 512 (July 2024) asks lawyers to understand how a generative AI tool handles client information before using it. That is a professional obligation you cannot delegate to a vendor’s assurance, so ask for the list.',
        ],
        points: [
          'A named list of every provider that receives document text, and what each one gets.',
          'The contractual terms under which those providers hold it, in writing.',
          'Whether the vendor trains models on your case content, and whether its providers may.',
          'Which connections and which stores are encrypted, with evidence for each, rather than one sentence covering everything.',
        ],
      },
      {
        id: 'refusals',
        heading: 'What does it refuse to do?',
        body: [
          'This is the most informative question in the list, and the one vendors least expect. A tool built by people who understand the stakes has a list of things it will not do: it will not state a fact the record does not support, it will not fill a gap with a plausible guess, it will not let a draft leave the building without a human approving it.',
          'A vendor who cannot name a single refusal has either not thought about failure or does not want to discuss it. Both are answers.',
        ],
      },
      {
        id: 'separation',
        heading: 'How is one firm’s file kept away from another’s?',
        body: [
          'Multi-tenant software keeps every customer’s data in the same system. Separation is a property of the code, not of the pitch, and it is the single failure with the worst consequences in this industry: your opposing counsel may be a customer of the same vendor.',
          'Ask how the boundary is enforced, where it has been tested, and what is logged when someone opens a document.',
        ],
      },
      {
        id: 'pricing',
        heading: 'What does it cost when the file is two thousand pages?',
        body: [
          'Record-review pricing is where the economics of plaintiff work get decided. Per-page and per-document billing sounds reasonable until the catastrophic-injury case — the one worth the most — becomes the one you can least afford to analyse properly.',
          'Get the price of your largest open file, not the average one. A pricing model that punishes your best cases will change which cases you work up, and you will not notice it happening.',
        ],
      },
      {
        id: 'confirmation',
        heading: 'Does an attorney still confirm every fact before it counts?',
        body: [
          'There is a meaningful difference between a tool that proposes and a tool that decides. The first produces candidate facts an attorney confirms, and the case file reflects what a human accepted. The second writes to the record directly and leaves you auditing it afterwards, usually under deadline.',
          'Ask where confirmation happens in the workflow, and what the file looks like before anyone has confirmed anything.',
        ],
      },
      {
        id: 'in-writing',
        heading: 'What will they give you in writing?',
        body: [
          'The last question is the cheapest to ask and the hardest to fake. Security claims that exist only in a sales conversation are worth what you paid for them.',
          'Note what an honest vendor says when something is not ready yet: a date and a plan beat a reassuring adjective. A vendor who tells you an audit is in progress and names the quarter is being more useful than one who implies the audit is finished.',
        ],
        points: [
          'A subprocessor list, naming each vendor and what it receives.',
          'A written answer on AI data use, model training, and retention.',
          'The audit report if it exists, or the date one is expected if it does not.',
          'Notice before the list of subprocessors changes.',
        ],
      },
    ],
    close: [
      'None of these questions are about whether the AI is good. They are about whether the tool makes its own work checkable, which is the only property that matters when the opposing expert is reading the same records you are.',
      'Bring the ugliest file you have to the next demo. The vendor who welcomes it is the one to keep talking to.',
    ],
    meta: {
      title: 'Eight questions to ask an AI case-intelligence vendor — Autolaw',
      description:
        'A practical checklist for plaintiff firms evaluating AI tools for medical records and case files: source-linked facts, contradictions, subprocessors, refusals, firm separation, pricing on large files, and what the vendor will put in writing.',
    },
  },
];

/** Newest first. The index and the sitemap both read this, so they cannot disagree. */
export const POSTS_BY_DATE: ReadonlyArray<Post> = [...POSTS].sort((a, b) =>
  b.published.localeCompare(a.published)
);

export function findPost(slug: string): Post {
  const post = POSTS.find((p) => p.slug === slug);
  if (!post) throw new Error(`No blog post with slug "${slug}"`);
  return post;
}

/**
 * One spelling of the date, everywhere. `published` is a bare ISO day, so it is parsed as
 * UTC and formatted in UTC — formatting it in the reader's zone would show the previous
 * day to anyone west of Greenwich.
 */
export function formatPublished(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}
