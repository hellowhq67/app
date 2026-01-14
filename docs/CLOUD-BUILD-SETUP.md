# Google Cloud Build Setup Guide

Complete guide to set up Cloud Build for your PTE Academic platform, eliminating local Docker dependencies and CPU bottlenecks.

## 🎯 Architecture Overview

```
GitHub Repository
     ↓
Cloud Build (asia-south1)
     ↓
Artifact Registry
     ↓
Deploy to:
  - Cloud Run (Production API)
  - Cloud Workstations (Dev Environment)
  - Vertex AI (ML/Scoring Jobs)
```

## ✅ Benefits

- ❌ No Docker Desktop required
- ✅ Works on weak/old CPUs
- ✅ Fast cloud-based builds
- ✅ Scalable for 3K-4K asset generation
- ✅ Integrated with GitHub
- ✅ Zero local compute load

---

## 📋 Prerequisites

1. **Google Cloud Project**
   - Create at: https://console.cloud.google.com
   - Enable billing

2. **Required APIs** (enable these):
   ```bash
   gcloud services enable cloudbuild.googleapis.com
   gcloud services enable artifactregistry.googleapis.com
   gcloud services enable run.googleapis.com
   gcloud services enable secretmanager.googleapis.com
   ```

3. **gcloud CLI installed locally**
   - Download: https://cloud.google.com/sdk/docs/install
   - Authenticate: `gcloud auth login`

---

## 🚀 Step-by-Step Setup

### 1. Create Artifact Registry

This stores your Docker images in the cloud.

```bash
# Create the registry (ONE TIME ONLY)
gcloud artifacts repositories create pte \
  --repository-format=docker \
  --location=asia-south1 \
  --description="PTE Academic platform images"

# Verify creation
gcloud artifacts repositories list --location=asia-south1
```

### 2. Store Secrets in Google Secret Manager

Instead of environment variables, use Secret Manager for sensitive data.

```bash
# Database
echo -n "postgresql://user:password@host/db?sslmode=require" | \
  gcloud secrets create DATABASE_URL --data-file=-

# AI Services
echo -n "your_gemini_api_key" | \
  gcloud secrets create GOOGLE_GENERATIVE_AI_API_KEY --data-file=-

echo -n "your_assemblyai_key" | \
  gcloud secrets create ASSEMBLYAI_API_KEY --data-file=-

# Authentication
echo -n "https://your-domain.com" | \
  gcloud secrets create BETTER_AUTH_URL --data-file=-

openssl rand -base64 32 | \
  gcloud secrets create BETTER_AUTH_SECRET --data-file=-

echo -n "your-client-id.apps.googleusercontent.com" | \
  gcloud secrets create GOOGLE_CLIENT_ID --data-file=-

echo -n "your_google_client_secret" | \
  gcloud secrets create GOOGLE_CLIENT_SECRET --data-file=-

# Sanity CMS
echo -n "your_sanity_project_id" | \
  gcloud secrets create NEXT_PUBLIC_SANITY_PROJECT_ID --data-file=-

echo -n "production" | \
  gcloud secrets create NEXT_PUBLIC_SANITY_DATASET --data-file=-

echo -n "your_sanity_token" | \
  gcloud secrets create SANITY_API_READ_TOKEN --data-file=-
```

**Verify secrets:**
```bash
gcloud secrets list
```

### 3. Grant Cloud Build Access to Secrets

```bash
# Get your project number
PROJECT_NUMBER=$(gcloud projects describe $(gcloud config get-value project) --format="value(projectNumber)")

# Grant Secret Manager access to Cloud Build
gcloud projects add-iam-policy-binding $(gcloud config get-value project) \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# Grant Cloud Run access
gcloud projects add-iam-policy-binding $(gcloud config get-value project) \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
  --role="roles/run.admin"

# Grant Service Account User role
gcloud projects add-iam-policy-binding $(gcloud config get-value project) \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"
```

### 4. Update Configuration Files

