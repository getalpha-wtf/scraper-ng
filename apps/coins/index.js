require("dotenv").config();

const { db, Coin } = require("./models");
const Axios = require("axios").default;
const { Op } = require("sequelize");

(async () => {
  try {
    await db.authenticate();
    await db.sync({ force: false, alter: true });

    const coinEntries = await Axios.get(
      "https://api.coingecko.com/api/v3/coins/markets",
      {
        params: {
          vs_currency: "usd",
          order: "market_cap_desc",
          sparkline: true,
          per_page: 250,
          page: 1,
        },
      }
    )
      .then((r) => r.data)
      .then((r) =>
        r.map((r) => ({
          id: r.id,
          coinLogoUrl: r.image,
          currentPrice: r.current_price,
          marketCap: r.market_cap || 0,
          name: r.name,
          marketCapRank: r.market_cap_rank || 0,
          priceActionTwentyFourHour: r.sparkline_in_7d.price.slice(-24),
          priceActionSevenDays: r.sparkline_in_7d.price,
          priceChangePercentageTwentyFourHour:
            r.price_change_percentage_24h || 0,
          priceChangeTwentyFourHour: r.price_change_24h || 0,
          symbol: r.symbol,
        }))
      );

      
    const ids = []
    for (const coinEntry of coinEntries) {
      try {
        await Coin.upsert(coinEntry, {conflictFields: ["id"]})
        console.log(`Upserted ${coinEntry.id}`)
      } catch (error) {
        console.error(`FAILED=${coinEntry.id}\nERROR=${error.stack}`)
      } finally {
        ids.push(coinEntry.id)
      }
    }

    const deleteCount = await Coin.destroy({
      where: { id: { [Op.notIn]: ids } },
    });
    console.log(`${deleteCount} purged`);
  } catch (e) {
    console.error(e.stack);
  } finally {
    await db.close();
  }
})();
