var superagent = require('superagent');

module.exports = function(config, instanceConfig, logger){
  var controlFlow = browser.controlFlow();
  var originalEnd = superagent.Request.prototype._end;

  superagent.Request.prototype._end = function end(fn) {
    var that = this;
    return controlFlow.execute(function () {
      return originalEnd.call(that, fn);
    }).catch(function(error) {
      logger.debug('Error in get request: ' + error);
    });
  };

  return superagent;
};
