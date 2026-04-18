import fs from "node:fs/promises";
import path from "node:path";

const ROOT = "/Users/saviosanil/Desktop/Shahuban project";
const DATA_FILE = path.join(ROOT, "data", "districts.js");

const DISTRICTS = [
  {
    name: "Thiruvananthapuram",
    intro: "Kerala's capital district blends famous beaches, hill stations, temple heritage, and calm backwater escapes.",
    places: [
      "Kovalam",
      "Varkala Beach",
      "Padmanabhaswamy Temple",
      "Ponmudi",
      "Poovar",
    ],
  },
  {
    name: "Kollam",
    intro: "Kollam pairs classic backwaters with lighthouse views, forest routes, and some of Kerala's best-known waterfalls.",
    places: [
      "Ashtamudi Lake",
      "Jatayu Earth's Center Nature Park",
      "Palaruvi Falls",
      "Thenmala",
      "Tangasseri",
    ],
  },
  {
    name: "Pathanamthitta",
    intro: "Pilgrimage centers, river villages, and forest gateways make Pathanamthitta feel spiritual, green, and quietly scenic.",
    places: [
      "Sabarimala",
      "Aranmula",
      "Gavi, Kerala",
      "Perunthenaruvi Falls",
      "Konni, Kerala",
    ],
  },
  {
    name: "Alappuzha",
    intro: "Alappuzha is the postcard district of houseboats, beaches, canals, and slow-moving backwater landscapes.",
    places: [
      "Alappuzha",
      "Alappuzha Beach",
      "Pathiramanal",
      "Krishnapuram Palace",
      "Ambalappuzha Sree Krishna Temple",
    ],
  },
  {
    name: "Kottayam",
    intro: "Known for lakeside calm, highland drives, and viewpoint-rich escapes, Kottayam mixes water, hills, and heritage.",
    places: [
      "Kumarakom",
      "Vagamon",
      "Illikkal Kallu",
      "Ilaveezhapoonchira",
      "Ettumanoor Mahadeva Temple",
    ],
  },
  {
    name: "Idukki",
    intro: "Idukki is mountain Kerala at its most dramatic, with tea country, wildlife parks, dams, and cool-climate valleys.",
    places: [
      "Munnar",
      "Thekkady",
      "Eravikulam National Park",
      "Mattupetty Dam",
      "Idukki Dam",
    ],
  },
  {
    name: "Ernakulam",
    intro: "Ernakulam brings together metro energy, waterfront history, palace sites, and beach edges around Kochi.",
    places: [
      "Kochi",
      "Fort Kochi",
      "Mattancherry Palace",
      "Cherai Beach",
      "Hill Palace, Tripunithura",
    ],
  },
  {
    name: "Thrissur",
    intro: "Culture, temples, waterfalls, and classic Kerala landmarks make Thrissur one of the state's richest travel districts.",
    places: [
      "Thrissur",
      "Guruvayur Temple",
      "Athirappilly Falls",
      "Vazhachal Falls",
      "Vadakkumnathan Temple",
    ],
  },
  {
    name: "Palakkad",
    intro: "Palakkad opens into forts, forest reserves, dams, and hill roads shaped by the state's great mountain gap.",
    places: [
      "Palakkad Fort",
      "Silent Valley National Park",
      "Malampuzha Dam",
      "Nelliyampathy",
      "Parambikulam Tiger Reserve",
    ],
  },
  {
    name: "Malappuram",
    intro: "Malappuram mixes river towns, hill parks, waterfall stops, and some of Kerala's best-known green landscapes.",
    places: [
      "Nilambur",
      "Kottakkunnu",
      "Adyanpara Falls",
      "Teak Museum",
      "Ponnani",
    ],
  },
  {
    name: "Kozhikode",
    intro: "Kozhikode moves easily between historic coast, port life, famous landing points, and inland waterfall trails.",
    places: [
      "Kozhikode",
      "Kozhikode Beach",
      "Kappad",
      "Mananchira",
      "Thusharagiri Falls",
    ],
  },
  {
    name: "Wayanad",
    intro: "Wayanad is a highland escape of caves, dams, peaks, waterfalls, and wildlife-rich forest terrain.",
    places: [
      "Edakkal Caves",
      "Banasura Sagar Dam",
      "Chembra Peak",
      "Soochipara Falls",
      "Pookode Lake",
    ],
  },
  {
    name: "Kannur",
    intro: "Kannur brings together forts, beaches, hill viewpoints, and strong cultural identity along north Kerala's coast.",
    places: [
      "Kannur",
      "St. Angelo Fort",
      "Muzhappilangad Drive-in Beach",
      "Kannur Beach",
      "Paithalmala",
    ],
  },
  {
    name: "Kasaragod",
    intro: "Kasaragod stands out for grand forts, temple landscapes, hill stations, riverfront views, and long coastal stretches.",
    places: [
      "Bekal Fort",
      "Ranipuram",
      "Ananthapura Lake Temple",
      "Hosdurg Fort",
      "Valiyaparamba",
    ],
  },
];

