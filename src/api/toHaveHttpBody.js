
/**
 * @constructor
 *
 */
function ToHaveHttpBody(){

}

ToHaveHttpBody.prototype.register = function(matchers) {
  var toHaveHTTPBody = function() {
    return {
      compare: function(actualResponse, expectedResponse) {
        var result = {};
        result.pass = JSON.stringify(actualResponse.body) == JSON.stringify(expectedResponse);
        result.message = 'Expected request response to have body: ' + JSON.stringify(expectedResponse)
          + ', but have: ' + JSON.stringify(actualResponse.body);

        return result;
      }
    };
  };

  matchers.toHaveHTTPBody = toHaveHTTPBody;
};

module.exports = function(){
  return new ToHaveHttpBody();
};