**Update `devcontainer.cloud.json`:**
Replace `YOUR_PROJECT_ID` with your actual GCP project ID:

```json
{
  "image": "asia-south1-docker.pkg.dev/YOUR_ACTUAL_PROJECT_ID/pte/devcontainer:latest"
}
```

**Update `cloudbuild-production.yaml`:**
Update the substitutions section:

```yaml
substitutions:
  _REGION: 'asia-south1'
  _BETTER_AUTH_URL: 'https://your-actual-domain.com'
  _GOOGLE_CLIENT_ID: 'your-actual-client-id.apps.googleusercontent.com'
  _NEXT_PUBLIC_SANITY_PROJECT_ID: 'your-actual-sanity-project-id'
  _NEXT_PUBLIC_SANITY_DATASET: 'production'
```

### 5. Build DevContainer Image (First Time)

```bash
# From your project root
gcloud builds submit \
  --config=cloudbuild.yaml \
  --region=asia-south1

# This takes ~5-10 minutes first time
# Watch progress at: https://console.cloud.google.com/cloud-build
```

**Verify the image:**
```bash
gcloud artifacts docker images list \
  asia-south1-docker.pkg.dev/$(gcloud config get-value project)/pte
```

### 6. Use Cloud-Built DevContainer Locally

**Option A: Rename to use cloud image by default**
```bash
mv .devcontainer/devcontainer.json .devcontainer/devcontainer.local.json
mv .devcontainer/devcontainer.cloud.json .devcontainer/devcontainer.json
```

**Option B: Keep both and switch manually**
- Use `devcontainer.json` for local builds (slow, requires Docker)
- Use `devcontainer.cloud.json` for cloud image (fast, no Docker)

### 7. Set Up Automated Builds with GitHub

**Connect GitHub to Cloud Build:**

1. Go to: https://console.cloud.google.com/cloud-build/triggers
2. Click **"Connect Repository"**
3. Choose **GitHub** → Authenticate
4. Select your repository
5. Create trigger:
   - **Name**: `build-on-push`
   - **Event**: Push to branch
   - **Branch**: `^main$`
   - **Configuration**: `cloudbuild.yaml`
   - **Region**: `asia-south1`

Now every push to `main` automatically rebuilds your devcontainer!

---

## 🔧 Daily Workflow

### Local Development (Using Cloud Image)

1. **Pull latest image:**
   ```bash
   docker pull asia-south1-docker.pkg.dev/$(gcloud config get-value project)/pte/devcontainer:latest
   ```

2. **Open in VS Code:**
   - Open project folder
   - Command Palette: "Dev Containers: Reopen in Container"
   - Select `devcontainer.cloud.json` (or your renamed one)

3. **No local building required!**

### Production Deployment

```bash
# Deploy to Cloud Run
gcloud builds submit \
  --config=cloudbuild-production.yaml \
  --region=asia-south1

# Get the deployed URL
gcloud run services describe pte-academic \
  --region=asia-south1 \
  --format="value(status.url)"
```

### Manual DevContainer Rebuild

```bash
# Rebuild and push devcontainer
gcloud builds submit \
  --config=cloudbuild.yaml \
  --region=asia-south1 \
  --substitutions=SHORT_SHA=$(git rev-parse --short HEAD)
```

---

## 📊 Project Structure

```
pedagogistspte.v.0.2/
│
├── .devcontainer/
│   ├── devcontainer.json           # Local build (slow)
│   ├── devcontainer.cloud.json     # Cloud image (fast)
│   └── Dockerfile.dev              # DevContainer definition
│
├── .github/
│   └── workflows/
│       ├── ci.yml                  # Existing CI/CD
│       └── cloud-build.yml         # Cloud Build trigger (optional)
│
├── docs/
│   └── CLOUD-BUILD-SETUP.md        # This file
│
├── cloudbuild.yaml                 # DevContainer build config
├── cloudbuild-production.yaml      # Production deployment config
│
└── Dockerfile                      # Production runtime (create if needed)
```

---

## 🎯 Advanced: AI Asset Generation Pipeline

