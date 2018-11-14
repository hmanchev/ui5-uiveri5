var superagent = require('superagent');

module.exports = function(config, instanceConfig, logger){
  var controlFlow = browser.controlFlow();
 
  var flow = function(superagent) { 
    superagent.do = function() {
      var self = this;
      return controlFlow.execute(function () {
        return self.then();
      });
    }
  };

  return superagent.agent().use(flow);
};
