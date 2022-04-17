const scrapeMinswapPrice = async (page, swapCurrency, priceCurrency) => {
  try {
    await page.waitForXPath(`//button[contains(., '${swapCurrency}')]`)
  } catch (e) {
    console.log(`Could not find button containing ${swapCurrency}`)
    await page.close();
    return
  }
  const [elem] = await page.$x(`//button[contains(., '${swapCurrency}')]`)
  const buttonId = await page.evaluate(elem => elem.id, elem)

  // Use the button ID to create the panel ID
  const xPathFinal = createIdXpath(buttonId)

  // Use the panel ID to find the div with the price and extract the innerText
  await page.waitForXPath(xPathFinal)
  const [priceElem] = await page.$x(xPathFinal)
  let priceTextString = await page.evaluate(priceElem => priceElem.innerText, priceElem)

  // Extract the price form the innerText string
  const price = extractPrice(priceCurrency, priceTextString)
  return price
}

const createIdXpath = (id) => {
  let panelId = id.replace('button', 'panel')
  return `//div[@id='${panelId}']`
}

const extractPrice = (priceCurrency, priceTextString) => {
  // Need to dynamically construct regex equal to e.g.  /(?<=tMIN = )[0-9]+.[0-9]+\S/g;
  // We'd just replace tMIN with whatever currency we want to see
  const regexStart = "(?<="
  const regexEnd = " = )[0-9]+.[0-9]+\\S"
  const regexFinal = new RegExp(regexStart + priceCurrency + regexEnd, 'g')
  return priceTextString.match(regexFinal)
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
