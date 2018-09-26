
/**
 * @constructor
 *
 */
function ToHaveHttpHeader(){

}

ToHaveHttpHeader.prototype.register = function(matchers) {
  var toHaveHTTPHeader = function() {
    return {
      compare: function(actualResponse, expectedResponse) {
        var result = {};
        var pass = false;

        if(actualResponse.header && actualResponse.header[expectedResponse[0].toLowerCase()]) {
          if(actualResponse.header[expectedResponse[0].toLowerCase()].indexOf(expectedResponse[1].toLowerCase()) >= 0) {
            pass = true;
          }
        }

        result.pass = pass;
        result.message = 'Expected request response to have header: ' + JSON.stringify(expectedResponse)
          + ', but have: ' + JSON.stringify(actualResponse.header);

        return result;
      }
    };
  };

  matchers.toHaveHTTPHeader = toHaveHTTPHeader;
};

module.exports = function(){
  return new ToHaveHttpHeader();
};
