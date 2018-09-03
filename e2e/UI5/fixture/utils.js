var pages = {
  app: require('./apps/app'),
  wait: require('./apps/wait'),
  waitRecursive: require('./apps/waitRecursive')
};

module.exports = {
  injectPageContent: function (browser, page) {
    if (pages[page]) {
      browser.executeScript(pages[page].create);
    }
  }
};
