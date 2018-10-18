/*global describe,it,element,by,takeScreenshot,expect*/

var utils = require('./fixture/utils');

describe("clientLogs", function () {
	"use strict";

    var LogInterceptor = function () {
        this.aLogs = [];
        this.fnOriginalLog = console.log;

        this.start = function (sLogMatch) {
            var that = this;
            console.log = function (sLog) {
                if (sLog.match(sLogMatch)) {
                    that.aLogs.push(sLog);
                }
                return that.fnOriginalLog.apply(this, arguments);
            }
        };
        this.stop = function () {
            console.log = this.fnOriginalLog;
        };
    };

	beforeAll(function () {
		utils.injectPageContent(browser, "app");
    });

	it("should include client logs if no element is found", function () {
        var logInterceptor = new LogInterceptor();
        logInterceptor.start('^DEBUG: No elements found using by.control locator. ' +
            'This is what control locator last logged:');
		var showNavButtton = element(by.control({
			id: "non-existent"
		}));

		showNavButtton.isPresent().then(function (isPresent) {
			expect(isPresent).toBeFalsy();
            expect(logInterceptor.aLogs[0]).toMatch(/Found no control with the global ID \'non-existent\'/);
            expect(logInterceptor.aLogs[0]).not.toMatch(/sap\.ui\.test\.autowaiter/);
            logInterceptor.stop();
		});
    });

    it("should include client logs on autoWaiter timeout", function () {
        browser.executeScript(function () {
            return !!uiveri5.autoWaiterAsync;
        }).then(function (isAutoWaiterLoaded) {
            // test is meaningful only for OPA5 autoWaiter
            if (isAutoWaiterLoaded) {
                browser.executeScript(function () {
                    uiveri5.autoWaiterAsync.extendConfig({
                        timeout: 200
                    });
                    var fnDelay = function (iDelay) {
                        setTimeout(function () {
                            fnDelay(iDelay + 50);
                        }, iDelay);
                    };
                    fnDelay(100);
                });

                element(by.id("page1-intHeader")).isPresent().then(function (isPresent) {
                    expect(true).toBeFalsy();
                }, function (oError) {
                    expect(oError).toMatch('Polling stopped because the timeout of 200 milliseconds has been reached ' +
                        'but there is still pending asynchronous work.');
                });
            }
        });
    });
});
