exports.config = {
  // do not inherit integration profile as it enables screenshot reporter
  specResolver: './resolver/localSpecResolver',

  baseUrl: 'https://sapui5.hana.ondemand.com/sdk/',
  specs: './*.spec.js',

  browsers: [{
    browserName: 'chrome',
    capabilities: {
      chromeOptions: {
        args: ['--headless', '--no-sandbox']
      },
    }
  }]
};
