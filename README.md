# animebar.github.io

My personal site. Plain HTML, CSS, and vanilla JS — no framework, no build
step, no dependencies. Open `index.html` in a browser and it works.

**Live at:** https://animebar.github.io

---

## Files

```
index.html          Everything you'll edit — all content lives here
assets/style.css    All styling; design tokens at the top of the file
assets/main.js      Dark mode, scroll effects, contact form submit
assets/resume.pdf   Drop your résumé here (the "Résumé" button links to it)
404.html            Friendly not-found page
.nojekyll           Tells GitHub Pages to skip Jekyll processing
```

## Editing content

All text is in `index.html`, organised by section with `<!-- ==== -->`
comment banners. To restyle rather than rewrite, edit the CSS custom
properties in the `:root` block at the top of `assets/style.css` — changing
`--accent` recolours the whole site.

### Before you publish — the placeholders

| Where | What to change |
|---|---|
| `index.html` — contact form | `YOUR_FORM_ID` → your Formspree ID (see below) |
| `assets/resume.pdf` | Add the file (button 404s until you do) |

```bash
grep -n "YOUR_FORM_ID" index.html
```

### Adding a job to the timeline

Copy an existing `<li class="timeline-item">` in the Experience section and
edit it — newest first. The shape is:

```html
<li class="timeline-item">
  <div class="timeline-meta">2021 — 2023</div>
  <div class="timeline-body">
    <h3>Job Title <span class="at">·</span> <span class="org">Company</span></h3>
    <p class="loc">City, Country</p>
    <ul>
      <li>Lead with impact and scale, not the task list.</li>
    </ul>
    <ul class="tags small"><li>Python</li><li>AWS</li></ul>
  </div>
</li>
```

The dot, connecting line, and spacing are all automatic — no CSS to touch.

## Making the contact form work

The form needs one free third-party service because GitHub Pages is static
and can't send email. [Formspree](https://formspree.io) free tier gives you
50 submissions/month, no credit card:

1. Sign up at https://formspree.io
2. Create a new form → copy the endpoint ID (looks like `xdkogqyw`)
3. In `index.html`, replace `YOUR_FORM_ID` in the form's `action`
4. Submit the form once yourself to confirm the email arrives

Until you do this, the form shows a clear "not configured yet" message
rather than silently failing. A hidden honeypot field (`_gotcha`) filters
most spam bots automatically.

## Local preview

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

Or just double-click `index.html` — there's no build step, so it works
straight from the filesystem.

## Deploying

Pushing to `main` publishes automatically; GitHub Pages serves the repo root.
Changes go live in roughly 30–60 seconds.

```bash
git add -A && git commit -m "Update site" && git push
```

### Custom domain (optional, ~$12/yr)

Hosting stays free — you'd only pay a registrar for the domain.

1. Buy a domain (Cloudflare Registrar and Namecheap are both cheap)
2. Add a `CNAME` file at the repo root containing just your domain
3. At your registrar, point DNS at GitHub:
   - Four `A` records for the apex domain → `185.199.108.153`,
     `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - One `CNAME` for `www` → `animebar.github.io`
4. In repo Settings → Pages, enter the domain and tick **Enforce HTTPS**

## Cost

| Item | Cost |
|---|---|
| GitHub Pages hosting | Free, no card required |
| HTTPS certificate | Free (automatic) |
| Formspree contact form | Free up to 50 msgs/month |
| Custom domain | Optional, ~$12/yr |

## Notes

- Dark mode follows your OS by default and remembers a manual override
  in `localStorage`.
- `Cmd+P` prints a clean one-page résumé — the print stylesheet strips
  the nav, terminal card, and form.
- Everything is keyboard navigable with a skip link and visible focus rings;
  animations respect `prefers-reduced-motion`.
