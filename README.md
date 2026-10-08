# AAvisit

**AI-powered website analytics.** Add one script to your site. AAvisit tracks who visits, where they come from and how long they stay, then an AI reads the numbers, researches your audience, tells you what to change on your pages, and drafts the email to send at your peak traffic hour.

Built solo for **ForgeHacks 2026**.

## What it does

- **Tracks visits:** country, page, time of day and time spent, using a tiny JavaScript snippet.
- **Analytics dashboard:** visits, unique visitors, average time, bounce rate with trends, a day-by-hour traffic heatmap, top countries, time-spent distribution, new vs returning visitors, and a per-page table comparing actual time on page against target time.
- **AI insights (Featherless AI):** infers the audience profile, flags the pages where people leave too early and suggests specific fixes, and writes a ready-to-send email timed 30 minutes before the peak hour.
- **AI banner (YouCam API):** generates a header image for the email.
- **Sends the email (Agentboxd):** one tap sends the drafted email, with the banner, from a real agent inbox.

## Architecture

```
 Website ──(tracker snippet)──▶ Momen (GraphQL API + database)
                                      │
                              Dashboard (HTML/JS) reads visits
                                      │ stats JSON
                                      ▼
                       n8n workflow ──▶ Featherless AI ──▶ insights + email draft
                                      │
                       n8n workflow ──▶ YouCam API ──▶ AI banner image
                                      │
                       n8n workflow ──▶ Agentboxd ──▶ email delivered
```

## Live demo

- Live app: _add your Netlify link here_
- Demo video: _add your video link here_

## Tools used

| Tool | Role |
|---|---|
| **Momen** | Backend: database and auto-generated GraphQL API for visits |
| **Featherless AI** | The model that analyses traffic and writes recommendations and the email |
| **n8n Cloud** | Workflows that call the AI and send the email, keeping API keys out of the browser |
| **YouCam API** | Text-to-image model that generates the email banner |
| **Agentboxd** | Real email inbox the agent sends from |

## Repo structure

```
README.md                          This file
tracker.js                         Script a site owner adds to their website
demo-site.html                     Sample site with the tracker built in
dashboard.html                     The analytics dashboard + AI insights panel
n8n-ai-insights-workflow.json      Webhook -> Featherless AI -> response
n8n-send-email-workflow.json       Webhook -> Agentboxd send -> response
n8n-banner-workflow.json           Webhook -> YouCam text-to-image -> wait -> fetch result
```

## Setup

### 1. Momen (database + API)
Create a table named `VISIT` with these text fields (API names will differ in your project; set them in `FIELDS` in the tracker, demo site and dashboard):

| Field | Type |
|---|---|
| Visitor_id | Text |
| Country | Text |
| Page | Text |
| Duration | Text (seconds) |
| Visited_at | Text (ISO time) |

Under the table's **Permission** tab, allow the anonymous user to **read, insert and update**, then **Publish**. Copy the GraphQL endpoint and the table API name.

### 2. n8n (AI and email)
Import the three `n8n-*-workflow.json` files (or rebuild them: each is Webhook -> HTTP Request -> Respond to Webhook).
- In `n8n-ai-insights-workflow.json`, replace `YOUR_FEATHERLESS_API_KEY`.
- In `n8n-send-email-workflow.json`, replace `YOUR_AGENTBOXD_API_KEY` and `YOUR_AGENTBOXD_INBOX_ID`.
- In `n8n-banner-workflow.json`, replace `YOUR_YOUCAM_API_KEY`.
- Set each Webhook's **Respond** option to "Using 'Respond to Webhook' Node", then **Publish** both workflows and copy their production webhook URLs.

### 3. Configure the placeholders
Search for and replace these values:

| Placeholder | Files | Value |
|---|---|---|
| `YOUR_MOMEN_GRAPHQL_ENDPOINT` | tracker, demo-site, dashboard | Momen GraphQL URL |
| `YOUR_N8N_INSIGHTS_WEBHOOK_URL` | dashboard | Production URL of the insights workflow |
| `YOUR_N8N_SEND_WEBHOOK_URL` | dashboard | Production URL of the send-email workflow |
| `YOUR_N8N_BANNER_WEBHOOK_URL` | dashboard | Production URL of the banner workflow |

### 4. Run it
- Open `demo-site.html` (or add the tracker to any site). The status bar shows the visit being recorded.
- Open `dashboard.html`. Use the **Demo data** toggle for a full-looking dataset, then tap **Generate AI insights**.
- Tap **Generate banner** (takes about 40 seconds) to create the email header image with YouCam.
- Enter an address and tap **Send this email**.

## Security notes

- No API keys live in the front-end. Featherless, YouCam and Agentboxd keys are stored only in n8n.
- The Momen table allows anonymous inserts so the tracker can write without a login. A production version would use per-site tokens and rate limiting.
- The send webhook should be protected (a secret header or signed requests) before real use.

## Roadmap

- Automatic scheduled send at the detected peak hour
- Multiple sites per account with per-site tokens
- Tracking sessions and funnels, not just page views
- Verified sending domain (SPF, DKIM, DMARC) for inbox delivery

## Author

Built by a solo developer for ForgeHacks 2026.
