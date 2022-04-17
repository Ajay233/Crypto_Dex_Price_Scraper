const scraperUtils = {
  navigateToUrl: async (page, url) => {
    try {
      await page.goto(url, {
        waitUntil: 'networkidle0',
        timeout: 120000
      });
      return true
    } catch (e) {
      console.log(`Unable to go to ${url}`)
      await page.close();
      return false
    }
  }
}

module.exports = scraperUtils
