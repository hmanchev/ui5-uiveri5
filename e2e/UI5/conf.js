exports.config = {
  profile: 'integration',
  baseUrl: 'http://localhost:9000/',
  specs: './**/*.spec.js',
  timeouts: {
    getPageTimeout: '40000',
    allScriptsTimeout: '44000',
    defaultTimeoutInterval: '120000',
    waitForUI5Delta: '500'
  }
};
