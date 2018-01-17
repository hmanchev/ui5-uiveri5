
var _ = require('lodash');

describe("configParser", function() {
  var logger = require('../src/logger')(3);
  var configParser = require('../src/configParser')(logger);

  it('Should override basic types and objects',function(){
    var config = {
      conf: __dirname + '/configParser/conf.js',  // cofig file with data to override
      provider: {name:'test',key:'value'}};        // comming from command-line

    var mergedConfig = configParser.mergeConfigs(config);
    expect(mergedConfig.provider).toEqual({name:'test',key:'value'});
  });

  it('Should merge arrays in config', function () {
    var config = {
      conf: __dirname + '/configParser/conf.js',  // default config file
      multi: [{name: 'option2'}]
    };

    var mergedConfig = configParser.mergeConfigs(config);

    expect(mergedConfig.multi).toEqual([{name: 'option1'}, {name: 'option2'}]);
  });
});
