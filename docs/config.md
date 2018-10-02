### Config file
Config file is a node module that exports a single 'config' object of type: 'src/visualtest.js/{Config}'
Config file could reference a profile that is another config file with name <profile>.profile.conf.js

### Command-line arguments
Command-line arguments override options from config file, config file overwrites options from profile config file,
profile overwrites build-in defaults.

If config file is not provided on command line, a file with name 'conf.js' is looked up in the current working directory.
If found, it is used. If not found, the default conf/default.conf.js file is used.

#### Boolean argumens
Use the 'no-' syntax for specifying values of boolean parameters
```
$ visualtest --no-useSeleniumJar
```
### Browser runtimes

Browser runtime is an object of type: 'src/runtimeResolver.js/{Runtime}' that specifies the browser and platform
on which to execute the test. You could specify only few of the properties of a runtime. The rest will be derived
if possible or wildcards will be assumed. For example, if platformName is omitted, the default for the specific browser
will be assumed. Like 'windows' for browser 'ie', 'mac' for browser 'safari', etc. If browserVersion or platformVersion
are not explicitly specified, wildcard will be assumed and test will run on any  available platform and browser versions.
__NOT IMPLEMENTED YET__Several browser runtimes could be specified and so the test will run in parallel on all of them.

Values and defaults:
* browserName - one of (chrome|firefox|ie|safari|edge), browser name, default: chrome
* browserVersion - browser version, default: *
* platformName - one of (windows|mac|linux|android|ios|winphone)} - platform name, default: windows
* platformVersion - platform number like 7,8 for windows; 4.4,5.0 for android;, default: *
* platformResolution - format: /\d+x\d+/- platform resolution, WIDTHxHEIGHT, default: resolved from available
* ui5.theme - one of (bluecrystal|belize|hcp) - UI5 theme, default belize
* ui5.direction - one of (rtl|ltr) - UI5 direction, default: ltr
* ui5.mode - one of (cosy|compact) - UI5 mode, default: cosy

Specify in custom spec.js:
```javascript
browsers:[{
  browserName: 'chrome'
}]
```
Specify on command line in ':' -separated notation:
```
$ visualtest --browsers=ie:9
```
Runtime attributes are extracted sequentially in the order they are defined above.
Specify several browser runtimes:
```
$ visualtest --browsers=chrome,firefox
```
Emulate Chrome on a mobile device (e.g. a “Samsung Galaxy S7”) from the desktop version of Chrome.
Specify Chrome mobile emulator:
```
$ visualtest --browsers=chromeMobileEmulation
```

### Browser capabilities
Overwrite or extend in browser runtime:
```javascript
browsers: [{
  browserName: 'chrome',
  platformName: 'linux',
  capabilities: {
    chromeOptions: {
      args: ['start-maximized']
    }
  }
}]
```

### Local and remote execution
If _seleniumAddress_ is provided (either in conf.js or on command line) uiveri5 will connect to this address.
The remote connection could use http proxy server specified in _seleniumAddressProxy_.
If seleniumAddress is not specified, it will try to start local webdriver and download a correct version if not already available.
By default an automatically resolved free port is used for the locally started webdriver, it could be overwritten
by _seleniumPort_ configuration. By default a selenium jar is started that controls the local webdriver. If _useSeleniumJar_ with false value is provided,
the selenium jar will be skipped and local webdriver will be started directly. 

###### In some specific network cases(e.g. multi homed machines), starting webdriver locally may fail with a timeout. The timeout is caused by the fact that selenium by default binds to first/primary IP. But if the machine has several IPs like in the case of VPN the webdriver could try to connect to some of the other adresses and never succeeds. The workaround for this case is to set the _seleniumLoopback_ parameter to _true_. ######

### [Drivers](./authentication.md)

### Passing params to test
Define in conf.js file
```javascript
exports.config = {
  params: {
    someKey: someValue,
    anotherKey: {
     secondLevelKey: secondLevelValue
    }
  }
};
```
Override from command line or define new params
```
$ visualtest --params.someKey=redefineSomeValue --params.anotherKey.anotherSecondLevelKey=anotherSecondLevelValue
```
Usage in tests
```javascript
if('should check something',function(){
  if(browser.testrunner.config.params.someKey) {
    doSomethingWithThisValue(browser.testrunner.config.params.someKey);
  }
});
```

### [Authentication](./authentication.md)
uiveri5 support authentication for accessing the test pages with declarative configuration. The most common authentication scenarious  like SAP Cloud, SAP IDM and Fiori Launchpad are support out of the box. Custom authentication schemes are also supported. Programatic authentication is also supported.

### Timeouts
Override default timeout values in config file:
```javascript
timeouts: {
  getPageTimeout: '10000',
  allScriptsTimeout: '11000',
  defaultTimeoutInterval: '30000'
}
```
Override timeouts from command-line:
```
--timeouts.defaultTmeoutInterval=50000
```
Please check [protractor timeouts](https://github.com/angular/protractor/blob/master/docs/timeouts.md)
for their meaning.

### Wait after initial page loading and forced reload
Some application testing usecases require immediate page reload after authentication. Or some wait period after initial
pageload so that some non-ui5 code to settle page state. Enable those features in config file:
```javascript
pageLoading: {
  wait: '20000', 
  initialReload: false
}
```

### Override arbitrary configuration from command line:
You could override arbitrary config value from command like:
* as single value with object notation
```console
--config.specResolver.contentRootUri=sdk/test-resources
```
* as single value with complex object notation syntax
```console
--confKeys=locators[1].name:myCustomLocator;
```
* as several single values
```console
--confKeys=locators[1].name:myCustomLocator;locators[1].arg1:value1;
```
* change the reportName of already delcared reporter
```
--confKeys=reporters[0].reportName:"target/report/jsonReports/report.json"
```
* as json object
```console
// linux console
--config={"specResolver":{"name": "myCustomResolver","arg1":"value1"}}
// windows console
--config={\"specResolver\":{\"name\": \"myCustomResolver\",\"arg1\":\"value1\"}}
// java-based environments ( WebStorm debug configuration )
--config={\\\"specResolver\\\":{\\\"name\\\": \\\"myCustomResolver\\\",\\\"arg1\\\":\\\"value1\\\"}}
```
* as json object arrays are merged
```console
--config={"locators":[{"name":"myCustomLocator"}]}
```
### [Visual Testing](./usage/visualtesting.md)
uiveri5 can be used to execute visula tests, There are specific requirements to the test for successfull execution.

### Run against android emulator
Start appium
```
$ appium --device-name=android
```
Execute the visual test
```
$ grunt visualtest --browsers=browser:*:android --seleniumAddress=http://127.0.0.1:4723/wd/hub --baseUrl=http://10.0.2.2:8080
```

### [Reporters](./reporters.md)
Test execution results can be summarized in a report. We support several report formats, e.g. JUnit, JSON, HTML. The config file defines the reporters to use and their options.
