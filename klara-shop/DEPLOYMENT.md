# Firebase Deployment Guide

## Setup

### 1. Set the API Key (REQUIRED)

Before deploying, you need to configure the Klara API key as a Firebase secret:

```bash
# Set the API key as a secret (replace YOUR_ACTUAL_API_KEY with your key)
firebase functions:secrets:set KLARA_API_KEY

# Or set it directly with the value
echo "your_api_key_here" | firebase functions:secrets:set KLARA_API_KEY
```

### 2. Build and Deploy

```bash
# Build the frontend
yarn build

# Deploy everything (hosting + functions)
firebase deploy

# Or deploy only functions
firebase deploy --only functions

# Or deploy only hosting
firebase deploy --only hosting
```

## How it works

### Secure API Proxy

- Your Klara API key is stored securely as a Firebase secret
- The `klaraApi` function acts as a proxy between your frontend and the Klara API
- All API requests go through: `your-app.web.app/api/*` → Firebase Function → `api.klara.ch/*`

### URL Structure

- **Frontend**: `https://your-project.web.app`
- **API Proxy**: `https://your-project.web.app/api/*` → routes to Firebase Function
- **Direct Function**: `https://europe-west1-your-project.cloudfunctions.net/klaraApi`

### Development vs Production

- **Development**: Uses Vite proxy (localhost:5173/api → api.klara.ch)
- **Production**: Uses Firebase Function (your-domain.web.app/api → Firebase → api.klara.ch)

## Monitoring

```bash
# View function logs
firebase functions:log

# View function logs in real-time
firebase functions:log --follow
```

## Troubleshooting

### API Key Not Set
If you get "API key not configured" errors:
```bash
firebase functions:secrets:access KLARA_API_KEY
```

### Function Deployment Issues
```bash
# Check function status
firebase functions:list

# Redeploy with verbose logging
firebase deploy --only functions --debug
```