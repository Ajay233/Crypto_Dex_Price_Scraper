const mysql = require('mysql2/promise');
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

// TODO - refactor into one method that takes a query as a param

const setPrice = async (currency, cryptoPrice) => {
  const connection = await connect()
  const result = connection.execute(`INSERT INTO crypto_prices (currency, price) VALUES('${currency}', ${cryptoPrice})`);
  return result[0]
}

const getPrices = async (currency) => {
  const connection = await connect()
  const rows = await connection.query(`SELECT price, created FROM crypto_prices WHERE currency='${currency}'`)
  return rows[0]
}

const saveTickerDetails = async (tickerId, currency) => {
  const connection = await connect()
  const result = await connection.query(`INSERT INTO crypto_tickers (ticker_id, currency) VALUES(${tickerId}, '${currency}')`)
  return result[0]
}

const getActiveTickers = async () => {
  const connection = await connect()
  const rows = await connection.query(`SELECT * FROM crypto_tickers`)
  return rows[0]
}

const deleteTicker = async (tickerId, currency) => {
  clearInterval(tickerId)
  const connection = await connect()
  const result = await connection.query(`DELETE FROM crypto_tickers WHERE ticker_id=${tickerId} AND currency='${currency}'`)
  return result[0]
}

exports.setPrice = setPrice;
exports.getPrices = getPrices;
exports.saveTickerDetails = saveTickerDetails;
exports.getActiveTickers = getActiveTickers;
exports.deleteTicker = deleteTicker;