For generating 3K-4K PTE practice assets without local CPU load:

### 1. Create Asset Generation Cloud Build

```yaml
# cloudbuild-assets.yaml
steps:
  - name: 'asia-south1-docker.pkg.dev/$PROJECT_ID/pte/devcontainer:latest'
    entrypoint: 'bash'
    args:
      - '-c'
      - |
        pnpm run generate:assets --batch=100
    env:
      - 'NODE_ENV=production'
    secretEnv:
      - 'GOOGLE_GENERATIVE_AI_API_KEY'
      - 'DATABASE_URL'
```

### 2. Trigger Asset Generation

```bash
gcloud builds submit \
  --config=cloudbuild-assets.yaml \
  --region=asia-south1 \
  --timeout=7200s  # 2 hours for large batches
```

### 3. Use Vertex AI for Parallel Generation (Advanced)

Create a Vertex AI pipeline for massive parallelization:
- Splits 3K assets into 30 jobs of 100 each
- Runs in parallel across multiple machines
- Stores results in Cloud Storage → Neon DB

---

## 🐛 Troubleshooting

### Build Fails: Permission Denied

**Problem:** Cloud Build can't access secrets or registries.

**Solution:**
```bash
# Re-grant permissions
PROJECT_NUMBER=$(gcloud projects describe $(gcloud config get-value project) --format="value(projectNumber)")

gcloud projects add-iam-policy-binding $(gcloud config get-value project) \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### Cannot Pull DevContainer Image Locally

**Problem:** `docker pull` fails with authentication error.

**Solution:**
```bash
# Configure Docker to use gcloud for auth
gcloud auth configure-docker asia-south1-docker.pkg.dev
```

### Cloud Build Timeout

**Problem:** Build exceeds default timeout (10 minutes).

**Solution:** Increase timeout in `cloudbuild.yaml`:
```yaml
timeout: '3600s'  # 1 hour
```

### Secrets Not Found in Build

**Problem:** Cloud Build can't access secrets.

**Solution:** Verify secrets exist and are accessible:
```bash
gcloud secrets list
gcloud secrets versions access latest --secret="DATABASE_URL"
```

---

## 💰 Cost Estimation

**Cloud Build Pricing (asia-south1):**
- First 120 build-minutes/day: **FREE**
- After: ~$0.003/build-minute

**Typical Usage:**
- DevContainer build: ~10 minutes = **FREE**
- Production build: ~5 minutes = **FREE**
- Daily usage for dev team: **~$0** (within free tier)

**Artifact Registry:**
- Storage: $0.10/GB/month
- Estimated: ~2GB for all images = **$0.20/month**

**Cloud Run (Production):**
- Pay only when handling requests
- Free tier: 2 million requests/month
- Estimated for small-medium traffic: **$5-20/month**

**Total estimated cost: ~$5-25/month** (way cheaper than upgrading local hardware!)

---

## 🔄 Migration Checklist

- [ ] Enable required GCP APIs
- [ ] Create Artifact Registry
- [ ] Store all secrets in Secret Manager
- [ ] Grant Cloud Build permissions
- [ ] Update project configuration files
- [ ] Build initial devcontainer image
- [ ] Test local devcontainer with cloud image
- [ ] Connect GitHub to Cloud Build
- [ ] Test production deployment
- [ ] Update team documentation

---

## 📚 Additional Resources

- [Cloud Build Documentation](https://cloud.google.com/build/docs)
- [Artifact Registry Guide](https://cloud.google.com/artifact-registry/docs)
- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Secret Manager Best Practices](https://cloud.google.com/secret-manager/docs/best-practices)
- [DevContainers Specification](https://containers.dev/)

## 🆘 Support

For issues with Cloud Build setup:
1. Check build logs: https://console.cloud.google.com/cloud-build/builds
2. Verify IAM permissions
3. Ensure all secrets are properly configured
4. Check the troubleshooting section above

---

**Ready to build in the cloud? Start with Step 1!** ☁️
