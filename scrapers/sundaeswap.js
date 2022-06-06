const scrapeSundaeswapPrice = async (page, swapCurrency, priceCurrency) => {
  await autoScroll(page)

  const [moreButton] = await page.$x(`//div[contains(., '${swapCurrency}')]/div/div/button`);
  await page.evaluate(moreButton => moreButton.click(), moreButton)
  await page.waitForXPath(`//span[contains(., '1 ${priceCurrency} =')]`)

  const [priceText] = await page.$x(`//span[contains(., '1 ${priceCurrency} =')]`)
  const priceTextString = await page.evaluate(priceText => priceText.innerText, priceText)
  const price = extractPrice(priceCurrency, priceTextString)
  return price
}

const extractPrice = (priceCurrency, priceTextString) => {
  // Need to dynamically construct regex equal to e.g.  /(?<=tMIN = )[0-9]+.[0-9]+\S/g;
  // We'd just replace tMIN with whatever currency we want to see
  const regexStart = "(?<="
  const regexEnd = " = )[0-9]+.[0-9]+\\S"
  const regexFinal = new RegExp(regexStart + priceCurrency + regexEnd, 'g')
  return priceTextString.match(regexFinal)
}

async function autoScroll(page){
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 100;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if(totalHeight >= scrollHeight - window.innerHeight){
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}

exports.scrapeSundaeswapPrice = scrapeSundaeswapPrice
