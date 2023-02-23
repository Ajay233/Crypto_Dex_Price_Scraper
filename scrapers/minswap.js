const scrapeMinswapPrice = async (page, swapCurrency, priceCurrency) => {

  const pathToPrice = `//div[contains(text(), '${swapCurrency}')]/parent::div/parent::div/child::div[contains(., "₳")]`

  try {
    await page.waitForXPath(pathToPrice)
  } catch (e) {
    console.log(`Could not find button containing ${swapCurrency}`)
    await page.close();
    return
  }

  // Get the element with the price in ADA for the specified pool
  const [elem] = await page.$x(pathToPrice);

  // Get the inner text e.g '0.070405 ₳'
  const priceText = await page.evaluate(elem => elem.innerText, elem);

  // Remove the ' ₳' from the price and return the price for saving to the DB
  const price = convertToPrice(priceText);
  return price;
}

const convertToPrice = (priceString) => {
  const price = priceString.replace(" ₳", "")
  return price;
}

// TODO: decide how to error handle in the scraper method before implementing this
const swapExists = async (page, swapCurrency) => {
  try {
    await page.waitForXPath(`//button[contains(., '${swapCurrency}')]`)
    return elem.length > 0 ? true : false
  } catch (e) {
    console.log(`Could not find button containing ${swapCurrency}`)
    await page.close();
    return false
  }
}

exports.scrapeMinswapPrice = scrapeMinswapPrice
