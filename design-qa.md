# Product icons and Intake — design QA

- Source visual truth: `/Users/zhongzhang/Desktop/Screenshot 2026-09-16 at 8.51.38 AM.png`
- Implementation screenshot: `/Users/zhongzhang/projects/Autolaw/docs/superpowers/evidence/product-menu-icons-desktop.jpg`
- Home-card screenshot: `/Users/zhongzhang/projects/Autolaw/docs/superpowers/evidence/product-cards-icons-desktop.jpg`
- Intake-page screenshot: `/Users/zhongzhang/projects/Autolaw/docs/superpowers/evidence/intake-page-desktop.jpg`
- Same-input comparison: `/Users/zhongzhang/projects/Autolaw/docs/superpowers/evidence/product-menu-reference-comparison.png`
- Browser state: desktop home page, Product dropdown open by hover
- CSS viewport: 1280 × 720; device pixel ratio: 2
- Source pixels: 1344 × 518
- Implementation capture pixels: 1265 × 712 (browser capture output)
- Density normalization: the reference remained at 1344 × 518; the implementation menu region was cropped to 850 × 550 and scaled proportionally to 518px high for the combined comparison.

## Findings

No actionable P0, P1, or P2 differences remain.

- Typography: the implementation keeps Autolaw's established type family, weights, and compact menu scale. Phase headings, feature names, and availability labels remain legible without truncation.
- Spacing and layout rhythm: the two phase columns align, 34px icon tiles sit on a consistent 42px row rhythm, and all ten Pre-Litigation entries fit inside the 720px viewport without clipping. The denser rhythm is intentional because Autolaw presents more individual destinations than the reference.
- Colors and visual tokens: the reference's dark palette was not copied. The implementation deliberately uses Autolaw's cream, white, navy, and teal tokens while preserving the reference's icon-tile hierarchy.
- Image and icon fidelity: every feature uses a real Phosphor outline icon. No emoji, text glyph, custom inline SVG, CSS drawing, or placeholder asset is used. The icons remain crisp at menu, card, and hero sizes.
- Copy and content: Intake is first in Pre-Litigation and marked live. Accident & Injury Illustrations remains labelled Early access; Discovery Responses and Deposition Review remain labelled Coming next and inert.
- Interaction: hover and click open the Product menu, and the Intake link navigates to `/product/intake/`. The browser console showed no errors.

## Full-view comparison evidence

The desktop implementation screenshot confirms the dropdown stays within the viewport, does not obscure the header controls, and preserves the existing Autolaw page composition behind it.

## Focused-region comparison evidence

The combined comparison places the supplied EvenUp menu crop and the Autolaw menu region in one image. Both use a repeated icon tile plus label pattern. Autolaw intentionally uses smaller tiles and tighter rows to accommodate its larger feature set while retaining a clear visual scan path.

## Open questions

None.

## Implementation checklist

- [x] Intake appears first under Pre-Litigation.
- [x] Intake has a live linked card and standalone page.
- [x] Every product has a shared semantic icon.
- [x] Icons render in the dropdown, home cards, and feature-page heroes.
- [x] Availability labels and non-link states remain intact.
- [x] Desktop interaction and destination navigation were exercised in-browser.

## Comparison history

The first comparison found no actionable P0/P1/P2 mismatch. No visual fix loop was required.

## Follow-up polish

No P3 follow-up is required for this pass.

final result: passed
