const { processRankings, getCollections } = require("./utils");

(async () => {
  const collections = await getCollections();
  await processRankings(collections);
  process.exit(0);
})();
