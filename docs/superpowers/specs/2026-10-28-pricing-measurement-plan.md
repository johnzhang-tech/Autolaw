# Measuring the two numbers the price depends on

Date: 2026-10-28
Status: plan. Implementation belongs in case-app, not here.

Companion to `2026-10-28-report-pricing-research.md`, whose section 4 turns almost
entirely on two figures nobody has measured: **what a report costs in model spend** and
**how many minutes a human spends releasing it**. At $49 those two decide whether the
margin is 85% or negative, so they are worth two weeks before the price is set.

The finding below is that one of them needs no code at all, and the other should not get
code yet.

## 1. Model cost per report — already instrumented

case-app measures this today. `apps/server/src/lib/usageTracking.ts` `logUsage()` emits a
structured line on every model call:

```json
{ "severity": "INFO", "event": "llm_usage", "context": "...", "model": "gemini-3.5-flash",
  "prompt_tokens": 41233, "completion_tokens": 2910,
  "estimated_cost_usd": 0.042, "tenantId": "...", "caseId": "..." }
```

Three things make it usable as it stands:

- **The prices are right.** `apps/server/src/lib/modelPricing.ts` carries all four models
  the pipeline actually uses — `gemini-3.5-flash`, `gemini-3.8-flash`,
  `gemini-3.1-flash-lite` and `gemini-3.1-pro-preview`. An unpriced model would fall back
  to a Pro-tier estimate and warn, so a silent 2.7× overstatement on Flash is not a risk
  here. (I checked this specifically, having first got it wrong by grepping the wrong
  file.)
- **It is attributed.** Every line carries `caseId`.
- **The run is bounded.** `pipeline_runs` has `caseId`, `startedAt` and `completedAt`.

So the cost of a report is the sum of `estimated_cost_usd` over the lines for that
`caseId` between its run's start and finish. **No deploy, no migration, no code.** One
Logs Explorer or BigQuery query against existing logs.

What that query cannot separate: other activity on the same case inside the window — an
Ask AL session, another report running concurrently. Over 20–30 reports that shows up as
a handful of high outliers rather than as bias, and it is visible in the spread. For a
decision between "$3" and "$8" it is enough.

### The one small durable change, if you want it exact

`pipeline_runs.costData` is a `jsonb` column that already exists and already carries
`{ totals: { estimated_cost_usd } }` for intake jobs — written by
`apps/server/src/intakeJobWorker.ts` and read by
`apps/case-ingestion/src/lib/pipelineCost.ts`. Writing the same shape when a *report* run
completes follows an established convention, needs no migration, and makes cost per
report a column rather than a log query.

Worth doing if the number is wanted permanently. Not worth doing before the first
reading, because the log query answers the pricing question this week.

## 2. Review minutes — do not instrument this yet

There is no review-start signal anywhere in case-app. `tenant_report_usage` has
`createdAt` and `updatedAt` and a status of `accepted` / `needs_review` / `rejected`, so
the difference between them is **queue latency, not handling time** — a report that sat
overnight and took twenty minutes to check reads as fourteen hours. Nothing records when
a reviewer opened a report.

The obvious fix is a `reviewOpenedAt` column written when the review UI opens. Do not
start there, for three reasons:

1. **The delta it produces is wrong in the same direction.** A reviewer who opens a
   report, goes to lunch and comes back records ninety minutes. Interruption is the norm
   in a queue, so the instrumented number needs outlier rules you cannot write until you
   know the real distribution.
2. **It is a migration, a write path and a deploy to answer a question a stopwatch
   answers this week.**
3. **It may be measuring something you are about to delete.** Condition 1 of the pricing
   doc is that auto-release becomes the default. If that happens, review minutes stop
   mattering and the instrumentation is dead code.

### What to do instead

Whoever releases reports notes two things per report in a spreadsheet: **minutes of
actual attention**, and **report type**. That is the whole method.

How many: with a spread of roughly ±12 minutes, **about 25 reports** gets the mean inside
±5 minutes, which is the precision the decision needs — the sensitivity table moves in
10-minute steps. At a handful of reports a week that is two to three weeks.

Also note, free, from data you already have:
- **Queue latency** — `updatedAt − createdAt` on `tenant_report_usage`. Not handling
  time, but it tells you whether reports wait, which is a customer-experience number in
  its own right.
- **Refresh rate** — the share of cases with an add-records order inside 30 days, from
  the order history `planOrderCharges` already reads. This is the assumption in the
  pricing model most likely to be wrong, and it is a SQL query today.

If review survives the auto-release decision, add `reviewOpenedAt` then, with the outlier
rule the stopwatch data will have told you.

## 3. What the readings mean

Against the sensitivity table in the pricing doc, at $49 with a 50% refresh rate:

| Reading | What it means |
| --- | --- |
| Review under 20 min at a $20–30/hour rate | $49 works with a human in the loop. Ship it. |
| Review 20–30 min at $45/hour | ~30–49%. Works, but a 27% pack discount does not. |
| Review over 45 min at $45/hour | $49 needs auto-release, or a cheaper reviewer, or both. |
| Model cost over $8 a report | The page-band credits from condition 3 stop being optional. |
| Refresh rate over 60% | Revisit the free-refresh window itself, not the price. |

## 4. Order of work

1. Run the log query for model cost per report over the last 30 completed report runs.
   Today, no code.
2. Start the review stopwatch. Two to three weeks, one spreadsheet.
3. Query refresh rate and queue latency from the order history. Today, no code.
4. Decide auto-release — which, depending on 2, may make the rest moot.
5. Set the Stripe prices and fill `REPORT_PACKS` in the marketing site's `src/config.ts`.
6. Only then: `costData` on report runs, and `reviewOpenedAt` if review survived.
