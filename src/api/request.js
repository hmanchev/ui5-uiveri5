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

  var originalPost = superagent.post;
  var originalEnd = superagent.Request.prototype.end;

  var superRequest;
  superagent.get = function get(field) {
    superRequest = originalGet.call(superagent, field);
    return superRequest;
  };

  superagent.post = function get(field) {
    superRequest = originalPost.call(superagent, field);
    return superRequest;
  };

  superagent.Request.prototype.end = function end(fn) {
    return controlFlow.execute(function () {
      return originalEnd.call(superRequest, fn);
    }).catch(function(error) {
      that.logger.debug('Error in get request: ' + error);
    });
  };

  return superagent;
}

module.exports = function(config, instanceConfig, logger){
  return Request(config, instanceConfig, logger);
};
