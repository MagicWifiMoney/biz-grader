# biz-grader

A free single-page tool that grades a business website on SEO, page speed, mobile, and Lighthouse best-practices. Real data — DataForSEO + Google PageSpeed Insights. Visitors can email themselves the report (Resend).

## One-click deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FMagicWifiMoney%2Fbiz-grader&env=DATAFORSEO_LOGIN,DATAFORSEO_PASSWORD,RESEND_API_KEY,RESEND_FROM,STRATEGY_CALL_URL,BRAND_NAME&envDescription=All%20env%20vars%20are%20optional.%20The%20site%20works%20with%20zero%20keys%20%E2%80%94%20the%20scan%20uses%20Google%20PageSpeed%20for%20every%20pillar%20until%20you%20add%20DataForSEO.%20Email%20capture%20needs%20RESEND_API_KEY.&project-name=biz-grader&repository-name=biz-grader)

**You don't need any API keys to start.** Click the button above, skip every env-var field, and you'll have a live site that grades any website using only Google PageSpeed (free, no signup).

When you're ready to upgrade:
- Add `RESEND_API_KEY` to turn on the "email me the report" lead-capture flow.
- Add `DATAFORSEO_LOGIN` + `DATAFORSEO_PASSWORD` to use real keyword-ranking data for the SEO pillar instead of PageSpeed's SEO check.

## Local dev

```bash
cp .env.example .env.local
# fill in DATAFORSEO_LOGIN, DATAFORSEO_PASSWORD, RESEND_API_KEY
npm install
npm run dev
```

Open http://localhost:3000.

## Required env vars

| Var | Required | Notes |
| --- | --- | --- |
| `DATAFORSEO_LOGIN` | no | DataForSEO account email. If unset, SEO pillar uses PageSpeed's SEO score instead. |
| `DATAFORSEO_PASSWORD` | no | DataForSEO API password. |
| `RESEND_API_KEY` | only for email capture | Get one at resend.com. Without it, the email-capture button returns an error. |
| `RESEND_FROM` | no | Defaults to Resend's onboarding sender. Set to a verified-domain address before going live. |
| `STRATEGY_CALL_URL` | no | CTA link in the email |
| `BRAND_NAME` | no | Footer brand in the email |

PageSpeed Insights is unauthenticated and rate-limited; for production traffic add a `PAGESPEED_API_KEY` later.

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import it at https://vercel.com/new — accept the Next.js defaults.
3. In **Project → Settings → Environment Variables**, paste the values from your `.env.local`.
4. Each push to a non-default branch gets a preview URL automatically.

## How the score is built

| Pillar | Weight | Source |
| --- | --- | --- |
| SEO | 35% | DataForSEO SERP if configured; otherwise PageSpeed SEO category |
| Speed | 25% | PageSpeed Insights performance score |
| Mobile | 20% | PageSpeed accessibility + performance (50/50) |
| Best Practices | 20% | PageSpeed best-practices score |

A scan takes ~30-60 seconds because PageSpeed runs Lighthouse server-side.
