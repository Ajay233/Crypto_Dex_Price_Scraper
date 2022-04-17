const minswapScraper = require('./minswap.js')

const scrapers = {
  "https://app.minswap.org/": async (page, swapCurrency, priceCurrency) => {
    return await minswapScraper.scrapeMinswapPrice(page, swapCurrency, priceCurrency)
  }
}

module.exports = scrapers
