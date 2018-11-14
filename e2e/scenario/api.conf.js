exports.config = {
  baseUrl: null,
  api: [
    {name: './api/request'}
  ],
  matchers: [
    {name: './api/toHaveHttpBody'},
    {name: './api/toHaveHttpHeader'},
    {name: './api/body'}
  ]
};
