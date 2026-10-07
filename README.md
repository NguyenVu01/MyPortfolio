# Portfolio, Trung Nguyên

Static, dependency-free portfolio site. Dark futuristic theme, neon blue/purple accents,
glassmorphism cards, bilingual EN/VI, responsive down to 360px.

## Run it

Open `index.html` directly in a browser, or serve the folder:

```bash
python3 -m http.server 4321 --directory .
```

Then visit http://localhost:4321

## Before going live: replace the placeholder domain

`https://your-domain.com` appears in **three files** and must be swapped for your real
domain or social previews and search listings will break:

| File | What |
| --- | --- |
| `index.html` | `<link rel="canonical">`, `og:url`, `og:image`, `twitter:image`, plus `url` and `image` in the JSON-LD block |
| `robots.txt` | the `Sitemap:` line |
| `sitemap.xml` | the `<loc>` value |

`og:image` and `twitter:image` **must be absolute URLs**. A relative path shows no
preview image at all.

Also still placeholder: the GitHub and LinkedIn URLs (`https://github.com/`,
`https://linkedin.com/`) in the nav, contact list and JSON-LD `sameAs`, plus the
displayed handles `linkedin.com/in/nguyen` and `github.com/nguyen`.

## Structure

```
index.html          all content, both languages
css/style.css       design tokens and all styling (numbered sections at the top)
js/main.js          language, menu, reveal, scroll spy, dialogs, spotlight
robots.txt          crawler rules
sitemap.xml         single-page sitemap
_headers            caching and security headers (Netlify / Cloudflare Pages)
.nojekyll           lets GitHub Pages serve _-prefixed paths
tools/og-card.html  source for the social preview image (see below)
Assets/
  avatar.png        hero portrait (yours)
  og-image.jpg      1200x630 social preview card
  background.webp   38 KB version the site actually loads
  background-sm.webp  8 KB version served below 640px
  thumbs/*.svg      project thumbnails, one per engagement (generated)
  badges/*.svg      certification badges (generated, swap for official badge art)
  logos/*.png       employer marks (see "Employer logos" below)
  clients/*.png     client logos, backgrounds stripped for the dark theme
originals/          your unprocessed source files, not used by the site (see below)
```

## Sections, in page order

1. **Hero**: availability badge, headline, stat strip, tech stack, floating capability
   cards and identity card over the portrait
2. **Featured Projects**: the 5 engagements from the CV. The lead one spans two columns,
   which also makes 6 cards fill a 3-up grid exactly. Each opens a detail dialog.
3. **Experience**: vertical timeline, EY (current) then Deloitte
4. **Clients I Have Worked With**: auto-looping logo marquee
5. **Certifications**: 6 credentials
6. **Reach Out**: email, location, LinkedIn, GitHub

## Employer logos

The site loads `Assets/logos/deloitte.png` and `ey-mark.png`. Your unprocessed files are
in `originals/employer-logos/`.

Both originals arrived with an opaque white background (Deloitte's also carried a baked-in
transparency checkerboard and "cleanpng" watermarks) and dark or mid-grey wordmarks that
were invisible on a dark card. Processing stripped the background, recoloured the neutral
ink to white and kept the brand accents (Deloitte's green dot, EY's yellow beam). EY's
"Building a better working world" tagline was cropped off because it is illegible at tile
size.

Sizing follows the same rule as the client marquee: Deloitte is a 5:1 wordmark and EY a
compact 1.2:1 mark, so each gets its own height through `.tl-logo--deloitte img { --lh }`
and `.tl-logo--ey img { --lh }`. One shared size leaves one tiny and the other huge.

## Language switching (EN / VI)

English lives in the HTML, so the page reads correctly with JavaScript disabled and search
engines index it in English. Vietnamese rides along in `data-vi` attributes (and
`data-vi-label` for `aria-label`s), swapped in by `setLang()` in `js/main.js`.

**To edit a translation**, find the element and change its `data-vi` value. To translate
something new, add a `data-vi` attribute, no JS change needed.

Two rules matter:

- A `data-vi` element must never contain another `data-vi` element. Switching replaces
  `innerHTML`, so a nested one would be destroyed and never come back.
- `data-vi` may contain markup (the headline carries its own `<span class="grad">`), but
  quotes inside must be escaped as `&quot;`.

The choice is remembered in `localStorage`, and first-time visitors with a Vietnamese
browser locale get Vietnamese automatically.

## Typography note

The site deliberately avoids em dashes and middle dots as separators. Use commas, colons,
parentheses or a second line instead. En dashes are kept only in date ranges
("Apr 2026 – Present"), matching the CV.

