exports.config = {
  // do not inherit integration profile as it enables screenshot reporter
  specResolver: './resolver/localSpecResolver',

  baseUrl: 'http://localhost:9000/index.html',
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
