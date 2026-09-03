/**
 * The seven chapters of the story. Chapter 0 is the hero (state "Signals") and has no
 * block of its own. Ids double as anchor targets, so they must stay unique across the page.
 */
export type ChapterIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface Chapter {
  index: Exclude<ChapterIndex, 0>;
  id: string;
  heading: string;
  body: string;
}

export const CHAPTERS: ReadonlyArray<Chapter> = [
  {
    index: 1,
    id: 'story-arrives',
    heading: '214 documents, out of order',
    body: 'Records arrive continuously and never in sequence. Autolaw reads each one as it lands and files it by what it is, not by when it turned up.',
  },
  {
    index: 2,
    id: 'story-connected',
    heading: 'One timeline, every fact cited',
    body: 'Each event names the document, the page, and the sentence it came from. Select one and the source opens beside it.',
  },
  {
    index: 3,
    id: 'story-conflict',
    heading: 'Both records stay visible',
    body: 'The PTP released him to modified duty on 04/02. The QME on 04/18 says temporarily totally disabled. Autolaw does not pick a winner.',
  },
  {
    index: 4,
    id: 'story-missing',
    heading: 'Referenced, never produced',
    body: 'Two reports cite an MRI. No imaging report is in the file. Autolaw lists it as needed rather than inferring what it says.',
  },
  {
    index: 5,
    id: 'story-ask',
    heading: 'Answers only from the file',
    body: 'Ask a question and every sentence of the answer cites its source. Ask for what is not there and it says so.',
  },
  {
    index: 6,
    id: 'story-confirm',
    heading: 'An attorney decides',
    body: 'Autolaw proposes. It never writes case truth on its own. Date of injury, employer, and claim status carry statute-of-limitations consequences, so a person confirms each one.',
  },
  {
    index: 7,
    id: 'story-output',
    heading: 'What leaves the system',
    body: 'A chronology you can check, a list of what is missing, and a readiness score — exported only once a person has approved what is in it.',
  },
];
