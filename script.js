const districtData = window.keralaDistrictsData;

const districtDirectory = document.querySelector("#district-directory");
const districtCountTargets = document.querySelectorAll(
  "#hero-district-count, #overview-district-count"
);
const placeCountTargets = document.querySelectorAll(
  "#hero-place-count, #overview-place-count"
);

function trimText(text, maxLength = 132) {
  if (!text || text.length <= maxLength) {
    return text || "";
  }

  return `${text.slice(0, maxLength).trimEnd()}...`;
}

function updateCounts(data) {
  const districtCount = String(data?.districtCount ?? 0);
  const placeCount = String(data?.placeCount ?? 0);

  districtCountTargets.forEach((node) => {
    node.textContent = districtCount;
  });

  placeCountTargets.forEach((node) => {
    node.textContent = placeCount;
  });
}

function renderDistrictDirectory(data) {
  if (!districtDirectory) {
    return;
  }

  if (!data?.districts?.length) {
    districtDirectory.innerHTML =
      '<p class="empty-state">District data could not be loaded.</p>';
    return;
  }

  const cardMarkup = data.districts
    .map(
      (district, index) => `
        <a class="district-link-card" href="./districts/${district.id}.html">
          <div class="district-link-image">
            <img
              src="${district.places[0]?.image ?? ""}"
              alt="${district.name}"
              loading="lazy"
            />
          </div>
          <div class="district-link-body">
            <div class="district-link-topline">
              <span class="district-link-index">${String(index + 1).padStart(2, "0")}</span>
              <span class="district-pill">${district.placeCount} Places</span>
            </div>
            <h3 class="district-link-name">${district.name}</h3>
            <p class="district-link-text">${trimText(district.intro, 150)}</p>
            <div class="district-link-tags">
              ${district.places
                .slice(0, 3)
                .map((place) => `<span>${place.name}</span>`)
                .join("")}
            </div>
            <span class="district-link-cta">Open District Page</span>
          </div>
        </a>
      `
    )
    .join("");

  districtDirectory.innerHTML = cardMarkup;
}

function setupRevealAnimation() {
  const revealItems = document.querySelectorAll("[data-reveal]");

  if (!("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -40px 0px",
    }
  );

  revealItems.forEach((item, index) => {
    item.style.transitionDelay = `${index * 35}ms`;
    observer.observe(item);
  });
}

updateCounts(districtData || {});
renderDistrictDirectory(districtData || {});
setupRevealAnimation();
