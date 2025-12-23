# GitHub Self-Hosted Runner Setup Guide

This guide explains how to set up a self-hosted runner for this project to handle "Builders CI" tasks.

## Prerequisites
- A machine running Windows, Linux, or macOS.
- GitHub repository access with "Maintainer" or "Admin" permissions.

## Steps to Setup

### 1. Register the Runner in GitHub
1. Go to your GitHub repository.
2. Navigate to **Settings** > **Actions** > **Runners**.
3. Click on **New self-hosted runner**.
4. Select your operating system (e.g., Windows).
5. Follow the instructions provided by GitHub to download and configure the runner.

### 2. Configure the Runner
- During configuration, you will be asked for a **label**. You can use `self-hosted` or a custom label.
- If you use a custom label, update `.github/workflows/ci.yml` accordingly (change `runs-on: ubuntu-latest` to your label).

### 3. Install Dependencies on the Runner
Ensure the following are installed and in the PATH of the runner machine:
- **Node.js**: Version 20 or higher.
- **pnpm**: `npm install -g pnpm`.
- **Git**: Latest version.

### 4. Run the Runner
- Start the runner using the `./run.cmd` (Windows) or `./run.sh` (Linux/macOS) script.
- It is recommended to install the runner as a service so it starts automatically.

## Builders CI Context
The "Builders CI" job is designed to mimic the production build environment (Nixpacks/Railway). Using a self-hosted runner can speed up these builds and allow for specific environment configurations.
