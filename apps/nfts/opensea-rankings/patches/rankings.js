// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality
const puppeteer = require("puppeteer-extra");
// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

/**
 * Scrapes all collections from the Rankings page at https://opensea.io/rankings
 * options = {
 *   nbrOfPages: number of pages that should be scraped? (defaults to 1 Page = top 100 collections)
 *   debug: [true,false] enable debugging by launching chrome locally (omit headless mode)
 *   logs: [true,false] show logs in the console
 *   browserInstance: browser instance created with puppeteer.launch() (bring your own puppeteer instance)
 * }
 */
const rankings = async (
  type = "total",
  chain = undefined,
  optionsGiven = {}
) => {
  const optionsDefault = {
    debug: false,
    logs: false,
    additionalWait: 0, // waittime in milliseconds, after page loaded, but before stating to scrape
    browserInstance: undefined,
  };
  const options = { ...optionsDefault, ...optionsGiven };
  const { debug, logs, additionalWait, browserInstance } = options;
  const customPuppeteerProvided = Boolean(optionsGiven.browserInstance);
  logs && console.log(`=== OpenseaScraper.rankings() ===\n`);

  // init browser
  /** @type {import("puppeteer").Browser} */
  let browser = browserInstance;
  if (!customPuppeteerProvided) {
    browser = await puppeteer.launch({
      headless: !debug, // when debug is true => headless should be false
      args: ["--start-maximized"],
    });
  }

  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(0);
  logs && console.log("...opening url: https://opensea.io/rankings");
  await page.goto("https://opensea.io/rankings", { waitUntil: "load" });

  logs && console.log("...🚧 waiting for cloudflare to resolve");
  await page.waitForSelector(".cf-browser-verification", { hidden: true });

  logs && console.log("...extracting __NEXT_DATA variable");
  const __NEXT_DATA__ = await page.evaluate(() => {
    const nextDataStr = document.getElementById("__NEXT_DATA__").innerText;
    return JSON.parse(nextDataStr);
  });

  // extract relevant info
  const top100 = _parseNextDataVarible(__NEXT_DATA__);
  logs && console.log(`🥳 DONE. Total ${top100.length} Collections fetched: `);
  return top100;
};

function _parseNextDataVarible(__NEXT_DATA__) {
  const extractFloorPrice = (windowCollectionStats, extractionMethod) => {
    try {
      if (extractionMethod === "multichain") {
        return {
          amount: Number(windowCollectionStats.floorPrice.unit),
          currency: windowCollectionStats.floorPrice.symbol.toUpperCase(),
        };
      }
      return {
        amount: Number(windowCollectionStats.floorPrice.eth),
        currency: "ETH",
      };
    } catch (err) {
      return null;
    }
  };
  const extractCollection = (node) => {
    return {
      name: node.name,
      slug: node.slug,
      logo: node.logo,
      isVerified: node.isVerified,
      floorPrice: extractFloorPrice(node.windowCollectionStats),
      floorPriceMultichain: extractFloorPrice(
        node.windowCollectionStats,
        "multichain"
      ),
      // statsV2: node.statsV2, // 🚧 comment back in if you need additional stats
      // windowCollectionStats: node.windowCollectionStats, // 🚧 comment back in if you need additional stats
    };
  };
  return __NEXT_DATA__.props.relayCache[0][1].json.data.rankings.edges.map(
    (obj) => extractCollection(obj.node)
  );
}

module.exports = rankings;
