describe("sap.m.waitTestRecursive", function() {
  // verify wait after button click
  it("should click the button and wait", function() {
    element(by.id("button")).click();
    expect(element(by.id("button")).getText()).toBe("Click me");
  });
});
