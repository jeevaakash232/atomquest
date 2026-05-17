# AtomQuest — Vercel Deployment Guide

## Why Vercel (not Render)

AtomQuest is a **Next.js full-stack app** — the frontend and all API routes live in the same codebase.
Vercel is purpose-built for Next.js and handles both automatically.
Render is for separate Node/Express backends — not needed here.

---

## Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/atomquest.git
git push -u origin main
```

---

## Step 2 — Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) → Sign up / Log in
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Vercel auto-detects Next.js — click **Deploy**

---

## Step 3 — Add Environment Variables

In Vercel dashboard → Your Project → **Settings → Environment Variables**

Add ALL of these:

| Variable | Value |
|---|---|
| `AWS_REGION` | `us-east-1` |
| `AWS_ACCESS_KEY_ID` | Your AWS key |
| `AWS_SECRET_ACCESS_KEY` | Your AWS secret |
| `BEDROCK_MODEL_ID` | `mistral.mistral-7b-instruct-v0:2` |
| `BEDROCK_REGION` | `us-east-1` |
| `AWS_S3_BUCKET_NAME` | `atomquest-files` |
| `AWS_S3_REGION` | `us-east-1` |
| `DYNAMODB_TABLE_GOALS` | `atomquest-goals` |
| `DYNAMODB_TABLE_USERS` | `atomquest-users` |
| `DYNAMODB_TABLE_ACTIVITY` | `atomquest-activity` |
| `DYNAMODB_TABLE_NOTIFICATIONS` | `atomquest-notifications` |
| `GOOGLE_CLIENT_ID` | Your Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Your Google OAuth secret |
| `AUTH_SECRET` | A random 64-char string |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` |

---

## Step 4 — Update Google OAuth Redirect URI

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. APIs & Services → Credentials → Your OAuth Client
3. Add to **Authorized redirect URIs**:
   ```
   https://your-app.vercel.app/api/auth/google/callback
   ```

---

## Step 5 — Redeploy

After adding env vars, go to **Deployments → Redeploy** (or push a new commit).

---

## Step 6 — Update NEXT_PUBLIC_APP_URL

Once deployed, copy your Vercel URL (e.g. `https://atomquest-xyz.vercel.app`) and update:
- Vercel env var: `NEXT_PUBLIC_APP_URL` = your Vercel URL
- Google OAuth redirect URI (Step 4)

---

## Demo Accounts

| Email | Password | Role |
|---|---|---|
| alex@atomquest.inc | password123 | Employee |
| sarah@atomquest.inc | password123 | Manager |
| priya@atomquest.inc | password123 | Admin |
| marcus@atomquest.inc | password123 | Executive |

---

## Generate AUTH_SECRET

Run this in your terminal to generate a secure secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
