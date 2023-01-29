const { db, Nft } = require("./models");
const { Op } = require("sequelize");
const Axios = require("axios").default;

/**
 * @param {any[]} collection
 * @param {number} size
 * @returns {Generator<any[]>}
 */
function* getBatches(collection, size) {
  for (let i = 0; i < collection.length; i += size) {
    yield collection.slice(i, i + size);
  }
}

/**
 * @param {number} start
 * @param {number} stop
 */
function randomNumber(start, stop) {
  return +(Math.random() * (stop - start) + start).toFixed(0);
}

/** @param {number} ms */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * @param {Record<string, string>} collection
 * @returns {Promise<void>}
 */
async function processCollection(collection, tries = 3) {
  tries--;

  const url = `https://api.opensea.io/api/v1/collection/${collection.slug}/stats`;

  const stats = await Axios.get(url, {
    headers: { "X-API-KEY": process.env.OPENSEA_API },
    timeout: 4000,
    validateStatus: (s) => s === 200,
  })
    .then((r) => r.data?.stats || null)
    .catch((e) => console.error(`error '${e.message}' in ${collection.slug}`));

  if (stats == null) {
    if (tries > 0) {
      console.log("Tries left %d for collection %s", tries, collection.slug);
      await sleep(randomNumber(1000, 2000));
      return processCollection(collection, tries);
    } else {
      console.log("Ignoring %s", collection.slug);
    }
  } else {
    await Nft.upsert(
      {
        logo: collection.logo,
        slug: collection.slug,
        name: collection.name,
        floorPrice: stats.floor_price,
        sevenDayVolume: stats.one_day_volume,
        twentyFourHourSales: stats.one_day_sales,
        twentyFourHourVolume: stats.one_day_volume,
        twentyFourHourAveragePrice: stats.one_day_average_price,
        twentyFourHourChangeVolume: +(stats.one_day_change * 100).toFixed(2),
      },
      { conflictFields: ["slug"] }
    );
    console.log("Done %s", collection.slug);
  }
}

/**
 * @param {Record<string, string>[]} rankings
 * @returns {Promise<void>}
 **/
async function processRankings(rankings) {
  await db.authenticate();
  await db.sync({ alter: true, force: false });

  for (const batch of getBatches(rankings, 4)) {
    const jobs = [];
    for (const collection of batch) {
      jobs.push(processCollection(collection, 3));
    }
    await Promise.all(jobs);
    await sleep(randomNumber(1000, 2000));
  }
}

/**
 * @param {string[]} slugs
 * @returns {Promise<number>}
 */
async function purgeUnwanted(slugs) {
  await db.authenticate();
  await db.sync({ alter: true, force: false });
  return Nft.destroy({ where: { slug: { [Op.notIn]: slugs } } });
}

async function getCollections() {
  await db.authenticate();
  await db.sync({ alter: true, force: false });
  const nfts = await Nft.findAll();
  return JSON.parse(JSON.stringify(nfts));
}

module.exports = {
  purgeUnwanted,
  processRankings,
  getCollections,
};
