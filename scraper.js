const puppeteer = require('puppeteer')

const scrapePrice = async (url, swapCurrency, priceCurrency) => {

  // Connect to the specified URL and wait until this process is complete
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url, {
    waitUntil: 'networkidle0'
  });

  // Find the button to get the button ID
  await page.waitForXPath(`//button[contains(., '${swapCurrency}')]`)
  const [elem] = await page.$x(`//button[contains(., '${swapCurrency}')]`)
  const buttonId = await page.evaluate(elem => elem.id, elem)

  // Use the button ID to create the panel ID
  const xPathFinal = createIdXpath(buttonId)

  // Use the panel ID to find the div with the price
  await page.waitForXPath(xPathFinal)
  const [priceElem] = await page.$x(xPathFinal)
  let priceTextString = await page.evaluate(priceElem => priceElem.innerText, priceElem)

  // Extract the price from the string
  const price = extractPrice(priceCurrency, priceTextString)
  await browser.close();
  return `The price of ${priceCurrency} is: ${price} tADA`
};

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

exports.scrapePrice = scrapePrice;
