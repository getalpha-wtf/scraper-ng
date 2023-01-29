const Opensea = require("opensea-scraper");
const statsApi = require("@getalpha-scraper/update-nft-stats/utils");

(async () => {
  try {
    const rankings = await Opensea.rankings(undefined, undefined, {
      logs: true,
      sort: true,
      debug: (process.env.NODE_ENV || "production") == "development",
    });
    const slugs = rankings.map((v) => v.slug);

    await statsApi.processRankings(rankings);
    await statsApi.purgeUnwanted(slugs);

    process.exit(0);
  } catch (e) {
    console.error(e.stack);
    process.exit(1);
  }
})();
