# UIVeri5 (visualtestjs)

[![Build Status](https://travis-ci.mo.sap.corp/ui5delivery/visualtestjs.svg?token=q7q1Fy6Pv7CUxGsy7QiW&branch=master)](https://travis-ci.mo.sap.corp/ui5delivery/visualtestjs)

## Introduction
UIVeri5 is a visual and application testing framework for UI5-based applications. It uses
[webdriverjs](https://code.google.com/p/selenium/wiki/WebDriverJs) to drive a real browser and interacts with your
application as a real user would. UIVeri5 is heavily inspired by [Protractor](http://www.protractortest.org/)
and brings most (and more) of its benefits to UI5 applications.

### Benefits
* Automatic synchronization with UI5 app rendering so there is no need to add waits and sleeps to your test. Tests are reliable by design.
* Tests are written in synchronous manner, no callbacks, no promise chaining so are really simple to write and maintain.
* Full power of webdriverjs, protractor and jasmine - deferred selectors, custom matchers, custom locators.
* Control locators (OPA5 declarative matchers) allow locating and interacting with UI5 controls.
* Does not depend on testability support in applications - works with autorefreshing views, resizing elements, animated transitions.
* Declarative authentications - authentication flow over OAuth2 providers, etc.
* Console operation, CI ready, fully configurable, no need for java (comming soon) or IDE.
* Covers full ui5 browser matrix - Chrome,Firefox,IE,Edge,Safari,iOS,Android.
* Open-source, modify to suite your specific neeeds.

### Install
UIVeri5 requires nodejs >=0.12 and java>=1.6

Install globally:
```
$ npm install git://github.wdf.sap.corp/ui5delivery/visualtestjs.git#<release> -g --no-optional
```
Please use the latest release: [releases](https://github.wdf.sap.corp/ui5delivery/visualtestjs/releases/latest)
If you face a problem, please check our list of common [issues](docs/issues.md) 

### Create a test
Create a clean folder that will contain your test and configuration files. UIVeri5 uses [jasmine]() as test runner so the the test resides in a spec.js file.
Put the declarative configuration in the conf.js file.

* conf.js
```js
exports.config = {
  profile: 'integration',

  baseUrl: 'https://openui5.hana.ondemand.com/test-resources/sap/m/demokit/master-detail/webapp/test/mockServer.html',
};
```

* masterdetail.spec.js
```js
describe('masterdetail', function () {

  it('should load the app',function() {
    expect(browser.getTitle()).toBe('Master-Detail');
  });

  it('should display the details screen',function() {
    element(by.control({
      viewName: 'sap.ui.demo.masterdetail.view.Master',
      controlType: 'sap.m.ObjectListItem',
      properties: {
        title: 'Object 11'
      }}))
    .click();
  });

  it('should validate line items',function() {
    expect(element.all(by.control({
      viewName: 'sap.ui.demo.masterdetail.view.Detail',
      controlType:'sap.m.ColumnListItem'}))
    .count()).toBe(2);
  });
});
```

### Run the test
Open console in the test folder and execute:
```
$ visualtest
```
You will see the test execution in the console and an overview when the test completes. Check the target folder for a visual report with screenshots.

### Usage hints
By default uiveri5 will discover all tests in current folder and execute them on localy started Chrome.
All of those defaults could be modified either in conf.js or by providing command-line arguments.

* Run tests on different browser
```
--browsers=firefox
```
* Run tests against app deployed on a specific system
```
--baseUrl="http://<host>:<port>/app"
```
* Run tests against a remove selenium server
```
--seleniumAddress="<host>:<port>/wd/hub"
```
* Enable verbose logging
```
`-v`
```

## Learn more
Learn more in [Testing Guide](docs/usage/applicationtesting.md)

## Configuration
UIVeri5 accepts a declarative configuration in a conf.js file. Configuration could be overriten with command-line arguments.
All configuration options are explained in [Configuration](docs/config/config.md)

## Release plan
See how we plain to continue in our [Release plan](docs/todo.md) 

## Disclaimer
By default, when running locally, uiveri5 downloads selenium.jar and/or the respective webdrivers - chromedriver, geckodriver, InternetExplorerDriver from their official locations. By using this functionality, you accept the licencing agreement and terms of use of those components. You could disable the downloading or change the locations in profile.conf.js. 
When using --seleniumAddress, nothing is downloaded. 
