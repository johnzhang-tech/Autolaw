import { PageShell } from '../PageShell';
import { PageHero } from '../PageHero';
import { Section } from '../../components/primitives/Section';
import { Button } from '../../components/primitives/Button';
import { BLOG_URL, SCHEDULE_URL } from '../../config';
import { findPost, formatPublished } from '../../data/blog';
import './BlogPages.css';

/**
 * One component for every post, fed by slug — the FeaturePage arrangement, for the same
 * reason: a post that brings its own JSX brings its own heading levels and its own
 * measure, and the second one always disagrees with the first.
 *
 * The body is one column of prose rather than a stack of banded sections. An article is
 * read top to bottom; section bands are for a page that is scanned.
 */
export function PostPage({ slug }: { slug: string }) {
  const post = findPost(slug);

  return (
    <PageShell>
      <PageHero eyebrow="Blog" title={post.title} intro={post.dek}>
        <p className="al-blog__meta">
          <time dateTime={post.published}>{formatPublished(post.published)}</time>
          <span aria-hidden="true">·</span>
          <span>{post.readingMinutes} min read</span>
        </p>
      </PageHero>

      <Section id="article">
        <article className="al-post">
          {post.intro.map((paragraph) => (
            <p key={paragraph} className="al-post__lead">{paragraph}</p>
          ))}

          {post.sections.map((section) => (
            <div key={section.id} id={section.id} className="al-post__block">
              <h2>{section.heading}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {section.points && (
                <ul className="al-post__points">
                  {section.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}

          <div className="al-post__close">
            {post.close.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <div className="al-post__end">
            <Button href={SCHEDULE_URL} variant="primary" size="md" withCaret>Schedule a call</Button>
            <a className="al-post__back" href={BLOG_URL}>All posts</a>
          </div>
        </article>
      </Section>
    </PageShell>
  );
}
