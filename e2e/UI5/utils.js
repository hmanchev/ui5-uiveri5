var pages = {
  app: require('./pageContent/app'),
  wait: require('./pageContent/wait'),
  waitRecursive: require('./pageContent/waitRecursive')
};

module.exports = {
  injectPageContent: function (browser, page) {
    if (pages[page]) {
      browser.executeScript(pages[page].create);
    }
  }
};
