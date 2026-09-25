# Adstra Digital: Meta Ads & Google Ads API Integration Guide

This guide documents the architecture, developer setup, credential configuration, and operating instructions for the official Meta Ads and Google Ads API integration in Adstra Digital.

---

## 1. Core Operating Architecture

### 1.1 Direct Customer Account Billing (Zero Agency Markup)
- **Zero Platform Payments by Dashboard**: Adstra Digital never collects or processes customer advertising funds.
- All media spend is billed directly to the client's own connected credit card / billing profile on Meta Ads Manager and Google Ads.
- Adstra Digital acts purely as an authorized management dashboard via official OAuth 2.0 permissions.

### 1.2 Multi-Platform Workflow
```
Adstra Dashboard
       │
       ▼
Create Multi-Platform Campaign
  ├── Select Meta Ads and / or Google Ads
  ├── Pick Connected Ad Account / Customer ID
  ├── Configure Creative (Image/Video, Copy, Headline, Destination URL)
  └── Configure Audience (Locations, Age, Gender, Languages)
       │
       ▼
Review & Validate Campaign
       │
       ▼
Publish via Official API
  ├── Meta: Campaign -> Ad Set -> Ad Creative -> Ad (Created as PAUSED for review)
  └── Google: Budget -> Campaign -> Ad Group -> Responsive Search Ad
       │
       ▼
Sync & Lifecycle Controls
  ├── Bi-directional daily metric synchronization (Spend, Impressions, Clicks, Leads, ROI)
  ├── Remote Pause & Resume
  ├── Remote Budget Updates
  └── Deep links to Meta Ads Manager & Google Ads Console
```

---

## 2. Security & Token Encryption

Access tokens and refresh tokens are sensitive and are **never stored in plaintext** or exposed to client browsers.

1. **AES-256 Fernet Encryption**:
   - Implemented in `backend/apis/social/encryption.py`.
   - Tokens are encrypted at rest using an encryption key derived from `ENCRYPTION_KEY` or `SECRET_KEY`.
2. **Exclusion from Serializers**:
   - `PlatformConnectionSerializer` explicitly excludes `access_token_encrypted` and `refresh_token_encrypted` from all REST API responses.
3. **Automatic Refresh**:
   - Meta 60-day long-lived tokens and Google Ads refresh tokens are automatically refreshed proactively when nearing expiration via `backend/apis/social/token_service.py`.

---

## 3. Developer Console Setup

### 3.1 Meta Ads Setup (Meta for Developers)
1. Go to [Meta for Developers](https://developers.facebook.com/) and create a **Business** App.
2. Under "Add Products to Your App", add **Marketing API**.
3. Under App Settings -> Advanced, ensure the app is in Development or Live Mode.
4. Under Marketing API -> Settings -> OAuth Redirect URIs, add:
   ```
   http://localhost:8000/api/social/platform-connections/meta/callback/
   https://yourdomain.com/api/social/platform-connections/meta/callback/
   ```
5. Required Permissions requested during user authorization:
   - `ads_management`
   - `ads_read`
   - `pages_read_engagement`
   - `business_management`
6. Copy the **App ID** and **App Secret** to your backend `.env`:
   ```env
   META_APP_ID=your_meta_app_id
   META_APP_SECRET=your_meta_app_secret
   META_REDIRECT_URI=http://localhost:8000/api/social/platform-connections/meta/callback/
   ```

### 3.2 Google Ads Setup (Google Cloud Console - 2026 OAuth REST Model)
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Enable the **Google Ads API**.
3. Under **APIs & Services > Credentials**, create an **OAuth 2.0 Client ID** (Web application).
4. Add Authorized Redirect URIs:
   ```
   http://localhost:8000/api/social/platform-connections/google/callback/
   https://yourdomain.com/api/social/platform-connections/google/callback/
   ```
5. Configure OAuth Consent Screen with scope:
   - `https://www.googleapis.com/auth/adwords`
6. Copy the **Client ID** and **Client Secret** to your backend `.env`:
   ```env
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_REDIRECT_URI=http://localhost:8000/api/social/platform-connections/google/callback/
   ```

---

## 4. Built-in Sandbox Mode

If live `META_APP_ID` or `GOOGLE_CLIENT_ID` credentials are not yet supplied in the `.env` file, the platform **gracefully operates in Sandbox Mode**:
- `meta_ads_service.py` and `google_ads_service.py` automatically detect the absence of API keys.
- Simulated ad accounts, customer IDs, and published IDs are returned.
- Testing campaign creation, publishing pipelines, error handling, pause/resume, and metrics syncing works out of the box without real ad spend or live accounts.
- In the **Social Settings > Ad Platform Connections** tab, click **Connect Sandbox** to instantly pair a mock ad account for any client.

---

## 5. Background Scheduled Sync

To automatically sync performance metrics for all published campaigns in the background:

### Run manually:
```bash
python manage.py sync_ad_campaigns
```

### Options:
```bash
# Sync campaigns for a specific client
python manage.py sync_ad_campaigns --client=1

# Sync a specific campaign
python manage.py sync_ad_campaigns --campaign=5
```

### Production Cron Setup (Recommended: every 6 hours):
```cron
0 */6 * * * cd /path/to/backend && /path/to/venv/bin/python manage.py sync_ad_campaigns >> /var/log/adstra_ad_sync.log 2>&1
```

---

## 6. Endpoints Summary

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/social/platform-connections/` | List all platform connections (filter by `client_id`, `platform`) |
| `GET` | `/api/social/platform-connections/meta/oauth-url/` | Get Meta OAuth authorization dialog URL |
| `GET` | `/api/social/platform-connections/google/oauth-url/` | Get Google OAuth consent screen URL |
| `POST`| `/api/social/platform-connections/sandbox-connect/` | Instant mock connection for testing |
| `POST`| `/api/social/platform-connections/{id}/refresh-token/`| Manually trigger token renewal |
| `POST`| `/api/social/platform-connections/{id}/disconnect/` | Disconnect account and clear tokens |
| `GET` | `/api/social/platform-connections/{id}/ad-accounts/` | List accessible ad accounts / pages / customers |
| `POST`| `/api/social/platform-connections/{id}/set-account/` | Save selected ad account or customer ID |
| `POST`| `/api/social/ad/campaigns/{id}/publish/` | Publish campaign to Meta & Google APIs |
| `POST`| `/api/social/ad/campaigns/{id}/sync/` | Sync campaign metrics from ad platforms |
| `POST`| `/api/social/ad/campaigns/{id}/pause/` | Pause campaign across all platforms |
| `POST`| `/api/social/ad/campaigns/{id}/resume/` | Resume campaign across all platforms |
| `POST`| `/api/social/ad/campaigns/{id}/update-budget/` | Update daily budget across all platforms |
| `GET` | `/api/social/ad/campaigns/{id}/detail/` | Get platform IDs, snapshots, timeline, and attribution |
