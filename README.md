# MindfulVector

Static ecommerce site for MindfulVector — Creatine Gummies.
Operated by **Nutrialfa Alimentos LTDA** (Brasil).

Live: https://mindfulvector.online

## Stack

Pure static HTML/CSS/JS — no build step, no framework, no backend.
Deployed on Vercel from this GitHub repo.

## Structure

```
.
├── index.html                  # Homepage
├── shop.html                   # Product detail
├── cart.html                   # Cart (localStorage)
├── checkout.html               # Checkout form (DEMO — needs payment gateway)
├── about.html                  # About us
├── contact.html                # Contact form
├── faq.html                    # FAQ (15 items)
├── blog.html                   # Journal index
├── blog-*.html                 # 6 articles
├── privacy.html | terms.html   # Legal
├── refund.html | shipping.html
├── returns.html | cookies.html
├── 404.html                    # Custom 404
├── sitemap.xml                 # SEO
├── robots.txt
├── vercel.json                 # Vercel config (headers, cleanUrls, redirects)
└── assets/
    ├── css/style.css
    ├── js/main.js              # Cart, FAQ accordion, form handlers
    └── img/                    # (add product photos here)
```

## Deploying

1. Push to GitHub.
2. Import the repo in Vercel.
3. Frame preset: **Other** (no build command, no output dir).
4. Add custom domain `mindfulvector.online` in Vercel project settings → Domains.
5. Done.

`cleanUrls: true` in `vercel.json` makes `/shop` work instead of `/shop.html`.

## Before going live

- [ ] Integrate real payment gateway in `checkout.html` (Stripe / PayPal) — current submit is demo only.
- [ ] Wire up contact form (`data-contact-form` handler in `main.js`) to a real endpoint (Formspree, Resend API, your own backend).
- [ ] Replace CSS-only product jar with real photography in `assets/img/`.
- [ ] Add Google Analytics 4 tag before `</head>` in all pages.
- [ ] Verify domain in Google Search Console & submit sitemap.
- [ ] Confirm `support@mindfulvector.online` and `privacy@mindfulvector.online` mailboxes work.
- [ ] Replace placeholder reviews with real, permissioned customer quotes.

## Cart state

Stored in `localStorage` under key `mv_cart_v1`. No backend required for cart persistence on the same browser.

## License

Proprietary — © Nutrialfa Alimentos LTDA. All rights reserved.
