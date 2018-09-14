var superagent = require('superagent');

/**
 * @constructor
 *
 */
function Request(){

  var controlFlow = browser.controlFlow();
  var originalGet = superagent.get;
  var originalEnd = superagent.Request.prototype.end;
  // var originalThen = superagent.Request.prototype.then;

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
    return controlFlow.execute(function(){return originalEnd.call(superRequest, fn)});
  };

  return superagent;
}

module.exports = function(){
  return Request;
};
