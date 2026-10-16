import { PageShell } from '../PageShell';
import { PageHero } from '../PageHero';
import { Section } from '../../components/primitives/Section';
import { BLOG_URL } from '../../config';
import { POSTS_BY_DATE, formatPublished } from '../../data/blog';
import './BlogPages.css';

/* Copy lives in src/data/blog.ts. This file is layout only. */
export function BlogIndexPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Blog"
        title="Notes from the file room"
        intro="What we learn building case intelligence for plaintiff firms, and what we think a firm should ask of anyone who wants access to its records."
      />
      <Section id="posts" heading="Latest">
        <ul className="al-blog__list">
          {POSTS_BY_DATE.map((post) => (
            <li key={post.slug}>
              {/* The whole card is the link, so the target is the card rather than three
                  words at the bottom of it. */}
              <a className="al-blog__card" href={`${BLOG_URL}${post.slug}/`}>
                <p className="al-blog__meta">
                  <time dateTime={post.published}>{formatPublished(post.published)}</time>
                  <span aria-hidden="true">·</span>
                  <span>{post.readingMinutes} min read</span>
                </p>
                <span className="al-blog__title">{post.title}</span>
                <span className="al-blog__dek">{post.dek}</span>
                <span className="al-blog__more">
                  Read it <i aria-hidden="true">→</i>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </Section>
    </PageShell>
  );
}
