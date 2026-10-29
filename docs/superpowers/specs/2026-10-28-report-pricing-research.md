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

## 4. Recommendation

Price one credit at **$149**, with volume relief:

| Pack | Price | Per report | Saving |
| --- | --- | --- | --- |
| Single report | **$149** | $149 | — |
| 5-report pack | **$625** | $125 | 16% |
| 10-report pack | **$1,090** | $109 | 27% |

Why $149 and not the $39–49 in the brief:

1. **$49 prices the product as the thing it is not.** It lands squarely in the
   $0.05/page extraction-tool band, next to tools whose output a paralegal must verify
   from scratch. A firm reading $49 concludes the output needs checking — and then
   discovers it was right to think so, because it does need an attorney's sign-off.
   The price is the first claim the page makes about the quality of the work.
2. **$49 does not survive ops review.** At $15–55 of marginal cost, a $49 report is
   break-even at best for exactly the firms that are new, careful, and not yet trusted
   with auto-release. $149 holds a 65–90% gross margin across both regimes.
3. **$149 is still a tenth of the alternative.** Against $750–2,000 for an outsourced
   500-page chronology, the pitch is not "cheap AI" but "the same job, same day, for a
   tenth of what you paid last time, and you can check every line". That is a far better
   conversation than a discount fight with a $0.05/page tool.
4. **The packs undercut a subscription without being one.** Ten reports at $1,090 is
   roughly three months of a single Supio-style seat, with nothing to cancel and nothing
   to use up. For a firm running a handful of matters a month, that is the easier
   purchase to approve.

### If you want a lower entry point

Do not lower the credit. Add a **first report at $49**, once per firm, as the thing the
call closes on — the same scoped evaluation the earlier trial proposal described. It
buys the same trial outcome without teaching the market that a report is worth $49.

### What stays unknowable from here

I cannot read your Stripe account. If `case_app_reports_1 / _5 / _10` already resolve to
active live-mode prices, those figures are the ones the business has already committed
to and this document is an argument for changing them, not a description of them. Check
before publishing anything.

## 5. What to do next

1. Decide the credit price. Nothing else here can move until that is a number.
2. Set or reprice the three Stripe lookup keys in **live** mode. A test-mode price is the
   wrong number and looks exactly like the right one.
3. Write the three amounts into `REPORT_PACKS` in `src/config.ts`. The pricing page is
   already built to render them, and a guard currently fails the build if any dollar
   figure appears while they are null — so filling them in is the whole edit.
4. Decide whether auto-release is granted at signup or earned. This is the single
   largest lever on margin, and it is a trust decision rather than a pricing one.
5. Backlog, not now: per-type credit weights, if a QME/AME should cost more than a
   chronology.

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
