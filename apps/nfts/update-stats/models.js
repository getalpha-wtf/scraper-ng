require("dotenv").config();
const { Sequelize, Model, DataTypes } = require("sequelize");

const db = new Sequelize(process.env.DB_URI, {
  logging: false,
  dialect: "postgres",
});

class Nft extends Model {}

Model.init(
  {
    slug: { type: DataTypes.TEXT(), primaryKey: true },
    name: { type: DataTypes.TEXT() },
    logo: { type: DataTypes.TEXT(), allowNull: true },
    floorPrice: { type: DataTypes.DECIMAL(), defaultValue: 0 },
    twentyFourHourVolume: { type: DataTypes.DECIMAL(), defaultValue: 0 },
    twentyFourHourChangeVolume: { type: DataTypes.DECIMAL(), defaultValue: 0 },
    twentyFourHourAveragePrice: { type: DataTypes.DECIMAL(), defaultValue: 0 },
    sevenDayVolume: { type: DataTypes.DECIMAL(), defaultValue: 0 },
    twentyFourHourSales: { type: DataTypes.DECIMAL(), defaultValue: 0 },
  },
  { sequelize: db, timestamps: false, tableName: "nft" }
);

module.exports = {
  db,
  Nft,
};
