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

Default browser capabilities could be provided in browserCapabilities for a browser and platform pair.
Those capabilities will be used by default when driving the specific browser. Both browser and platform fields
accept a comma-separated list of names, wildcard character '*'. Prepend the exclusion charatcter '!' in front
of the name to exclude this name from the match.
Those capabilities could be overwritten or extended in the browser runtime configuration.

Add default options to browser capabilities. They can be separated for local execution, or for remote.
For default capabilities (both for local and remote) can be used '*' as third level. The execution type (local or remote)
is recognized automatically by the framework.
```javascript
browserCapabilities: {
  'chrome': {
    'windows': {
      'local': {
        viewportSize: {
          width: 1920,
          height: 1067
        }
      },
      'remote': {
        remoteWebDriverOptions: {
          maximized: true
        }
      },
      '*': {
        enableClickWithActions: true
      }
    }
  }
}
```
or overwrite or extend in browser runtime:
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
There is no need to specify the execution type.

### Local and remote execution
If _seleniumAddress_ is provided (either in conf.js or on command line) the tool will connect to this address.
The remote connection could use pass over http proxy server specified in _seleniumAddressProxy_.
If not specified, it will try to start local webdriver and download a correct version if not already available.
By default an automatically resolved free port is used for the locally started webdriver, it could be overwritten
by _seleniumPort_ configuration. By default a
selenium jar is started that controls the local webdriver. If _useSeleniumJar_ with false value is provided,
the selenium jar will be skipped and local webdriver will be started directly. This could be useful when more
fine-grained configurations to the webdriver are necessary.

###### In some specific network cases(e.g. multi homed machines), starting webdriver locally may fail with timeout. The timeout is caused by the fact that selenium by default binds to first/primary IP. But if the machine has several IPs like in the case of VPN the webdriver tries to connect to some of the other adresses and never succeeds. The workaround for this case is to set the _seleniumLoopback_ parameter to _true_. ######

#### Automatic download of webdrivers and selenium
When local webdriver execution is required, the tool tries to download the correct version of selenium jar,
chromedriver or ie driver executables. Correct versions are specified in conf/profile.conf.js

#### Webdriver options
Additional to browser options, webdriver options could be provided in the browserCapabilities object,
browsers array or on command line. They are supplied to the respective webdriver when started locally.
Please note that chromedriver and iedriver options are considered only when local driver is started directly
and not over selenium jar.

Browser size and location can be specified in browsers.capabilities.remoteWebDriverOptions. The following are listed in descending priority:
* maximized - maximizes the browser window
* position - offset of the browser relative to the upper left screen corner
* viewportSize - inner size of the browser window (actual page display area)
* browserSize - outer size of the browser window (including window toolbars)

```
browsers: [{
  capabilities: {
    remoteWebDriverOptions: {
      maximized: true,
      position: {
        x: 0,
        y: 0
      },
      viewportSize: {
        width: 1920,
        height: 1067
      },
      browserSize: {
        width: 1920,
        height: 1067
      }
    }
  }
}]
```

##### Chromedriver options
All chromedriver options as could be provided. Please check:  https://github.com/SeleniumHQ/selenium/blob/master/javascript/node/selenium-webdriver/chrome.js
Option names match the names of ServiceBuilder object methods.

``` chromedriver options in conf.js
browsers: [{
  browserName: 'firefox',
  capabilities: {
    chromedriverOptions: {
      'enableVerboseLogging': [],
      'loggingTo': ['C:\\work\\git\\openui5\\chromedriver.log']
    }
  }
}]
```

##### Selenium options
All selenium server command-line argumens could be provided. Please check the available options by running
selenium-server-standalone.jar with '-h' argument.
``` selenium options in conf.js
browsers: [{
  browserName: 'firefox',
  capabilities: {
	  seleniumOptions: {
	    args: ['-debug', '-log','C:/work/git/openui5/selenium.log']
	  }
	}
}]
```

### Passing params to test
Define in conf.js file
``` javascript
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
```
if('should check something',function(){
  if(browser.testrunner.config.params.someKey) {
    doSomethingWithThisValue(browser.testrunner.config.params.someKey);
  }
});
```

### Authentication
__Syntax for auth config changed in v1.7.__
To test a protected page you need to specify authentication type and credentials in config. Authentication
is handled by plugable authenticator [modules](src/moduleLoader.js). Basic(in URL) and plain form and form with UI5
authentication modules are available. Form authenticators could be configured with the selectors for the necessary fields.
Few common auth configurations are available: 'basic','fiori-form','sapcloud-form' and could be used directly as shown below.
Please check 'authConfigs' section in [profile.conf.js](conf/profile.conf.js) how to customize proprietary authenticator.
``` javascript
auth: {
  // form based
  'fiori-form': {
    user: '<user>',
    pass: '<pass>'
  }
  ...or....
  'sapcloud-form': {
      user: '<user>',
      pass: '<pass>'
  }
}
```

### Timeouts
Override default timeout values in config file:
``` javascript
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
  wait: '20000',  // provided by default, remove when https://github.wdf.sap.corp/I035254/visualtestjs/issues/27 is done
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

### Override reference image storage for local image storage case
When localStorageProvider is used, by default the reference images are stored in the source tree, parallel to the
the tests in a subfolder 'visual'. This is fine if you plan to submit the images in git as part of the test.
In central visual test execution usaces, it could be useful to store the reference images in a separate folder,
outside ot the source tree. Configure the required folder in your conf.js like this:
```javascript
storageProvider: {name: './image/localStorageProvider',
  refImagesRoot: 'c:\imagestore',actImagesRoot:'c:\imagestore'}
```

### External image references in HTML report
You could overwrite images (reference and actual) root for consumption from remote host like:
```javascript
storageProvider: {name: './image/localStorageProvider',
  refImagesRoot: 'c:\imagestore',actImagesRoot:'c:\imagestore',
  refImagesShowRoot: 'file://share',actImagesShowRoot:'file://share'}
```

### Run against android emulator
Start appium
```
$ appium --device-name=android
```
Execute the visual test
```
$ grunt visualtest --browsers=browser:*:android --seleniumAddress=http://127.0.0.1:4723/wd/hub --baseUrl=http://10.0.2.2:8080
```

### Programatic authentication
Set 'baseUrl' to 'null' to disable automatic page loading. Then call navigation.to() with required URL.
You could override the default auth settings by providing an options object with the same syntax as in conf.js
If the login performs redirects, the authenticated application url should be supplied as first parameter
of navigate.to() and the login url should be given as authUrl in the options object.
```
browser.testrunner.navigation.to(
  '<url>',{
    auth:{
      'sapcloud-form': {
        user: '<user>',
        pass: '<pass>'
      }
    }
  }
);
```
