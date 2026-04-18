# Kerala Hidden Trails

This is a simple local tourism guide website built with plain HTML, CSS, and JS.

## Files included

- `index.html`
- `styles.css`
- `script.js`
- `data/districts.js`
- `districts/*.html`
- `scripts/build-district-data.mjs`
- `scripts/build-district-pages.mjs`

## How to run

Option 1:
Open `index.html` directly in a browser.

Option 2:
Run a small local server from this folder.

```bash
python3 -m http.server 4181
```

Then open:

`http://localhost:4181/`

## Notes

- Internet helps load the Google Fonts.
- Internet also helps load the destination images from Wikimedia.
- Clicking destination images opens the related Wikipedia pages.
- The current version includes all 14 districts of Kerala with 5 famous places each.
- The home page shows districts only, and each district opens on its own detail page.
