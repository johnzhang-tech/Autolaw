#!/usr/bin/env bash
set -euo pipefail

# Required env vars (via .env):
#   PROJECT_ID, REGION, SESSION_SECRET, DATABASE_URL, OPENAI_API_KEY

if [[ -f ".env" ]]; then
  eval "$(python3 - <<'PY'
import shlex
for line in open(".env"):
    line = line.strip()
    if not line or line.startswith("#"):
        continue
    k, v = line.split("=", 1)
    k = k.strip()
    v = v.strip().strip('"').strip("'")
    print(f"export {k}={shlex.quote(v)}")
PY
)"
fi

PROJECT_ID="${PROJECT_ID:-legal-intelligence}"
REGION="${REGION:-us-west1}"
SERVICE_NAME="${SERVICE_NAME:-autolaw}"

missing=()
[[ -z "${SESSION_SECRET:-}" ]] && missing+=("SESSION_SECRET")
[[ -z "${DATABASE_URL:-}" ]] && missing+=("DATABASE_URL")
[[ -z "${OPENAI_API_KEY:-}" ]] && missing+=("OPENAI_API_KEY")
if [[ ${#missing[@]} -gt 0 ]]; then
  echo "Missing required env vars: ${missing[*]}"
  echo "Loaded from .env? $(pwd)/.env"
  exit 1
fi

gcloud auth login
gcloud config set project "${PROJECT_ID}"
gcloud config set run/region "${REGION}"

gcloud services enable run.googleapis.com cloudbuild.googleapis.com \
  artifactregistry.googleapis.com sqladmin.googleapis.com

gcloud run deploy "${SERVICE_NAME}" \
  --source . \
  --allow-unauthenticated \
  --set-env-vars "NODE_ENV=production,SESSION_SECRET=${SESSION_SECRET},DATABASE_URL=${DATABASE_URL},OPENAI_API_KEY=${OPENAI_API_KEY}${APP_BASE_URL:+,APP_BASE_URL=${APP_BASE_URL}}"

SERVICE_URL="$(gcloud run services describe "${SERVICE_NAME}" \
  --region "${REGION}" \
  --format='value(status.url)')"

echo "Cloud Run service URL: ${SERVICE_URL}"
echo "Set APP_BASE_URL=${SERVICE_URL} for Google OAuth callbacks."
