const minswapScraper = require('./minswap.js')
const sundaeswapScraper = require('./sundaeswap.js')
const wingridersScraper = require('./wingriders.js')

const scrapers = {
  "https://app.minswap.org/": async (page, swapCurrency, priceCurrency) => {
    return await minswapScraper.scrapeMinswapPrice(page, swapCurrency, priceCurrency)
  },
  "https://exchange.sundaeswap.finance/#/": async (page, swapCurrency, priceCurrency) => {
    return await sundaeswapScraper.scrapeSundaeswapPrice(page, swapCurrency, priceCurrency)
  },
  "https://app.wingriders.com/pools": async (page, swapCurrency, priceCurrency) => {
    return await wingridersScraper.scrapeWingridersPrice(page, swapCurrency, priceCurrency)
  },
}

module.exports = scrapers
