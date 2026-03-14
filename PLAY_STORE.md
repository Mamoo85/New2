# Publishing M² Training on the Google Play Store

This guide walks you through submitting your app to the Google Play Store.
The codebase is already configured — you just need accounts and a few terminal commands.

---

## Prerequisites

- A computer with Node.js 18+ installed
- A Google account (your `matthewmichels4@gmail.com` works)

---

## Step 1: Create an Expo Account

1. Go to [expo.dev](https://expo.dev) and sign up for a free account.
2. Use the username `matthewmichels4` (or whatever you prefer — just note it).

## Step 2: Install EAS CLI & Log In

Open your terminal and run:

```bash
npm install -g eas-cli
eas login
```

Enter the Expo account credentials you just created.

## Step 3: Link Your Project

From the `artifacts/mobile` directory:

```bash
cd artifacts/mobile
eas init
```

This creates your project on Expo's servers and fills in the `projectId` in `app.json`.
If prompted, confirm the project name and slug.

## Step 4: App Icon

The app icon (`artifacts/mobile/assets/images/icon.png`) is already **1024×1024** and meets
the Play Store requirement. No action needed for basic submission.

If you want a custom-designed icon later, replace the file with a 1024×1024 PNG on a dark
(#111110) background. Google recommends the logo sits within the inner 66% of the canvas for
the adaptive icon foreground.

## Step 5: Build the Android App Bundle

```bash
eas build --platform android --profile production
```

This uploads your code to Expo's build servers and produces an `.aab` file.
The first build takes ~10 minutes. When it finishes, you'll get a download link.

## Step 6: Create a Google Play Developer Account

1. Go to [play.google.com/console](https://play.google.com/console).
2. Sign in with your Google account.
3. Pay the one-time $25 registration fee.
4. Complete your developer profile (name, address, contact info).

## Step 7: Create Your App in Play Console

1. Click **"Create app"** in the Play Console dashboard.
2. Fill in:
   - **App name**: M² Training
   - **Default language**: English (United States)
   - **App or game**: App
   - **Free or paid**: Free
3. Accept the policies and click **Create app**.

## Step 8: Complete the Store Listing

Under **"Store presence" > "Main store listing"**, fill in:

- **Short description** (80 chars max):
  `Personal training by Matt Michels. 20+ years, zero injuries.`

- **Full description** (4000 chars max):
  ```
  Train with Matt Michels — 20+ years of experience, thousands of clients trained with zero injuries. From middle school athletes to Division I competitors.

  M² Training gives you:
  • Client portal with workout logging and progress tracking
  • Session booking and scheduling
  • Custom workout programs ($20)
  • Form check video reviews ($20)
  • Online coaching subscriptions ($100+/month)
  • Meet prep programming (12-16 weeks)
  • Group class signups
  • Active challenges and leaderboards

  Located at 15121 Kercheval Ave, Grosse Pointe Park, MI 48230.

  Whether you train in-person at the M² studio or work with Matt remotely, this app is your training hub.
  ```

- **Screenshots**: Take screenshots from your phone using Expo Go (minimum 2, recommended 4-8).
  Required sizes: Phone (1080x1920 or similar 16:9 aspect ratio).

- **App icon**: Upload the 1024x1024 icon from Step 4.

- **Feature graphic**: Create a 1024x500 banner image with the M² Training branding.

## Step 9: Fill Out Required Questionnaires

In the Play Console sidebar:

1. **Content rating** — Complete the IARC questionnaire (takes ~5 minutes).
   The app has no violent/sexual content, so ratings will be low (E for Everyone).

2. **Target audience** — Select "18 and over" (the app has youth programs but
   is operated by adults; minors use it under parental supervision).

3. **Data safety** — Declare what data you collect:
   - Personal info: Name, email (collected)
   - Financial info: Purchase history (collected via Stripe)
   - App activity: In-app interactions (collected)
   - Photos/videos: Form check uploads (collected)
   - Data is encrypted in transit: Yes
   - Data can be deleted: Yes (users can request deletion)

4. **Privacy policy** — Enter the URL to your privacy policy.
   If you have a web deployment, use: `https://YOUR_DOMAIN/privacy-policy`
   Otherwise, host the text on a simple webpage.

## Step 10: Upload the AAB & Submit

1. Go to **"Release" > "Production"** (or start with **"Testing" > "Internal testing"**).
2. Click **"Create new release"**.
3. Upload the `.aab` file you downloaded from Step 5.
4. Add release notes (e.g., "Initial release of M² Training").
5. Click **"Review release"** then **"Start rollout"**.

Google reviews typically take 3-7 days for the first submission.

---

## Updating the App Later

When you make code changes and want to publish an update:

```bash
cd artifacts/mobile
eas build --platform android --profile production
```

The `versionCode` auto-increments. Download the new `.aab` and upload it
to Play Console as a new release.

---

## Optional: Automated Submissions with EAS Submit

To skip manual uploads, set up a Google Play service account:

1. In Play Console, go to **Settings > API access**.
2. Create a service account and download the JSON key file.
3. Save it as `artifacts/mobile/play-service-account.json` (and update `serviceAccountKeyPath`
   in `eas.json` to match this filename).
4. Run: `eas submit --platform android --profile production`

This uploads directly to Play Console without manual steps.

---

## Quick Reference

| Item | Value |
|------|-------|
| Package name | `com.m2training.app` |
| App name | M² Training |
| Bundle ID | `com.m2training.app` |
| Minimum Android | API 24 (Android 7.0) |
| Build command | `eas build --platform android --profile production` |
| Submit command | `eas submit --platform android --profile production` |
