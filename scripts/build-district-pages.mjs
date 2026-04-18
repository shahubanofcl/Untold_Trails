import fs from "node:fs/promises";
import path from "node:path";

const ROOT = "/Users/saviosanil/Desktop/Shahuban project";
const DATA_FILE = path.join(ROOT, "data", "districts.js");
const DISTRICT_DIR = path.join(ROOT, "districts");

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

async function loadDistrictData() {
  const source = await fs.readFile(DATA_FILE, "utf8");
  const json = source
    .replace(/^window\.keralaDistrictsData = /, "")
    .replace(/;\s*$/, "");

  return JSON.parse(json);
}

function buildDistrictPage(data, district, index) {
  const otherDistricts = data.districts
    .filter((item) => item.id !== district.id)
    .map(
      (item) => `
        <a class="district-jump" href="./${item.id}.html">${escapeHtml(item.name)}</a>
      `
    )
    .join("");

  const placesMarkup = district.places
    .map(
      (place) => `
        <a
          class="place-card"
          href="${escapeHtml(place.wikiUrl)}"
          target="_blank"
          rel="noreferrer"
          aria-label="Open ${escapeHtml(place.name)} on Wikipedia"
        >
          <img
            src="${escapeHtml(place.image)}"
            alt="${escapeHtml(place.name)} in ${escapeHtml(district.name)}"
            loading="lazy"
          />
          <span class="place-badge">Wikipedia</span>
          <div class="place-copy">
            <p class="place-name">${escapeHtml(place.name)}</p>
            <p class="place-text">${escapeHtml(place.description)}</p>
          </div>
        </a>
      `
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(district.name)} | Kerala Hidden Trails</title>
    <meta
      name="description"
      content="${escapeHtml(district.name)} guide with famous places, images, and Wikipedia links."
    />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
      rel="stylesheet"
    />
    <link rel="stylesheet" href="../styles.css" />
  </head>
  <body>
    <div class="page-shell">
      <header class="site-header">
        <a class="brand" href="../index.html" aria-label="Kerala Hidden Trails home">
          <span class="brand-mark">K</span>
          <span class="brand-text">Kerala Hidden Trails</span>
        </a>

        <nav class="site-nav" aria-label="Primary">
          <a href="../index.html">Home</a>
        </nav>
      </header>

      <main class="detail-main">
        <section class="detail-hero" data-reveal>
          <p class="eyebrow">District Detail Page</p>
          <h1>${escapeHtml(district.name)}</h1>
          <p class="hero-text">${escapeHtml(district.intro)}</p>

          <div class="hero-actions">
            <a class="button button-primary" href="../index.html#districts">Back To Districts</a>
            <a class="button button-secondary" href="#places">View Famous Places</a>
          </div>

          <div class="detail-summary">
            <article class="overview-card">
              <p class="overview-kicker">District Number</p>
              <h3>${String(index + 1).padStart(2, "0")}</h3>
              <p>One of Kerala's 14 districts in this guide.</p>
            </article>

            <article class="overview-card">
              <p class="overview-kicker">Places Featured</p>
              <h3>${district.placeCount}</h3>
              <p>Each place card below opens its matching Wikipedia page.</p>
            </article>
          </div>
        </section>

        <section class="district-section detail-district-section" id="places" data-reveal>
          <div class="district-header">
            <div class="district-index">${String(index + 1).padStart(2, "0")}</div>
            <div>
              <h2 class="district-name">Famous Places In ${escapeHtml(district.name)}</h2>
              <p class="district-intro">Click any image card to read more about that destination on Wikipedia.</p>
            </div>
            <span class="district-pill">${district.placeCount} Places</span>
          </div>

          <div class="places-grid">
            ${placesMarkup}
          </div>
        </section>

        <section class="other-districts" data-reveal>
          <div class="section-heading">
            <p class="eyebrow">Continue Exploring</p>
            <h2>Jump to another Kerala district.</h2>
          </div>
          <div class="district-nav">
            ${otherDistricts}
          </div>
        </section>
      </main>

      <footer class="site-footer" id="contact" data-reveal>
        <p class="eyebrow">Local Run</p>
        <h2>Simple HTML, CSS, and JS pages with district-by-district navigation.</h2>
        <p>This page is part of the Kerala Hidden Trails multi-page district guide.</p>
      </footer>
    </div>

    <script src="../script.js"></script>
  </body>
</html>
`;
}

async function build() {
  const data = await loadDistrictData();
  await fs.mkdir(DISTRICT_DIR, { recursive: true });

  for (const [index, district] of data.districts.entries()) {
    const outputPath = path.join(DISTRICT_DIR, `${district.id}.html`);
    const html = buildDistrictPage(data, district, index);
    await fs.writeFile(outputPath, html);
    console.log(`Built ${outputPath}`);
  }
}

build().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
