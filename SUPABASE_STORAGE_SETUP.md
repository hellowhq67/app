# Supabase Storage and Edge Functions Setup Guide

This guide will help you set up Supabase storage buckets, triggers, and edge functions for your PTE application.

## Prerequisites

- Supabase project created and running
- Supabase CLI installed (for local development)
- Environment variables configured

## Quick Setup

### 1. Set Up Storage Buckets

1. Go to your **Supabase Dashboard → SQL Editor**
2. Copy and paste the contents of `scripts/supabase-storage.sql`
3. Click **Run** to create storage buckets and RLS policies

### 2. Set Up Storage Triggers

1. In the same SQL Editor, clear the previous query
2. Copy and paste the contents of `scripts/supabase-storage-triggers.sql`
3. Click **Run** to create storage triggers and functions

### 3. Deploy Edge Functions

#### Option A: Using Supabase CLI

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref <your-project-ref>

# Deploy all functions
supabase functions deploy

# Deploy specific functions
supabase functions deploy audio-processing
supabase functions deploy file-manager
supabase functions deploy ai-scoring
```

#### Option B: Using Dashboard

1. Go to **Supabase Dashboard → Edge Functions**
2. Click **New Function**
3. Copy and paste the function code from:
   - `supabase/functions/audio-processing/index.ts`
   - `supabase/functions/file-manager/index.ts`
   - `supabase/functions/ai-scoring/index.ts`
4. Set environment variables for each function

## Storage Buckets Created

### 📁 Audio Files (`audio-files`)
- **Purpose**: User audio recordings, speaking questions
- **Access**: Private (user-specific)
- **Size Limit**: 50MB
- **File Types**: Audio files (MP3, WAV, OGG, WebM)

### 📁 Images (`images`)
- **Purpose**: Question images, user avatars, public assets
- **Access**: Public read, authenticated write
- **Size Limit**: 10MB
- **File Types**: Images (JPEG, PNG, GIF, WebP, SVG)

### 📁 Documents (`documents`)
- **Purpose**: Test results, reports, PDFs
- **Access**: Private (user-specific)
- **Size Limit**: 5MB
- **File Types**: PDFs, text files, JSON

### 📁 User Uploads (`user-uploads`)
- **Purpose**: Temporary uploads, processing queue
- **Access**: Private (user-specific)
- **Size Limit**: 20MB
- **File Types**: Mixed (audio, images, text)

## Edge Functions

### 🎙️ Audio Processing (`audio-processing`)
- **Purpose**: Process uploaded audio files for transcription
- **Methods**: POST (start processing), GET (get status)
- **Features**:
  - Automatic AI credit deduction
  - File validation
  - Transcription triggering

### 📁 File Manager (`file-manager`)
- **Purpose**: Generate signed URLs, manage file operations
- **Methods**: POST (upload URL), DELETE (remove file)
- **Features**:
  - Signed URL generation
  - User authorization checks
  - File cleanup

### 🤖 AI Scoring (`ai-scoring`)
- **Purpose**: Process AI scoring for user attempts
- **Methods**: POST (score attempt), GET (usage stats)
- **Features**:
  - AI credit validation
  - Score generation
  - Feedback creation
  - Usage tracking

## Environment Variables

Set these in your Supabase Edge Functions:

```bash
# For all functions
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# For AI functions (optional)
OPENAI_API_KEY=your-openai-key
GOOGLE_GENERATIVE_AI_API_KEY=your-google-key
ASSEMBLYAI_API_KEY=your-assemblyai-key
```

## Storage Functions Available

### Database Functions
- `generate_audio_path(user_id, filename)` - Generate audio file path
- `generate_image_path(filename)` - Generate image file path
- `generate_document_path(user_id, filename)` - Generate document path
- `get_user_storage_stats(user_id)` - Get user storage statistics
- `generate_upload_url(bucket, path, content_type)` - Generate signed upload URL

### Triggers
- File upload logging to AI credit usage
- Audio processing initiation
- Storage usage tracking
- File validation
- Temporary file cleanup

## Usage Examples

### Upload Audio File
```javascript
const response = await fetch('/functions/v1/file-manager', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    bucketId: 'audio-files',
    fileName: 'recording.mp3',
    contentType: 'audio/mpeg',
    userId: 'user-123'
  })
});

const { signedUrl, filePath } = await response.json();
// Use signedUrl to upload file
```

### Process Audio
```javascript
const response = await fetch('/functions/v1/audio-processing', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    bucketId: 'audio-files',
    filePath: 'user-123/recording.mp3',
    userId: 'user-123',
    questionType: 'read_aloud'
  })
});
```

### Get AI Score
```javascript
const response = await fetch('/functions/v1/ai-scoring', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user-123',
    attemptId: 'attempt-456',
    questionType: 'repeat_sentence',
    response: { audioUrl: '...' },
    metadata: { duration: 30 }
  })
});
```

## Security Features

- **RLS Policies**: Users can only access their own files
- **File Validation**: Automatic file type and size checking
- **Storage Limits**: Per-user storage quotas
- **AI Credit Management**: Automatic credit deduction
- **Audit Trail**: All file operations logged

## Monitoring

### Storage Statistics
```sql
SELECT * FROM storage_stats;
```

### User Storage Usage
```sql
SELECT * FROM get_user_storage_stats('user-123');
```

### AI Credit Usage
```sql
SELECT * FROM ai_credit_usage WHERE user_id = 'user-123';
```

## Troubleshooting

### Common Issues

1. **Permission Denied**: Check RLS policies and user authentication
2. **File Upload Fails**: Verify file type and size limits
3. **Edge Function Error**: Check environment variables and logs
4. **Storage Limit Exceeded**: Check user storage usage

### Reset Storage
```sql
-- Clean up all storage
TRUNCATE storage.objects RESTART IDENTITY CASCADE;

-- Reset user storage usage
UPDATE users SET metadata = metadata - 'storage_used';
```

## Next Steps

1. Test file upload and processing workflow
2. Set up monitoring for storage usage
3. Configure automated cleanup jobs
4. Set up backup for important files
5. Test edge functions with real data