## No CV download

There is deliberately no resume or CV download anywhere: no file link in the nav, no
download button in the contact section. The only contact route is email.

## The background image

Your nebula sits behind the whole site as a fixed backdrop, built from three stacked
layers in `.bg-fx` (section 3 of `css/style.css`):

1. `.bg-photo`, the image at `opacity: .72`
2. `.bg-scrim`, gradients that darken it, weighted to the **left** where all the text sits,
   so the nebula stays vivid on the right behind the portrait
3. the existing orbs, grid and noise on top

**If you want the nebula stronger,** raise `.bg-photo { opacity }`, but lift the scrim
alphas with it or body copy over the bright purple corner loses contrast. The two are tuned
as a pair. The layer is `position: fixed` rather than `background-attachment: fixed`, which
stutters badly on iOS.

## Regenerating the social preview card

`Assets/og-image.jpg` is a screenshot of `tools/og-card.html`. After changing your name,
title or portrait:

```bash
google-chrome --headless=new --window-size=1200,630 --virtual-time-budget=8000 --screenshot=og.png http://localhost:4321/tools/og-card.html
```

then convert it:

```bash
python3 -c "from PIL import Image; Image.open('og.png').convert('RGB').save('Assets/og-image.jpg','JPEG',quality=88,optimize=True)"
```

## Original source files

`originals/` holds everything you supplied that the site does not load: the three design
mockups, the seven raw client logos, the two employer logos and the 1.8 MB nebula PNG.
It is about 6.4 MB and has its own README explaining what each file produced.

**Delete it before deploying** (or exclude it from the upload), otherwise those files ship
to your host for nothing:

```bash
rm -rf originals
```

Keep it locally if you might reprocess a logo, since background removal is not reversible.

## Deploying

The site is plain static files, no build step.

- **Cloudflare Pages / Netlify**: point at this folder, leave the build command empty and
  the output directory as `/`. `_headers` is picked up automatically.
- **GitHub Pages**: push and enable Pages on the branch. `.nojekyll` is required so the
  `_headers` file does not make Jekyll choke; the header rules themselves are ignored there.

## Adding a client logo

Drop the file in `Assets/clients/`, then add **two** `.logo-chip` blocks in the marquee,
one in each half of the track. The loop is a duplicated set translated by exactly `-50%`,
so both halves must stay identical or the animation will jump.

Two details that matter:

- Spacing lives on `.logo-chip { margin-right }`, not a flex `gap`. With a `gap` the track
  width is not an exact multiple of one set and the loop stutters every cycle.
- Each logo gets its own height through `.lc-<name> img { --lh: ... }`. Aspect ratios range
  from 7.7:1 (Agribank) to 1.4:1 (the SBV seal), so one shared `max-height` makes some look
  tiny and others enormous. Tune `--lh` by eye until the optical weight matches its
  neighbours.

Logos sit on white chips because most source files are dark-on-white; that keeps every
brand legible against the dark background.

## Theming

All colours, radii, spacing and easing are CSS custom properties at the top of
`css/style.css` (`:root`). Changing `--cyan` and `--violet` re-skins the whole site.

`--ink-mute` is set to `#7885ad` rather than something dimmer because that is the lightest
value which still clears the WCAG AA 4.5:1 contrast threshold against the glass card
surface (it measures 4.83:1). Darkening it fails accessibility on card meta text.

## Responsive behaviour

Below 1080px the hero stacks and the display copy centres (hero text, stat labels, section
headings, tech stack, contact panel). The portrait is centred once stacked, so left-aligned
text beside it reads lopsided. Body copy inside cards stays left-aligned, because centred
paragraphs are harder to read.

## Notes

- No build step, no framework, no runtime dependencies. Fonts load from Google Fonts and
  fall back to system fonts offline.
- Project dialogs use the native `<dialog>` element, so the focus trap, Esc-to-close and
  focus restore come from the browser. Backdrop click and body scroll lock are added in JS.
  Where `showModal` is unsupported the "View details" buttons hide themselves.
- The mobile menu transitions `opacity, transform`, **not** the `all` shorthand. Including
  `visibility` in a transition leaves the panel unfocusable for the full 300 ms, which
  silently breaks moving keyboard focus into it. Same reason on `.to-top`.
- `prefers-reduced-motion` is respected: reveals, the marquee, the orbit ring and the
  floating cards all stop, and the client strip becomes manually scrollable.
- `.claude/launch.json` is only for the local preview server, safe to delete.
