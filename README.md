# autolaw.ai

The marketing site for Autolaw: a static Vite + React build served by nginx on Cloud Run.
Four pages — `/`, `/security/`, `/about/`, `/schedule-call/` — each its own HTML entry in
`vite.config.ts`.

## Working on it

```
npm ci
npm run dev        # http://localhost:3000
npm test           # Vitest: 180+ tests, including the credibility and claim guards
npm run build      # static output in build/
npm run ds         # rebuild the design-system previews and verify contrast
```

Two test files encode the site's governing rule, that it makes no claim the product cannot
support: `src/__tests__/credibility.test.tsx` (no placeholder assets, no raw hosts) and
`src/__tests__/claims.test.tsx` (no retired capability phrases). If either fails, the fix is
in the copy, not the test.

Site switches — trial CTA, login link, booking page, announcement, customer logos — live in
`src/config.ts`, each documented beside its value. Every one of them renders nothing while it
is unset; none substitutes a placeholder.

Design decisions are recorded in `docs/superpowers/specs/`. Start with the latest.

## Deploying

```
scripts/deploy-cloudrun.sh
```

Runs the tests and the build, submits the Docker image to Cloud Build, and deploys it to the
`autolaw` service in `us-west1` with no environment variables. The container listens on
`8080` and answers `GET /healthz`.

There is no buildpack path. The image is the only supported way to run this in production;
`vite preview` is a development server.
