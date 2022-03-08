const express = require('express');
const app = express();
const port = process.env.PORT || 3030;
const scraper = require('./scraper.js')
const mysql = require('./databaseQueries.js')
const schedule = require('node-schedule')
const http = require("http");

let jobs = {}

// Ingterval to keep dyno from sleeping
setInterval(() => {
    http.get("https://test-scraper-server.herokuapp.com/");
}, 300000);

app.use(express.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
})

app.get('/', (req, resp) => {
  resp.send("Server is up and running")
})

app.get('/getPrices/:currency', async (req,resp) => {
  try{
    //let msg = await scraper.scrapePrice(url, "tADA/tMIN", "tMIN");
    let rows = await mysql.getPrices(req.params.currency);
    resp.json(rows)
  } catch(e) {
    console.log(e)
    resp.send("something went wrong")
  }
})

// ** NOT CURRENTLY USED **
app.post('/startTickerV1', async (req, resp) => {
  // req.url, req.swapCurrency, req.priceCurrency
  try {
    // check element exists
    const exists = await scraper.swapExists(req.body.url, req.body.swapCurrency)
    // if not throw error
    if(exists){
      // start the interval to set price every 2-5 mins
      const tickerId = setInterval(async (req) => {
        const price = await scraper.scrapePrice(req.body.url, req.body.swapCurrency, req.body.priceCurrency)
        mysql.setPrice(req.body.priceCurrency, price)
      },150000)

      // save the interval id to the db
      const result = await mysql.saveTickerDetails(tickerId, req.body.priceCurrency)
      resp.send("Ticker started")
    }else {
      resp.send("No match for that swap pair")
    }
  } catch (e) {
    console.log(e)
    resp.json(e)
  }
})

app.post('/startTickerV2', async (req, resp) => {
  try {
    jobs[req.body.priceCurrency] = schedule.scheduleJob(`*/${req.body.frequency} * * * *`, async () => {
      const price = await scraper.scrapePrice(req.body.url, req.body.swapCurrency, req.body.priceCurrency)
      console.log("Price found and retrieved")
      mysql.setPrice(req.body.priceCurrency, price)
      console.log("Price saved")
    })
    resp.send(`${req.body.priceCurrency} price ticker started`)
  } catch (e) {
    console(e)
    resp.json(e)
  }
})

app.get('/getTickersV2', (req, resp) => {
  resp.json(Object.keys(jobs))
})

app.post('/stopTicker', async (req, resp) => {
  try {
    jobs[req.body.currency].cancel()
    delete jobs[req.body.currency]
    resp.send("Ticker cancelled")
    //const result = mysql.deleteTicker(req.tickerId, req.currency)
  } catch (e) {
    console.log(e)
    resp.json(e)
  }
})

app.listen(port, () => {
  console.log(`Server started on port ${port}`)
})
