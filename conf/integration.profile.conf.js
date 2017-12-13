exports.config = {
  specResolver: './resolver/localSpecResolver',
  pageLoading: {
    /* used to overcome issues due to pending async  work that was started before the waitForUI5 was injected */
    wait: '10000'
  },
  takeScreenshot: {
    onExpectFailure: true
  },
  reporters: [
    {name: './reporter/screenshotReporter'}
  ]
};
