exports.config = {
  specResolver: './resolver/localSpecResolver',
  pageLoading: {
    wait: '20000'//,
    //initialReload: true
  },
  baseUrlQuery: ['sap-ui-debug=true','sap-ui-testcooperation-debug=true'] // TODO consider activating this with flag
};
