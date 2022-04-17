const express = require('express');
const app = express();
const port = process.env.PORT || 3030;
const scraper = require('./scrapers/scraper.js')
const mysql = require('./databaseQueries.js')
const schedule = require('node-schedule')
const https = require("https");
const puppeteer = require('puppeteer')

let jobs = {};
let browser = null;
(async () => {
  browser = await puppeteer.launch({ args: ['--no-sandbox'] });
})();

// IIFE to restart any active chronjobs if the server is restarted
(async () => {
  const activeTickers = await mysql.getActiveTickers()
  activeTickers.forEach((ticker) => {
    jobs[ticker.price_currency] = schedule.scheduleJob(`*/${ticker.chron_job_frequency} * * * *`, async () => {
      const price = await scraper.scrapePrice(browser, ticker.dex_url, ticker.swap_currencies, ticker.price_currency)
      if(price !== null && price !== undefined){
        console.log("Price found and retrieved")
        mysql.setPrice(ticker.price_currency, price, ticker.dex_url)
        console.log("Price saved")
      } else {
        console.log("Price not found, nothing to save")
      }
    })
  })
  activeTickers.length > 0 ? console.log("Active tickers reinstated") : console.log("No tickers to reinstate");
})();


// Ingterval to keep dyno from sleeping
setInterval(() => {
    https.get("https://test-scraper-server.herokuapp.com/");
}, 300000);

app.use(express.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
})

app.get('/', (req, resp) => {
  console.log("Test endpoint reached")
  resp.send("Server is up and running")
})

app.get('/getPrices', async (req,resp) => {
  try{
    //let msg = await scraper.scrapePrice(url, "tADA/tMIN", "tMIN");
    const url = decodeURIComponent(req.query.dexUrl)
    let rows = await mysql.getPrices(req.query.currency, url);
    resp.json(rows)
  } catch(e) {
    console.log(e)
    resp.send("something went wrong")
  }
})

app.post('/startTickerV2', async (req, resp) => {
  try {
    jobs[req.body.priceCurrency] = schedule.scheduleJob(`*/${req.body.frequency} * * * *`, async () => {
      const price = await scraper.scrapePrice(browser, req.body.url, req.body.swapCurrency, req.body.priceCurrency)
      if(price !== null && price !== undefined){
        console.log("Price found and retrieved")
        mysql.setPrice(req.body.priceCurrency, price, req.body.url)
        console.log("Price saved")
      } else {
        console.log("Price not found, nothing to save")
      }
    })
    await mysql.saveTickerDetails(req.body.url, req.body.swapCurrency, req.body.priceCurrency, req.body.frequency)
    resp.send(`${req.body.priceCurrency} price ticker started`)
  } catch (e) {
    console.log(e)
    resp.json(e)
  }
})

app.get('/getTickersV2', async (req, resp) => {
  const activeTickers = await mysql.getActiveTickers()
  //resp.json(Object.keys(jobs))
  resp.json(activeTickers)
})

app.post('/stopTicker', async (req, resp) => {
  try {
    jobs[req.body.currency].cancel()
    delete jobs[req.body.currency]
    await mysql.deleteTicker(req.body.id)
    resp.send("Ticker cancelled")
  } catch (e) {
    console.log(e)
    resp.json(e)
  }
})

app.get('/getCurrencyList', async (req, resp) => {
  const url = decodeURIComponent(req.query.dexUrl)
  let rows = await mysql.getCurrencyList(url)
  resp.json(rows)
})

app.listen(port, () => {
  console.log(`Server started on port ${port}`)
})
