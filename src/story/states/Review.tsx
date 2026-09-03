import { REVIEW_ITEM, SAMPLE_MARK } from '../../data/demoCase';
import './states.css';

/** State 6. The review queue with one fact in it. Buttons are labels here: nothing on this
 *  page confirms anything, and a focusable inert "Confirm" would be a lie. */
export function Review() {
  return (
    <div className="al-state al-review" data-testid="state-review">
      <div className="al-state__top">
        <div>
          <div className="al-state__case">Review queue</div>
          <div className="al-state__meta">Needs review · 1</div>
        </div>
        <span className="al-state__mark">{SAMPLE_MARK}</span>
      </div>

      <div className="al-review__item">
        <div className="al-review__row">
          <span className="al-review__status">{REVIEW_ITEM.status}</span>
          <span className="al-review__cite">{REVIEW_ITEM.source} · {REVIEW_ITEM.page}</span>
        </div>
        <b className="al-review__title">{REVIEW_ITEM.title}</b>
        <p className="al-review__value">{REVIEW_ITEM.value}</p>
        <div className="al-review__conf">
          <span>Extraction confidence</span>
          <span className="al-conf al-conf--inverse"><span className="al-conf__fill" style={{ width: `${REVIEW_ITEM.confidence}%` }} /></span>
          <span>{REVIEW_ITEM.confidence}%</span>
        </div>
        <div className="al-review__actions" aria-label="What the reviewer can do">
          <span className="al-review__btn al-review__btn--go">Confirm</span>
          <span className="al-review__btn">Dismiss</span>
        </div>
      </div>

      <p className="al-review__note">
        Nothing above is in the case yet. It becomes a fact when a person presses Confirm.
      </p>
    </div>
  );
}
