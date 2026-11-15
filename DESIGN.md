# Vellora Elegance — Design contract

## Brand overview
Vellora Elegance sells feminine occasion and everyday-luxury fashion (satin slip dresses, evening gowns, tailoring, knits) to Brazilian women 25–50 who want to feel polished without effort. Tagline: "Vista sua melhor versão". The site should feel calm, confident and editorial — like a high-end Brazilian fashion house (reference: Lelis — structure and restraint only, never its assets or copy).

## Design thesis
White gallery walls, big editorial photography, and a quiet serif voice: the clothes are the color, the interface steps back.

## Colors
| Name | Value | Token / setting | Role |
|---|---|---|---|
| Paper | #FFFFFF | `color_background` / `--color-bg` | Page surface, header, utility bar |
| Mist | #F2F0ED | `color_background_alt` / `--color-bg-alt` | Bands, card media background |
| Ink | #1A1714 | `color_text` / `--color-text` | Text, primary button, cart badge |
| Vellora gold | #876A3F | `color_accent` / `--color-accent` | Eyebrows, small accents, button hover (passes 4.5:1 on white) |
| Champagne | #E7DCC8 | `color_champagne` | Soft band backgrounds, selection |
| Sale | #8E2B2B | `color_sale` | Compare-at / sale price |
Gold is punctuation only — never large fills, never text below 12px.

## Typography
| Role | Family | Weight | Size | Line height | Tracking | Notes |
|---|---|---|---|---|---|---|
| Display / hero | Cormorant (`cormorant_n4`), fallback serif | 400 (+ italic for one accent word) | clamp(44px, 5.6vw, 88px) | 0.98 | -0.01em | Sentence case. Italic only on the highlighted word (`<em>`). |
| Headings | Cormorant | 400 | h1 32–56px, h2 26–40px | 1.12 | 0 | Sentence case |
| Wordmark | Cormorant | 400 | 24–29px desktop, 19px mobile | 1 | 0.16em | Uppercase |
| Nav / labels / buttons | Jost (`jost_n4`, 500 for medium), fallback sans-serif | 500 | 10.5–12.5px | 1.4 | 0.14–0.22em | Uppercase, small only |
| Body | Jost | 400 | 15px | 1.7 | 0.01em | Max ~70ch |

## Spacing and composition
- Page max width 1440px (`page_width`), wide containers +160px; gutter clamp(20px, 4vw, 56px).
- Section spacing 96px desktop / ~58px mobile (`section_spacing`).
- Radius 0 everywhere (`border_radius`). No shadows except the scrolled header's soft 30px blur.
- Hairline borders: Ink at 12% alpha.
- Photography is full-bleed or edge-to-edge in grids; minimal frames.

## Components
- **Utility bar** (`announcement-bar`): white, hairline bottom; left quick links, centered rotating message, right WhatsApp link. Side links hidden < 990px.
- **Header**: white, sticky, solid (never transparent). Desktop: wordmark left → uppercase nav → inline underline search field → account → bag. Mobile: burger | centered wordmark | search icon + bag. Menu = `menu-vellora`.
- **Hero** (`hero-slideshow`): full-width banner 43.75vw tall (16:7) desktop, ~4:5 mobile. Per slide: cover or contain-on-color image, optional eyebrow, serif headline with one italic word, light button. Thin progress bars centered at bottom, chevrons at the edges, pause/play bottom-right. Left-aligned text gets a left-to-right shade.
- **Primary button**: Ink fill, white uppercase Jost 11.5px / 0.22em, 48–52px tall, gold wipe on hover, scale 0.97 on press.
- **Light button**: white fill, Ink text (on photography).
- **Text link**: uppercase small label with 1px underline.
- **Product card**: 3:4 image on Mist, name + price below, quick add.

## Dos and Don'ts
- Do let photography lead; one strong image beats three weak ones.
- Do keep copy short, Portuguese, sentence case.
- Do use the gold accent sparingly.
- Don't add decorative shapes, badges or gradients for decoration.
- Don't use script fonts, all-caps headlines, or italics beyond one accent word.
- Don't put light text on light imagery without the hero shade.
- Don't hardcode images — every image comes from a picker setting.

## Motion philosophy
Slow, fabric-like: crossfades of ~1s, a gentle 8s settle-zoom on hero images, text rising 20px with `cubic-bezier(0.16, 1, 0.3, 1)`. Micro-interactions 150–350ms. Press feedback by scale. Everything is disabled under `prefers-reduced-motion`, and the slideshow auto-pauses on hover, focus, hidden tab or reduced motion, with a visible pause/play button.
