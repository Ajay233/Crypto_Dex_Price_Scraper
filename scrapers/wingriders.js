const scrapeWingridersPrice = async (page, swapCurrency, priceCurrency) => {
  let pageNumber = 1;
  let poolFound = false;
  let noMorePages = false
  let [priceElem] = [];
  let [adaElem] = [];
  let price = 0;

  // Work out what the last page number is (keeps increasing so we have ot get this each time)
  let [lastPageButton] = await page.$x("//*[@data-testid='ArrowForwardIosSharpIcon']/parent::button/following-sibling::div/button[last()]")
  const lastPage = await page.evaluate(lastPageButton => lastPageButton.innerText, lastPageButton)

  // If we don't find the pool on the first page, we navigate to each page one by one checking for the pool, until every
  // page has been checked
  while(!poolFound && !noMorePages){
    [priceElem] = await page.$x(`//p[contains(., '${priceCurrency} value')]/parent::div/parent::div`);
    if(pageNumber === parseInt(lastPage)){
      noMorePages = true
    }else if(priceElem === null || priceElem === undefined){
      pageNumber++;
      await navigateToNextPage(page, pageNumber)
    } else {
      [adaElem] = await page.$x(`//p[contains(., '${priceCurrency} value')]/parent::div/parent::div/preceding-sibling::div[1]`);
      poolFound = true
    }
  }

  // If we found the pool we will have the elements and can extract the prices
  if(poolFound){
    const priceTextString = await page.evaluate(priceElem => priceElem.textContent, priceElem)
    const adaTextString = await page.evaluate(adaElem => adaElem.textContent, adaElem)
    const currencyVal = extractPrice(`MIN value`, priceTextString).join('').replace(/\s/g, '')
    const adaValue = extractPrice("ADA value", adaTextString).join('').replace(/\s/g, '')

    // Until Wingriders add the price of 1 token, we have to get the swap pair and divde them to get the price
    price = parseFloat(adaValue)/parseFloat(currencyVal)
  }

  // TODO: error handling if no page has the pool we're looking for

  return price
}

const navigateToNextPage = async (page, pageNumber) => {
  // console.log(`navigating to page ${pageNumber}`)
  const [button] = await page.$x(`//button[contains(., ${pageNumber})]`);
  await page.evaluate(button => button.click(), button)
  return
}

const extractPrice = (priceCurrency, priceTextString) => {
  // Need to dynamically construct regex equal to e.g.  /(?<=tMIN = )[0-9]+.[0-9]+\S/g;
  // We'd just replace tMIN with whatever currency we want to see
  const regexStart = "(?<="
  const regexEnd = ")[0-9\\s]+.[0-9\\s]+"
  const regexFinal = new RegExp(regexStart + priceCurrency + regexEnd, 'g')
  return priceTextString.match(regexFinal)
}

exports.scrapeWingridersPrice = scrapeWingridersPrice
