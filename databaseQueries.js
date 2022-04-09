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

const setPrice = async (currency, cryptoPrice, dexUrl) => {
  const connection = await connect()
  const result = await connection.query(`INSERT INTO crypto_prices (currency, price, dex_url) VALUES('${currency}', ${cryptoPrice}, '${dexUrl}')`);
  await connection.end()
  return result[0]
}

const getPrices = async (currency, dexUrl) => {
  const connection = await connect()
  const rows = await connection.query(`SELECT price, created FROM crypto_prices WHERE currency='${currency}' AND dex_url='${dexUrl}'`);
  await connection.end()
  return rows[0]
}

const saveTickerDetails = async (url, swapCurrency, currency, freq) => {
  const connection = await connect()
  const result = await connection.query(`INSERT INTO crypto_tickers (dex_url, swap_currencies, price_currency, chron_job_frequency) VALUES('${url}', '${swapCurrency}', '${currency}', '${freq}')`);
  await connection.end()
  return result[0]
}

const getActiveTickers = async () => {
  const connection = await connect()
  const rows = await connection.query(`SELECT * FROM crypto_tickers`);
  return rows[0]
}

const deleteTicker = async (tickerId) => {
  clearInterval(tickerId)
  const connection = await connect()
  const result = await connection.query(`DELETE FROM crypto_tickers WHERE id='${tickerId}'`);
  await connection.end()
  return result[0]
}

const getCurrencyList = async (dexUrl) => {
  const connection = await connect()
  const result = await connection.query(`SELECT DISTINCT currency FROM crypto_prices WHERE dex_url='${dexUrl}'`)
  await connection.end()
  return result[0]
}

exports.setPrice = setPrice;
exports.getPrices = getPrices;
exports.saveTickerDetails = saveTickerDetails;
exports.getActiveTickers = getActiveTickers;
exports.deleteTicker = deleteTicker;
exports.getCurrencyList = getCurrencyList;
