# Cloud Build Quick Start (5 Minutes)

Fast track to get Cloud Build running for your PTE platform.

## Prerequisites

- Google Cloud account with billing enabled
- gcloud CLI installed and authenticated

## Quick Commands

### 1. Enable APIs (30 seconds)

```bash
gcloud services enable \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  run.googleapis.com \
  secretmanager.googleapis.com
```

### 2. Create Artifact Registry (10 seconds)

```bash
gcloud artifacts repositories create pte \
  --repository-format=docker \
  --location=asia-south1
```

### 3. Store Essential Secrets (2 minutes)

```bash
# Database (replace with your actual connection string)
echo -n "YOUR_DATABASE_URL" | \
  gcloud secrets create DATABASE_URL --data-file=-

# Gemini API Key
echo -n "YOUR_GEMINI_KEY" | \
  gcloud secrets create GOOGLE_GENERATIVE_AI_API_KEY --data-file=-

# Auth Secret (generates random)
openssl rand -base64 32 | \
  gcloud secrets create BETTER_AUTH_SECRET --data-file=-
```

### 4. Grant Permissions (30 seconds)

```bash
PROJECT_NUMBER=$(gcloud projects describe $(gcloud config get-value project) --format="value(projectNumber)")

gcloud projects add-iam-policy-binding $(gcloud config get-value project) \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### 5. Build DevContainer (5-10 minutes)

```bash
gcloud builds submit \
  --config=cloudbuild.yaml \
  --region=asia-south1
```

### 6. Configure Local Docker

```bash
gcloud auth configure-docker asia-south1-docker.pkg.dev
```

### 7. Update DevContainer Config

Replace `YOUR_PROJECT_ID` in `.devcontainer/devcontainer.cloud.json`:

```json
{
  "image": "asia-south1-docker.pkg.dev/YOUR_ACTUAL_PROJECT_ID/pte/devcontainer:latest"
}
```

### 8. Use Cloud Image

```bash
# Rename to use by default
mv .devcontainer/devcontainer.json .devcontainer/devcontainer.local.json
mv .devcontainer/devcontainer.cloud.json .devcontainer/devcontainer.json

# Reopen VS Code in container
# Command Palette → "Dev Containers: Rebuild Container"
```

## Done! 🎉

You're now using cloud-built images. No more local Docker builds!

## Next Steps

- Read full guide: `docs/CLOUD-BUILD-SETUP.md`
- Set up automated builds from GitHub
- Configure production deployment
- Set up AI asset generation pipeline

## Common Issues

**Permission denied?**
```bash
# Re-run step 4
```

**Build timeout?**
```bash
# Normal for first build, just wait
# Check progress: https://console.cloud.google.com/cloud-build
```

**Can't pull image?**
```bash
# Re-run step 6
gcloud auth configure-docker asia-south1-docker.pkg.dev
```

## Get Your Project ID

```bash
gcloud config get-value project
```
