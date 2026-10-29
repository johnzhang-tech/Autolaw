# What to charge for a report

Date: 2026-10-28
Status: research and recommendation, awaiting a decision

## 1. The constraint nobody wrote down

The original brief proposed per-report prices: roughly $39–49 for a medical
chronology, $99 for a Howell analysis, $129–149 for a QME/AME review.

**That cannot be billed today.** case-app sells undifferentiated credits. A pack
(`apps/server/src/billing/reportPacks.ts`) grants 1, 5, or 10 credits; a report consumes
one; and nothing in `packages/shared/src/reports-tier.ts` or the billing code assigns a
different cost to a different report type. A QME/AME memo and a chronology debit the same
single credit.

So there are two routes, and they are not equivalent:

- **One blended credit price**, decided now, shipping now. This is what the rest of this
  document recommends.
- **Per-type credit weights** — a chronology costs one credit, a QME/AME two — which is a
  small, clean change to the debit path and a larger change to every surface that says
  "1 credit". It belongs in the product backlog, not in this release.

Pricing the credit blended is not a compromise on the way to per-type pricing. It is
simpler to explain, it is what the firm actually wants to hear ("what does a report
cost"), and it stops a paralegal having to know which report is dearer before they order.

## 2. What the market pays

Figures are from vendor and comparison sites, most of which are selling something. Treat
them as a range, not a benchmark. Sources are listed at the end.

| What a firm buys today | Typical price | For a 500-page file |
| --- | --- | --- |
| Outsourced human chronology, per page | $1.50–4.00/page | $750–2,000 |
| Outsourced human chronology, per hour | $25–35/hour | $175–230 |
| Rush / physician-overseen review | $2.50–7.00/page, or $35–75/hour | $1,250–3,500 |
| Self-service AI extraction tool, per page | $0.05–0.10/page | $25–50 |
| AI demand package (EvenUp) | ~$300 base, $500–800 all-in | — |
| PI AI platform subscription (Supio, est.) | $150–400/user/month | — |
| Paralegal time billed out | median $120/hour | — |

The gap in that table is the whole opportunity. There is a category at $25–50 that
produces an extraction a paralegal must then check line by line, and a category at
$750–2,000 that produces a work product an attorney can rely on. **There is very little
in between, and that is exactly where Autolaw's output sits**: citations to document,
page and sentence, conflicts reproduced rather than resolved, missing records named, and
an ops review before release.

## 3. What a report costs us

Two cost regimes, because `reports_auto_release` is granted per firm
(`packages/shared/src/reports-tier.ts`). Without it every finished report lands in
`in_review` and a human releases it; with it, the three launched types release themselves.

Model cost, for a 1,000-page order on the current mixed Gemini pipeline
(`gemini-3.5-flash` and `gemini-3.1-pro-preview` dominate the call sites):

- Document understanding runs roughly 258 tokens per PDF page, so one pass over 1,000
  pages is about 0.26M input tokens. A real pipeline — classification, extraction,
  assembly, conflict detection, citation checking — makes several effective passes over
  the record and its subsets. Call it 1.5M input tokens.
- At Flash rates (~$0.75/M in, ~$3.75/M out) that is about $1.15 in, plus perhaps $0.20
  of output. At Pro rates (~$2/M in, ~$12/M out, both roughly doubling above a 200K
  context) the same work is $3–6 in and $0.40–1.10 out.
- **Model cost per report: roughly $2–8.** Flash-heavy work sits at the bottom of that
  range, Pro-heavy synthesis at the top. Batch pricing would roughly halve it.

Human cost:

- **Auto-release firm: $0.** The report ships when the pipeline finishes.
- **Ops-reviewed firm: $12–45**, assuming 20–45 minutes of a trained reviewer at a
  $35–60/hour loaded rate.

| Regime | Marginal cost per report |
| --- | --- |
| Auto-release | **$2–8** |
| Ops review | **$15–55** |

The second number is the one that matters, because ops review is the default and
auto-release is the exception. **Any price that only works under auto-release is a price
that loses money on every new firm**, which is precisely the firm you most want to keep.

## 4. The decision: $49, and what has to be true for it to work

The owner chose to stay near $49 on 2026-10-28, against the $149 this document
originally argued for. The case for $149 is kept in section 6 so the trade is on the
record. This section is about making $49 work, because it can — but only under
conditions that are not currently met.

### What $49 earns, per report

Assumptions: a typical first order of 500–800 pages; model cost ~$3; storage, OCR and
infrastructure ~$1; ops review costed throughout as minutes × a $45/hour loaded rate
(so 30 minutes is $22.50, not a rounded $25); Stripe at
2.9% + $0.30 on the pack, divided across its credits; a 50% chance records arrive inside
the free window; and a refresh re-review costed at **40% of the initial review**, because
the reviewer is checking what the new records changed rather than re-reading all 84
entries.

| Scenario | Price | Cost | Margin |
| --- | ---: | ---: | ---: |
| Single, auto-release, no refresh | $49 | $5.72 | **$43.28 (88%)** |
| Single, auto-release, 50% refresh | $49 | $7.22 | **$41.78 (85%)** |
| Single, 30 min review, no refresh | $49 | $28.22 | $20.78 (42%) |
| Single, 30 min review, 50% refresh | $49 | $34.22 | $14.78 (30%) |
| 10-pack at $36, auto-release, 50% refresh | $36 | $6.57 | **$29.43 (82%)** |
| 10-pack at $36, 30 min review, 50% refresh | $36 | $33.57 | $2.43 (7%) |
| 10-pack at $45, 30 min review, 50% refresh | $45 | $33.84 | $11.16 (25%) |
| Single, 45 min review, 1,900-page file | $49 | $57.72 | **−$8.72 (−18%)** |

### Read this table knowing which number is load-bearing

Of the $28.22 in the third row, **$22.50 is the ops review, and it is a guess**: 30
minutes at a $45/hour loaded rate, with no measurement behind either figure. Everything
else is comparatively solid, and comparatively irrelevant — taking model cost from $3 to
$8 moves the margin by $7.50, doubling the Stripe fee moves it by $1.72. The review line
is 81% of the cost and 100% of the uncertainty.

So the honest version of this table is a sensitivity surface, not a row. Margin at $49,
holding the 50% refresh and the 40% delta:

| Initial review | $20/hr | $30/hr | $45/hr | $65/hr |
| --- | ---: | ---: | ---: | ---: |
| none (auto-release) | 85% | 85% | 85% | 85% |
| 10 min | 77% | 73% | 67% | 59% |
| 20 min | 69% | 61% | 49% | 32% |
| 30 min | 61% | 49% | **30%** | 6% |
| 45 min | 49% | 30% | 3% | −34% |
| 60 min | 36% | 12% | −25% | −74% |

Break-even review time: **104 minutes** at $20/hour, **70** at $30, **46** at $45, **32**
at $65. Who performs the review therefore matters more than how long they take, and both
are measurable in a fortnight.

### Three corrections to the first version of this table

The 9% figure published for "single, ops review + refresh" was wrong. It charged a full
second review for a refresh, as though the reviewer re-read the whole report rather than
the delta. At 40% of the initial review that row is 30%.

The review line was also a rounded $25 while being described as 30 minutes at $45/hour,
which is $22.50. Small on its own, but it was applied to every row and it made the two
tables on this page disagree with each other. Review is now minutes × rate throughout.

Together those two corrections move the deep-discount ten-pack from −22% to **+7%**,
which weakens the case against deep discounts without overturning it: $36 a report earns
7% under a 30-minute review, $45 earns 25%. The argument for shallow discounts is now
"this is not margin worth giving away", not "this loses money".

The claim that a case with a chronology and a Howell live "gets two free re-runs and two
re-reviews, and that is the difference between the 37% row and the 9% row" was also
wrong, in a way worth naming. `planOrderCharges` does re-run every live report, but each
of those reports sold its own credit, so per report the exposure is one refresh — which
is exactly what the 50% figure already models. The multi-report effect raises the cost
per *case* and leaves the cost per *report* alone, and these rows are per report.

What survives all three corrections: auto-release is 82–88% and every reviewed scenario
is a fraction of it; a 1,900-page file under review is still a real loss at −18%; and the
whole page still turns on a number nobody has measured.

### The three conditions

**1. Auto-release has to be the default, not the reward.** This is the whole decision.
`reports_auto_release` is a per-firm capability row, so today a new firm's reports land
in `in_review` and a person releases them. At $149 that person is affordable. At $49
they are the entire margin. Either the three launched report types release themselves
for everybody, or $49 only works for firms you have already learned to trust — which is
the opposite of the firms a self-serve price is for.

The budget, if a human stays, is in the sensitivity table above: at a $45/hour loaded
rate $49 breaks even at 46 minutes of initial review, so 20–25 minutes is the working
ceiling if the price is to earn anything. At $20/hour — an offshore or contract reviewer —
there is room for an hour and a half, and $49 with a human in the loop becomes a
perfectly ordinary business. That choice is worth more than any discount decision on this
page.

**2. Pack discounts have to be shallow.** The 16% and 27% this document originally
proposed were sized against a $149 credit. Applied to $49 they take the ten-pack to $36,
which earns 7% under a 30-minute review against 25% at $45 — so the discount is not
quite giving away the business, but it is giving away most of what is left of it.
Suggested instead: **$49 single, 5 for $235 ($47 each), 10 for $450 ($45 each)** — about
4% and 8%. At this price a discount should buy commitment, because there is not much
margin to spend on it.

**3. Credits have to scale with pages, or the biggest files arrive first.** A flat $49
against per-page competitors at $0.05–0.10 means a 300-page file costs a firm $49 here
and $15–30 there, while a 1,900-page file costs $49 here and $95–190 there. Autolaw
therefore wins precisely the records that cost the most to serve and loses the cheap
ones — and the expensive ones are the loss-making row in the table above. This is
adverse selection written into the price list.

The fix keeps the headline: **one credit per 500 pages, rounded up.** A typical file is
still "a $49 report"; a 1,900-page record is four credits, $196, still a quarter of the
outsourced price and finally in line with what it costs. It also retires the 2,000-page
ceiling as a pricing device, leaving it as the operational limit it was meant to be.

This is a change to the debit path in case-app, not to the marketing site, and it is the
one product change this pricing decision actually requires.

### What $49 buys in positioning

Gained:

- **It is under the approval threshold.** A paralegal expenses $49 without asking
  anybody. That is the real unlock for self-serve once DNS and the trial flag land — no
  call, no procurement, no quote. $149 needs a decision; $49 needs a card.
- **The trial stops being a separate thing to build.** At $49 the first report *is* the
  trial, which removes a whole entitlement feature from the roadmap.
- **A one-sentence competitive story**: cheaper than the vendor you use now, per report,
  nothing to cancel.

Given up:

- **The quality signal.** $49 sits in the band where a firm assumes it must check every
  line — awkward when the differentiator is that you *can* check every line, because
  "can" starts reading as "must". Mitigate by leading with the sample page and letting
  the price be the second thing anybody learns.
- **Headroom.** $49 to $149 later is a repricing that existing customers feel. $149 to
  $199 is a footnote. Price rises are much harder than price cuts, and this is the
  direction that cannot easily be undone.
- **The human in the loop.** The margin cannot fund ops review at scale, so release
  quality becomes an engineering commitment rather than a staffing one.
- **Standing against EvenUp.** At $300–800 a demand, a $49 report is a component in
  somebody else's workflow rather than the work product. Fine if deliberate; worth
  knowing it is the position being taken.

## 5. What to do next

1. Set the three Stripe lookup keys in **live** mode to $49, $235 and $450. A test-mode
   price is the wrong number and looks exactly like the right one.
2. Write those amounts into `REPORT_PACKS` in `src/config.ts`. The pricing page already
   renders them and is tested in both states, so this is the whole edit.
3. **Decide auto-release.** Condition 1 above is not a preference; at $49 it is what
   separates an 85% margin from a loss. It is a trust-and-quality decision, and it is now
   the critical path for this price.
4. Measure the real numbers for 90 days: model cost per report, actual review minutes,
   and how often records arrive inside the free window. Every figure in section 4 is an
   estimate, and the refresh rate is the one most likely to be wrong.
5. Then add page-banded credits (condition 3). Not before — it needs the page
   distribution from step 4 to set the band.
6. Backlog, unchanged: per-type credit weights, if a QME/AME should ever cost more than a
   chronology.

## 6. The case for $149, kept on the record

Not chosen, recorded so the trade stays legible if it is ever revisited.

$149 held 65–90% margin in **both** cost regimes, needed no change to the credit model,
and absorbed a 1,900-page file without anyone thinking about it. It priced the product
against the $750–2,000 outsourced chronology rather than against the $0.05-a-page
extraction tools — which is the category the output belongs to, given citations,
conflict detection and missing-record flagging. Its weakness is the one that decided it:
$149 needs somebody to approve a purchase, and $49 does not.

If $49 proves out on volume but not on margin, the first move is not to reprice the
credit. It is to add the page bands from condition 3 and let the large files pay for
themselves.

## Sources

Vendor and comparison sites, most of them selling something adjacent. Checked 2026-10-28.

- [What Medical Chronology Services Cost in 2026 — Chartely](https://www.chartely.com/blog/medical-chronology-services-cost)
- [Medical Chronology Services Compared (2026) — medicalai.law](https://medicalai.law/medical-chronology-services)
- [Medical Record Review Cost for Personal Injury Firms — RapidCare](https://rapidcare.ai/medical-record-review-cost-for-personal-injury-firms/)
- [13 best medical chronology services (2026) — medrecords.ai](https://medrecords.ai/best/medical-chronology-services/)
- [Medical Chronology Services for Personal Injury Law Firms — Apex Demands](https://apexdemands.com/medical-chronology-services)
- [EvenUp vs. Supio for Personal Injury Case Prep (2026) — Legaltech Magazine](https://www.legaltechmag.com/compare/evenup-vs-supio)
- [Supio vs EvenUp: Which PI Demand Platform Fits Your Firm — legalizeai](https://legalizeai.com/blog/supio-vs-evenup)
- [Paralegal billing rate survey — Law.com](https://www.law.com/almID/900005463099/)
- [Gemini API Pricing (October 2026) — morphllm](https://www.morphllm.com/gemini-api-pricing)
- [Gemini pricing in 2026 — CloudZero](https://www.cloudzero.com/blog/gemini-pricing/)