const HEADERS = {
  "user-agent": "KeralaHiddenTrailsBuilder/1.0 (Codex local project)",
  accept: "application/json",
};

function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function fetchJson(url) {
  const response = await fetch(url, { headers: HEADERS });
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${url}`);
  }
  return response.json();
}

async function fetchSummary(title) {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
    title
  )}`;
  const response = await fetch(url, { headers: HEADERS });
  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  if (!data || data.type === "https://mediawiki.org/wiki/HyperSwitch/errors/not_found") {
    return null;
  }

  return data;
}

async function resolveSummary(query) {
  const direct = await fetchSummary(query);
  if (direct?.title) {
    return direct;
  }

  const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&format=json&srlimit=5&srsearch=${encodeURIComponent(
    query
  )}`;
  const search = await fetchJson(searchUrl);
  const results = search?.query?.search ?? [];

  for (const result of results) {
    const summary = await fetchSummary(result.title);
    if (summary?.title && (summary.thumbnail?.source || summary.originalimage?.source)) {
      return summary;
    }
  }

  throw new Error(`Could not resolve a Wikipedia page for "${query}"`);
}

function chooseImage(summary) {
  if (summary.thumbnail?.source) {
    return summary.thumbnail.source;
  }

  if (summary.originalimage?.source) {
    return summary.originalimage.source;
  }

  throw new Error(`No image found for "${summary.title}"`);
}

function firstSentence(text) {
  if (!text) {
    return "";
  }

  const parts = text.split(/(?<=[.!?])\s+/);
  return parts[0] || text;
}

function displayNameFor(query) {
  return query.replace(/, Kerala$/i, "").trim();
}

async function build() {
  const districts = [];
  let placeCount = 0;

  for (const [districtIndex, district] of DISTRICTS.entries()) {
    const districtId = slugify(district.name);
    const places = [];

    console.log(`\nBuilding ${district.name}...`);

    for (const [placeIndex, placeQuery] of district.places.entries()) {
      const summary = await resolveSummary(placeQuery);
      const imageUrl = chooseImage(summary);
      const description =
        firstSentence(summary.extract) || summary.description || `${summary.title} in Kerala.`;

      places.push({
        query: placeQuery,
        name: displayNameFor(placeQuery),
        description,
        wikiUrl: summary.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(summary.title)}`,
        image: imageUrl,
      });

      placeCount += 1;
      console.log(`  ${placeCount}. ${placeQuery} -> ${summary.title}`);
    }

    districts.push({
      id: districtId,
      name: district.name,
      intro: district.intro,
      placeCount: places.length,
      places,
    });
  }

  const output = `window.keralaDistrictsData = ${JSON.stringify(
    {
      updatedAt: new Date().toISOString(),
      districtCount: districts.length,
      placeCount,
      districts,
    },
    null,
    2
  )};\n`;

  await fs.writeFile(DATA_FILE, output);
  console.log(`\nSaved ${DATA_FILE}`);
}

build().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
