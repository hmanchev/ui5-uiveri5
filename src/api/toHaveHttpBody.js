
/**
 * @constructor
 *
 */
function ToHaveHttpBody(){

}

ToHaveHttpBody.prototype.register = function(matchers) {
  var toHaveHttpBody = function() {
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

  matchers.toHaveHttpBody = toHaveHttpBody;
};

module.exports = function(){
  return new ToHaveHttpBody();
};
