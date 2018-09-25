var superagent = require('superagent');

/**
 * @constructor
 *
 */
function Request(config, instanceConfig, logger){
  var that = this;

  this.logger = logger;

  var controlFlow = browser.controlFlow();
  var originalGet = superagent.get;
  var originalEnd = superagent.Request.prototype.end;

  var superRequest;
  superagent.get = function get(field) {
    console.log('Getting field: ' + field);

    var controlFlowPromise = controlFlow.execute(function() {
      superRequest = originalGet.call(superagent, field);
      return superRequest;
    });

    return controlFlowPromise;
  };

  superagent.Request.prototype.end = function end(fn) {
    console.log('Called end');
    return controlFlow.execute(function(){return originalEnd.call(superRequest, fn)}).catch(function(error) {
      that.logger.debug('Error in get request: ' + error);
    });
  };

  return superagent;
}

module.exports = function(config, instanceConfig, logger){
  return Request(config, instanceConfig, logger);
};
