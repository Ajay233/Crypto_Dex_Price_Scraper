const scrapers = require('./scraperMethods.js')
const scraperUtils = require('./scraperUtils.js')

const scrapePrice = async (browser, url, swapCurrency, priceCurrency) => {
  const page = await browser.newPage();

  // Connect to the specified URL and wait until this process is complete
  let pageLoaded = await scraperUtils.navigateToUrl(page, url)

  // Find the button to get the button ID
  if(pageLoaded){

    // Dynamically Use the scraper method for the relevant dex
    const price = await scrapers[url](page, swapCurrency, priceCurrency)
    await page.close();
    console.log(`The price of ${priceCurrency} is: ${price} ADA`)
    return price
  }
};

exports.scrapePrice = scrapePrice;
