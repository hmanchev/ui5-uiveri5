/*global beforeAll, describe, it, element, by, takeScreenshot, expect, createPageObjects, Given, When, Then*/

var utils = require('./fixture/utils');

describe("waitRecursive", function() {
  "use strict";

  beforeAll(function () {
    utils.injectPageContent(browser, "waitRecursive");
  });

  // verify wait after button click
  it("should click the button and wait", function() {
    element(by.id("button")).click();
    expect(element(by.id("button")).getText()).toBe("Click me");
  });
});
