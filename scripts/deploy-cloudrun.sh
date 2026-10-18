#!/usr/bin/env bash
#
# Build the static site image and deploy it to Cloud Run.
#
# The site is a Vite build served by nginx. It needs NO environment: no database, no session
# secret, no API key. An earlier version of this script deployed with --source and injected
# SESSION_SECRET, DATABASE_URL, and OPENAI_API_KEY into this service's environment — real
# secrets on a service that never reads them. --clear-env-vars below removes anything that
# is still set from that era.
#
# This is the manual path, and the second one. Production normally deploys itself: the Cloud
# Build trigger rmgpgab-autolaw-us-west1-johnzhang-tech-Autolaw--madul builds this Dockerfile
# on every push to main and pushes to
# us-west1-docker.pkg.dev/<project>/cloud-run-source-deploy/autolaw/autolaw, tagged with the
# commit SHA — which is where the live revision's image comes from. Reach for this script to
# deploy a tree that is not on main, or when the trigger is unavailable. It pushes to IMAGE
# below rather than to the trigger's registry path, so a revision deployed from here reports a
# different image location than one the trigger built. Both run the same Dockerfile.
#
# Optional overrides: PROJECT_ID, REGION, SERVICE_NAME, IMAGE.
set -euo pipefail

cd "$(dirname "$0")/.."

# The project id, not its display name. This line read "legal-intelligence" — which is the
# name shown in the console — and gcloud takes the id, so every default-configuration run died
# on "Cloud Run Admin API has not been used in project legal-intelligence before or it is
# disabled". The script worked only for whoever already had PROJECT_ID exported, which is why
# it went unnoticed.
PROJECT_ID="${PROJECT_ID:-gen-lang-client-0261655942}"
REGION="${REGION:-us-west1}"
SERVICE_NAME="${SERVICE_NAME:-autolaw}"
IMAGE="${IMAGE:-gcr.io/${PROJECT_ID}/${SERVICE_NAME}}"

# Never ship an image from a red suite or a broken build. The same steps run inside the
# Docker build, but failing here is faster and keeps a bad image out of the registry.
npm ci
npm test
npm run build

gcloud builds submit --project "${PROJECT_ID}" --tag "${IMAGE}" .

gcloud run deploy "${SERVICE_NAME}" \
  --project "${PROJECT_ID}" \
  --region "${REGION}" \
  --image "${IMAGE}" \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --clear-env-vars

SERVICE_URL="$(gcloud run services describe "${SERVICE_NAME}" \
  --project "${PROJECT_ID}" \
  --region "${REGION}" \
  --format='value(status.url)')"

echo "Deployed ${SERVICE_NAME} to ${SERVICE_URL}"
echo "www.autolaw.ai is mapped to this service; the apex autolaw.ai must redirect to https://www.autolaw.ai."
