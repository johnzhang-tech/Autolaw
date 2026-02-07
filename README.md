
# Autolaw.ai Landing Page

This is the Autolaw.ai landing page, adapted from the Figma Make export.

## Running the code

Run `npm i` to install the dependencies.

Run `npm run dev` to start the development server.

Run `npm run build` to build the production bundle.

Run `npm run start` to serve the production build (listens on port `8080` by default).

Health check endpoint: `GET /healthz`.

## Deploy to Cloud Run

The app is a static Vite build served by Nginx in Docker.

### Docker (recommended)

Build and deploy:

```
gcloud builds submit --tag gcr.io/PROJECT_ID/autolaw-landing
gcloud run deploy autolaw-landing \
  --image gcr.io/PROJECT_ID/autolaw-landing \
  --region REGION \
  --allow-unauthenticated \
  --port 8080
```

### Buildpacks (optional)

If you prefer buildpacks, Cloud Run will use `npm run start`:

```
gcloud run deploy autolaw-landing \
  --source . \
  --region REGION \
  --allow-unauthenticated \
  --port 8080
```

### Environment variables

No required environment variables. Cloud Run sets `PORT` automatically.
  