# Apex `autolaw.ai` canonical host — diagnosis and fix

**Date:** 2026-10-18
**Symptom:** typing `autolaw.ai` lands on `https://autolaw-1055716306475.us-west1.run.app/`; the
Cloud Run hostname, not the brand, is what the visitor sees in the address bar.
**Status:** root cause confirmed. The fix is one field at the DNS provider; the hardening below is
optional and separable.

---

## 1. What actually happens

```
$ curl -sSL -D - -o /dev/null https://autolaw.ai
HTTP/2 301
location: https://autolaw-1055716306475.us-west1.run.app/
HTTP/2 200
```

The apex never serves the site. It answers with a **301 to a different origin**, so the browser
does exactly what it is told and rewrites the address bar. Nothing is wrong with the page, the
build, the container, or the Cloud Run service — the redirect happens before any of them are
reached.

`www.autolaw.ai`, by contrast, is already completely healthy:

```
$ curl -sSI https://www.autolaw.ai
HTTP/2 200
server: Google Frontend
strict-transport-security: max-age=31536000; includeSubDomains
content-security-policy: default-src 'self'; ... frame-ancestors 'none'; object-src 'none'
```

```
$ gcloud beta run domain-mappings describe --domain www.autolaw.ai \
    --project gen-lang-client-0261655942 --region us-west1
spec:
  certificateMode: AUTOMATIC
  routeName: autolaw
status:
  conditions:
  - {type: Ready,                 status: 'True'}
  - {type: CertificateProvisioned, status: 'True'}
  - {type: DomainRoutable,         status: 'True'}
  resourceRecords:
  - {name: www, type: CNAME, rrdata: ghs.googlehosted.com.}
```

So the mapping, the certificate and the DNS for `www` are all in place and have been since
2026-02-09. **The defect is confined to the apex.**

## 2. Side by side with cidsnap.com

`cidsnap.com` is not using a different technique. It is using *the same* technique with *the
right value* in one field.

| | `autolaw.ai` | `cidsnap.com` |
|---|---|---|
| Registrar / DNS | GoDaddy (`ns09/ns10.domaincontrol.com`) | GoDaddy (`ns47/ns48.domaincontrol.com`) |
| Apex `A` records | `15.197.225.128`, `3.33.251.168` | `15.197.225.128`, `3.33.251.168` |
| Who answers the apex | `Server: awselb/2.0` (GoDaddy Forwarding) | `Server: awselb/2.0` (GoDaddy Forwarding) |
| **Apex 301 target** | **`https://autolaw-1055716306475.us-west1.run.app/`** ❌ | **`https://www.cidsnap.com`** ✅ |
| `www` DNS | `CNAME → ghs.googlehosted.com` | `CNAME → ghs.googlehosted.com` |
| Cloud Run mapping | `www.autolaw.ai → autolaw` (us-west1) ✔ | `www.cidsnap.com → docuai` (us-central1) ✔ |
| Result in the address bar | `autolaw-...run.app` | `www.cidsnap.com` |

Both domains sit on identical infrastructure: GoDaddy nameservers, the apex parked on GoDaddy's
AWS-hosted forwarder, `www` CNAME'd into a Cloud Run domain mapping. The *only* difference is
where the forwarder is told to send people.

intelli-docreview encodes the same intent in config rather than leaving it implicit:

```yaml
# intelli-docreview/cloudrun-env.yaml
PRODUCTION_DOMAIN: "cidsnap.com"
PUBLIC_APP_ORIGIN: "https://www.cidsnap.com"
```

## 3. Root cause

> The GoDaddy **Domain Forwarding** entry for `autolaw.ai` has its destination set to the raw
> Cloud Run service URL instead of `https://www.autolaw.ai`.

That is the whole defect. It is a one-value misconfiguration at the registrar, outside this
repository.

This is a known, already-written-down gap, not a new discovery:

- `docs/superpowers/specs/2026-09-02-autolaw-correction-release-design.md:99` — "Apex `autolaw.ai`
  must redirect to `https://www.autolaw.ai`, not to the raw service URL (Cloud Run domain mapping
  for the apex, or a redirect at the DNS provider)."
- `scripts/deploy-cloudrun.sh` (final line) — "www.autolaw.ai is mapped to this service; the apex
  autolaw.ai must redirect to https://www.autolaw.ai."

The deploy script states the requirement; nothing enforces it, and the registrar was set to the
service URL instead.

