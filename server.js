const express = require('express');
const app = express();
const port = 3030;
const scraper = require('./scraper.js')
const mysql = require('./databaseQueries.js')

const url = 'https://testnet.minswap.org'
// const url = 'https://exchange.sundaeswap.finance/#/'

app.get('/', async (req,resp) => {
  try{
    //let msg = await scraper.scrapePrice(url, "tADA/tMIN", "tMIN");
    let rows = await mysql.getPrices("tTEST");
    resp.json(rows[0])
  } catch(e) {
    console.log(e)
    resp.send("something went wrong")
  }
})

app.listen(port, () => {
  console.log(`Server started on port ${port}`)
})
