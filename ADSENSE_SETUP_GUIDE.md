# Google AdSense Setup Guide

## Step 1: Sign Up for Google AdSense

1. Go to **https://www.google.com/adsense/start/**
2. Click "Get Started"
3. Sign in with your Google account
4. Fill out the application form:
   - Your website URL: `http://yourdomain.com` (you'll need a domain)
   - Your payment information
   - Accept terms and conditions
5. Wait for approval (can take 1-3 days)

## Step 2: Get Your Publisher ID

Once approved, your Publisher ID is visible in multiple places:

### Method 1: Account Settings
1. Go to **https://www.google.com/adsense/**
2. Click **Settings** (gear icon) in the left sidebar
3. Click **Account** → **Account information**
4. Your Publisher ID is shown at the top (format: `ca-pub-1234567890123456`)

### Method 2: Quick View
1. Go to AdSense dashboard
2. Look at the URL in your browser - it contains your publisher ID
3. Example: `https://www.google.com/adsense/new/u/0/pub-1234567890123456/home`
4. The number after `pub-` is your publisher ID

## Step 3: Create Ad Units

### For Header & Footer Banners (728x90)

1. In AdSense dashboard, click **Ads** in the left sidebar
2. Click **By ad unit** tab
3. Click **+ New ad unit**
4. Choose **Display ads**
5. Configure:
   - **Name**: "Header Banner" (or "Footer Banner")
   - **Ad size**: Choose "Fixed size" → Select **728 x 90 (Leaderboard)**
   - **Ad type**: Text & display ads
6. Click **Create**
7. Copy the **Ad slot ID** shown (format: `1234567890`)
8. Repeat for footer banner

### For Sidebar Ad (300x250)

1. Click **+ New ad unit** again
2. Choose **Display ads**
3. Configure:
   - **Name**: "Sidebar Ad"
   - **Ad size**: Choose "Fixed size" → Select **300 x 250 (Medium Rectangle)**
   - **Ad type**: Text & display ads
4. Click **Create**
5. Copy the **Ad slot ID**

## Step 4: Update Your Code

Open `views/index.ejs` and replace:

### 1. Replace Publisher ID in Header Script (Line ~13)
```html
<!-- BEFORE -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"

<!-- AFTER (example with publisher ID: ca-pub-1234567890123456) -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1234567890123456"
```

### 2. Replace Header Banner Ad Code (Line ~28)
```html
<!-- BEFORE -->
<ins class="adsbygoogle"
     style="display:inline-block;width:728px;height:90px"
     data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
     data-ad-slot="XXXXXXXXXX"></ins>

<!-- AFTER (example slot ID: 9876543210) -->
<ins class="adsbygoogle"
     style="display:inline-block;width:728px;height:90px"
     data-ad-client="ca-pub-1234567890123456"
     data-ad-slot="9876543210"></ins>
```

### 3. Replace Sidebar Ad Code (Line ~132)
```html
<!-- Replace both data-ad-client and data-ad-slot with your values -->
<ins class="adsbygoogle"
     style="display:inline-block;width:300px;height:250px"
     data-ad-client="ca-pub-1234567890123456"
     data-ad-slot="1122334455"></ins>
```

### 4. Replace Footer Banner Ad Code (Line ~145)
```html
<!-- Replace both data-ad-client and data-ad-slot with your values -->
<ins class="adsbygoogle"
     style="display:inline-block;width:728px;height:90px"
     data-ad-client="ca-pub-1234567890123456"
     data-ad-slot="5544332211"></ins>
```

## Important Notes

> **⚠️ Domain Required**: Google AdSense requires a real domain name. You can't use `localhost` or IP addresses.
> 
> You'll need to:
> 1. Buy a domain (e.g., from Namecheap, GoDaddy)
> 2. Deploy your app to a hosting service (e.g., Heroku, DigitalOcean, AWS)
> 3. Point your domain to your hosted app
> 4. Submit your actual domain URL to AdSense

> **📝 Alternative for Testing**: If you just want to see how ads would look, you can use AdSense test mode or dummy ads, but these won't generate real revenue.

## Verification

After updating the code:
1. Deploy your site to your domain
2. Visit your live site
3. Ads may take 10-20 minutes to appear
4. Initially, you may see blank ads or "test ads"
5. Check AdSense dashboard to verify ads are active

## Need Help?

- **AdSense Help**: https://support.google.com/adsense
- **Test if ads are working**: Install "Google Publisher Toolbar" Chrome extension
