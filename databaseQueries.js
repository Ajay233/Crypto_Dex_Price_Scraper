const mysql = require('mysql2/promise');
const util = require("util")
const env = process.env.NODE_ENV;
const config = require('./config/config')[env];
const connect = async () => {
  const connection = await mysql.createConnection({
    host: config.host,
    user: config.username,
    password: config.password,
    database: config.database,
    port: config.port
  })
  return connection
}


//const query = util.promisify(connection.query).bind(connection);

const test = async () => {
  const connection = await connect()
  const rows = await connection.execute("SELECT * FROM crypto_prices")
  return rows
}

const getPrices = async (currency) => {
  const connection = await connect()
  const rows = await connection.query(`SELECT 'price' FROM crypto_prices WHERE currency='${currency}'`)
  return rows
}

const setPrice = (currency, cryptoPrice) => {
  connection.connect()
  connection.query(`INSERT INTO crypto_prices (currency, price) VALUES('${currency}', '${cryptoPrice}')`, (err) => {
    if (err) throw err
    return "INSERTED"
  })
  connection.end()
}

exports.test = test;
exports.getPrices = getPrices;
exports.setPrice = setPrice;
