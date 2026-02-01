# 🚀 Deployment Guide

This guide will walk you through deploying your YouTube Downloader to production.

## Step 1: Push to GitHub

### 1.1 Initialize Git (if not already done)
```bash
cd "/home/biruk/Desktop/Projects/YT downloder"
git init
git add .
git commit -m "Initial commit - YouTube Downloader with AdSense"
```

### 1.2 Create GitHub Repository
1. Go to https://github.com/new
2. Repository name: `youtube-downloader` (or any name you like)
3. **Keep it PUBLIC** (required for free Render tier)
4. **DO NOT** initialize with README (we already have files)
5. Click "Create repository"

### 1.3 Push Code to GitHub
After creating the repository, GitHub will show you commands. Use these:

```bash
git remote add origin https://github.com/YOUR_USERNAME/youtube-downloader.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

---

## Step 2: Deploy to Render

### 2.1 Sign Up for Render
1. Go to https://render.com/
2. Click "Get Started"
3. **Sign up with GitHub** (easiest option)
4. Authorize Render to access your repositories

### 2.2 Create New Web Service
1. Click **"New +"** button
2. Select **"Web Service"**
3. Connect your GitHub account (if not already)
4. Find and select your **youtube-downloader** repository
5. Click **"Connect"**

### 2.3 Configure Service
Render will auto-detect settings from `render.yaml`, but verify:

- **Name**: `youtube-downloader` (or customize)
- **Region**: Choose closest to you
- **Branch**: `main`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Plan**: **Free**

Click **"Create Web Service"**

### 2.4 Wait for Deployment
- Render will install dependencies and start your app
- First deployment takes 2-5 minutes
- Watch the logs for any errors
- When you see "Server is running on http://..." - it's live! ✅

### 2.5 Get Your Live URL
- Your app will be at: `https://YOUR-APP-NAME.onrender.com`
- Example: `https://youtube-downloader-abc123.onrender.com`
- Copy this URL - you'll need it for AdSense!

---

## Step 3: Update AdSense

1. Go to Google AdSense dashboard
2. Update your site URL to your Render URL
3. Wait 10-20 minutes for ads to activate

---

## ⚠️ Important Notes

### Free Tier Limitations
- App spins down after 15 minutes of inactivity
- Takes ~30 seconds to restart on first request
- 750 hours/month free (enough for most use)

### Custom Domain (Optional)
To use a custom domain like `yoursite.com`:
1. Buy a domain from Namecheap/GoDaddy
2. In Render, go to Settings → Custom Domain
3. Add your domain and update DNS settings
4. Update AdSense with your custom domain

---

## Troubleshooting

### Build Failed
- Check Render logs for errors
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

### App Won't Start
- Check start command is `npm start`
- Verify port is set correctly (Render provides PORT env variable)
- Look for errors in Render logs

### Downloads Don't Work
- Verify `yt-dlp` binary is executable
- Check file permissions in deployment
- May need to use `yt-dlp` from npm instead of binary

---

## Need Help?

- Render Docs: https://render.com/docs
- GitHub Docs: https://docs.github.com
- AdSense Help: https://support.google.com/adsense

Good luck! 🎉
