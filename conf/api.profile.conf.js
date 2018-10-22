var integrationProfile = require('./integration.profile.conf');
exports.config = {
  specResolver: integrationProfile.config.specResolver,
  pageLoading: integrationProfile.config.pageLoading,
  takeScreenshot: integrationProfile.config.takeScreenshot,
  reporters: integrationProfile.config.reporters,
  api: [
    {name: './api/request'}
  ],
  matchers: [
    {name: './api/toHaveHttpBody'},
    {name: './api/toHaveHttpHeader'},
    {name: './api/body'}
  ]
};
