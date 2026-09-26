# Approved Detail Hero Release

Approved source: the local `previews/live-with-depth-v1/` page, including its current content, references, personal profile, legal details and styling.

## Public Version

- Fixed Detail artwork; no visitor-facing image picker, depth controls or preview links.
- Visibility 71%, depth strength 100%, cell relief 100%, scroll focus enabled.
- The same single-surface depth projection, smoothing and scroll limits as the tested preview.
- Static image fallback; respects reduced-motion settings and suspends drawing off-screen.
- Self-contained assets under `assets/`; no deployed dependency on `previews/` or `node_modules/`.
- Existing CMS, contacts, form behavior and cookie preference key retained. CMS-only visual controls added.
- Original PNG image and map preserved locally. Public WebP versions are lossless and decoded pixel equality was checked.

## Checks

- 33 local tests passed, including depth-map alignment and non-inverted geometry at maximum effect.
- Public CMS content matches the approved preview exactly, apart from the added visual settings.
- Browser checks: desktop, 390px and 320px mobile layouts, populated canvas pixels, changing pixel samples on scroll, no horizontal overflow, mobile navigation, contact links and operator details.
- Static fallback was checked separately without loading the WebGL module.
- The existing contact form opens an email draft; no test email was sent.

Run the production-only checks with `node --test tests/production.test.mjs`.

## Deployment

GitHub Pages publishes the repository's `main` branch to `https://www.bemer-lucie.cz/`.
The local preview, alternative artworks, tuning panel, QA files and working backups are intentionally excluded from the release.
The pre-release tracked version is commit `c486417`; local pre-edit HTML and content backups are under `output/before-detail-release-2026-09-26/`.