## 4. One option to rule out first: masking

GoDaddy offers "Forward with masking", which keeps `autolaw.ai` in the address bar by loading the
destination inside a hidden frame. It looks like the direct answer to the question. **It cannot
work here, and it should not be selected.**

`nginx.conf` sends, on every response:

```
Content-Security-Policy: ... frame-ancestors 'none' ...
```

A masked forward renders the site in a frame; `frame-ancestors 'none'` instructs the browser to
refuse. The visitor gets a blank page. Even if that header were removed, masking would freeze
every visitor on `/`, hide all deep links from search engines, break the canonical tags and the
sitemap (which all name `https://www.autolaw.ai/`), and strip the `Strict-Transport-Security` and
other headers from the visitor's view of the origin.

Masking is the wrong tool. Use a real redirect to a real host on the real domain.

## 5. Proposal

Three tiers. **Tier 1 is the fix.** Tiers 2 and 3 are hardening, independently useful, and can be
skipped or deferred without affecting Tier 1.

### Tier 1 — Point the apex at `www` (the fix)

No code change, no deploy, ~5 minutes, and it puts `autolaw.ai` at exact parity with `cidsnap.com`.

In the GoDaddy account for `autolaw.ai`: **Domains → autolaw.ai → Domain Settings → Forwarding**,
edit the existing domain forward and set:

| Field | Value |
|---|---|
| Forward to | `https://www.autolaw.ai` |
| Redirect type | **301 (Permanent)** |
| Forward settings | **Forward only** — *not* "Forward with masking" (see §4) |

Leave the apex `A` records alone; they belong to the forwarder and GoDaddy manages them.

Expected result:

```
$ curl -sSL -D - -o /dev/null https://autolaw.ai
HTTP/2 301
location: https://www.autolaw.ai
HTTP/2 200
```

This resolves the reported symptom in full. The address bar will read `www.autolaw.ai`, which is
also what every canonical tag, `og:url` and `sitemap.xml` entry in this repo already declares, and
it is precisely the behaviour `cidsnap.com` has.

### Tier 2 — Map the apex to Cloud Run (optional; fixes deep links)

GoDaddy's forwarder only handles the root. Deep links to the apex are dropped today, on both
domains:

```
$ curl -sSI https://autolaw.ai/security/   →  HTTP/2 404
$ curl -sSI https://cidsnap.com/pricing    →  HTTP/2 404
```

Tier 1 does not change this — anyone who shares `autolaw.ai/security/` still gets a 404. If that
matters, take the apex off GoDaddy's forwarder and give it to Cloud Run:

```bash
gcloud beta run domain-mappings create \
  --service autolaw \
  --domain autolaw.ai \
  --project gen-lang-client-0261655942 \
  --region us-west1
```

The command prints the authoritative `A`/`AAAA` record set to enter at GoDaddy — use its output
rather than a remembered list. Then replace the two forwarder `A` records with those, and let
Tier 3 perform the apex → `www` redirect inside nginx, where the path survives.

Requires `autolaw.ai` to be verified to this Google account; the existing
`google-site-verification=_zyzyJGulpm4yrBqGpKfe-msC8RPukMAKaDtnQRqCTw` TXT record suggests it
already is. Certificate provisioning typically takes 15–60 minutes. Note that `cidsnap.com` does
*not* do this — it accepts the same deep-link limitation.

### Tier 3 — Enforce the canonical host in nginx — **implemented 2026-10-18**

Tiers 1 and 2 both live at the registrar, where nothing in this repository can test them or stop
them regressing. Tier 3 is the half that can be.

Two variants were on the table: redirect every non-canonical host to `www.autolaw.ai`, or keep
serving them and suppress indexing. **The suppression variant shipped**, because a redirect off
the `run.app` host would break the one thing that host is for — opening a `gcloud run deploy
--tag` revision to check it before it takes traffic.

`nginx.conf` now carries a `map` in the `http` context, above the `server` block:

```nginx
map $host $robots_tag {
  default         "noindex, nofollow";
  www.autolaw.ai  "";
}
```

and, at server level beside the other security headers:

```nginx
add_header X-Robots-Tag $robots_tag always;
```

nginx drops an `add_header` whose value evaluates to the empty string, so the canonical host
receives no such header while every other hostname is asked to stay out of the index. Placement
is deliberate in two ways: `map` is only valid in the `http` context and nginx refuses to start if
it is moved inside `server`, and the `add_header` sits at server level because one inside a
`location` replaces every inherited `add_header` — the rule `nginx.conf` already documents.

