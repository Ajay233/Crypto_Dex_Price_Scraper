const express = require('express');
const app = express();
const port = 3030;
const scraper = require('./scraper.js')
const mysql = require('./databaseQueries.js')

const url = 'https://app.minswap.org'
//const url = 'https://testnet.minswap.org'
//const url = 'https://exchange.sundaeswap.finance/#/'

app.use(express.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
})

app.get('/', async (req, resp) => {
  try {
    const result = await scraper.swapExists(url, "ADA/MIN")
    if(result){
      resp.send("we found something")
    } else {
      resp.send("No match for that swap")
    }
  } catch (e) {
    console.log(e)
    resp.json(e)
  }
})

app.get('/getPrices/:currency', async (req,resp) => {
  try{
    //let msg = await scraper.scrapePrice(url, "tADA/tMIN", "tMIN");
    let rows = await mysql.getPrices(req.params.currency);
    console.log(rows)
    resp.json(rows)
  } catch(e) {
    console.log(e)
    resp.send("something went wrong")
  }
})

app.post('/startTicker', async (req, resp) => {
  console.log(req.body)
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


app.post('/setPrice', async (req, resp) => {
  try {
    const price = await scraper.scrapePrice(req.body.url, req.body.swapCurrency, req.body.priceCurrency)
    await mysql.setPrice(req.body.priceCurrency, price)
    resp.send("Price found and saved")
  } catch (e) {
    console.log(e)
    resp.json(e)
  }
})

app.get('/getTickers', async (req, resp) => {
  try {
    const tickers = await mysql.getActiveTickers();
    resp.json(tickers)
  } catch (e) {
    console.log(e)
    resp.json(e)
  }
})

app.post('/stopTicker', async (req, resp) => {
  try {
    const result = mysql.deleteTicker(req.tickerId, req.currency)
  } catch (e) {
    console.log(e)
    resp.json(e)
  }
})

app.listen(port, () => {
  console.log(`Server started on port ${port}`)
})
