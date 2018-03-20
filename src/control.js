var clientsidescripts = require('./scripts/clientsidescripts');

function Control(elementArrayFinder) {
  this.getWebElements = elementArrayFinder.getWebElements.bind(elementArrayFinder);
}

Control.prototype.getProperty = function (property) {
  return this.getWebElements().then(function (webElements) {
    // at least one element is found, elsewise webdriver.error.ErrorCode.NO_SUCH_ELEMENT is thrown
    return webElements[0].getAttribute('id');
  }).then(function (elementId) {
    return browser.executeScript_(clientsidescripts.getControlProperty, 'Control.getProperty', {
      elementId: elementId,
      property: property
    }).then(function (result) {
      if (result.error) {
        throw new Error('Cannot investigate UI5 control properties: ' + result.error);
      } else {
        return result.property;
      }
    });
  });
};

module.exports = Control;
