describe("sap.m.waitTest", function() {

	it("should load test page",function(){
		expect(takeScreenshot()).toLookAs("initial");
	});

	// verify wait after button click
	it("should click the button and wait", function() {
		element(by.id("button")).click();
		expect(takeScreenshot()).toLookAs("buttonClicked");
	});
});
