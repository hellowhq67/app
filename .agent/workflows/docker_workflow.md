---
description: Build and Run Docker Container Locally
---

# Docker Workflow

This workflow builds the Docker image and runs it using Docker Compose.

// turbo

1. Build and detach

   ```bash
   docker-compose up -d --build
   ```

2. Check logs (optional)

   ```bash
   docker-compose logs -f
   ```

3. Stop containers (when done)
   ```bash
   docker-compose down
   ```
