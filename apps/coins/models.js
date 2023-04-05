const { Sequelize, Model, DataTypes } = require("sequelize");
const { TEXT, DECIMAL, ARRAY } = DataTypes;

const db = new Sequelize(process.env.DB_URI, {
  dialect: "postgres",
  logQueryParameters: true,
  logging: false,
});

class Coin extends Model {}

Coin.init(
  {
    id: { primaryKey: true, type: TEXT() },
    symbol: { defaultValue: "", type: TEXT() },
    name: { defaultValue: "", type: TEXT() },
    coinLogoUrl: { defaultValue: "", type: TEXT() },
    currentPrice: { defaultValue: 0, type: DECIMAL() },
    priceChangeTwentyFourHour: { defaultValue: 0, type: DECIMAL() },
    priceChangePercentageTwentyFourHour: { defaultValue: 0, type: DECIMAL() },
    marketCap: { defaultValue: 0, type: DECIMAL() },
    marketCapRank: { defaultValue: 0, type: DECIMAL() },
    priceActionTwentyFourHour: { type: ARRAY(DECIMAL()) },
    priceActionSevenDays: { type: ARRAY(DECIMAL()) },
  },
  {
    sequelize: db,
    tableName: "coins",
    timestamps: false,
  }
);

module.exports = {
  db,
  Coin,
};