`src/__tests__/canonical-host.test.ts` pins the join that nothing at runtime would complain
about: the host nginx exempts must be the host every shipped page declares in
`<link rel="canonical">`. It also asserts the map sits above the `server` block, the header sits
above the first `location`, and — first in the file — that its own two parsers still match
anything, so a reformat of `nginx.conf` or `vite.config.ts` cannot turn the file green by making
it read nothing.

**Verified in `nginx:1.27-alpine`**, the image the Dockerfile builds on, with the real config
mounted:

| Request | Result |
|---|---|
| `nginx -t` | syntax ok, test successful |
| `Host: www.autolaw.ai` | 200, **no** `X-Robots-Tag`, all five security headers intact |
| `Host: autolaw-1055716306475.us-west1.run.app` | 200, `X-Robots-Tag: noindex, nofollow` |
| `Host: canary---autolaw-hxalp7dwmq-uw.a.run.app` | 200, `X-Robots-Tag: noindex, nofollow` — preview still serves |
| `Host: autolaw.ai` | 200, `X-Robots-Tag: noindex, nofollow` |
| `GET /healthz`, any host | 200 `ok`, no redirect — Cloud Run's startup probe is unaffected |
| `GET /healthz`, **no** `Host` header | 200 `ok` |
| 404 on either host | header follows the host; `Strict-Transport-Security` survives (`always`) |

610 tests, lint and `npm run build` all pass.

**What this does not do.** It does not change the address bar. A visitor who types `autolaw.ai`
still goes wherever the registrar sends them, and until Tier 1 is done that is still the Cloud Run
URL. Tier 3 only stops that URL competing with the brand in search results. **Tier 1 remains
required.**

If the apex is ever mapped straight to this service (Tier 2), add a redirect for it here — at that
point the apex reaches nginx and a 301 to `www` costs nothing, since the apex is not a host anyone
needs to test against.

## 6. Verification

After Tier 1, all three must hold:

```bash
# 1. the apex redirects to the brand host, not the service host
curl -sSL -D - -o /dev/null https://autolaw.ai 2>&1 | grep -iE '^(HTTP/|location:)'
#    expect: 301 → location: https://www.autolaw.ai  → 200

# 2. www still serves the site directly, with no second hop
curl -sSI https://www.autolaw.ai | head -1
#    expect: HTTP/2 200

# 3. the page that loads declares itself canonical at the brand host
curl -sS https://autolaw.ai | grep -o '<link rel="canonical"[^>]*>'
#    expect: <link rel="canonical" href="https://www.autolaw.ai/" />
```

DNS forwarding changes at GoDaddy usually apply within minutes, but allow up to an hour, and check
in a private window — the current 301 is permanent and browsers cache it aggressively. Clear it at
`chrome://net-internals/#hsts` if a stale redirect persists during testing.

## 7. Adjacent finding — `scripts/deploy-cloudrun.sh` targets a project that does not exist

Not related to the redirect, but found while confirming the above and worth fixing before the next
deploy.

```bash
PROJECT_ID="${PROJECT_ID:-legal-intelligence}"
```

`legal-intelligence` is the project's **display name**. Its **project ID** is
`gen-lang-client-0261655942`, and `gcloud` takes the ID:

```
$ gcloud run services describe autolaw --project legal-intelligence --region us-west1
ERROR: PERMISSION_DENIED: Cloud Run Admin API has not been used in project
legal-intelligence before or it is disabled.
```

The script therefore fails unless `PROJECT_ID` is overridden in the environment on every run.
Change the default to `gen-lang-client-0261655942`.

## 8. Summary

| | |
|---|---|
| Root cause | GoDaddy apex forwarding for `autolaw.ai` points at the Cloud Run service URL |
| Why cidsnap works | Identical setup; its forwarding points at `https://www.cidsnap.com` |
| Fix | Change the forwarding destination to `https://www.autolaw.ai`, 301, forward-only |
| Code changes required | None for the fix |
| Do not use | GoDaddy "Forward with masking" — blocked by `frame-ancestors 'none'` |
| Hardening | Tier 3 `X-Robots-Tag` variant **implemented 2026-10-18** — the service URL no longer competes in search |
| Still outstanding | Tier 1, at GoDaddy. Nothing in this repo can do it or test it. |
