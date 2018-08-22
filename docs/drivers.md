#Drivers
All supported browsers need the respective webdrivers. When using local execution (seleniumAddress not provided), the respective webdriver and possibly selenium.jar is downloaded automatically on every execution and is kept in the 'selenium' folder under the installation path.
The respective webdriver version is specified in basic profile and can be overwritten on command line:
```
$ visualtest --config.connectionConfigs.direct.binaries.selenium.version=3.11
```
and in conf.js:
 ```javascript
connectionConfigs: {
    direct: {
        binaries: {
            selenium: {
                version: "3.11"
            }
        }
    }
}
```
## Selenium
By default, selenium jar is used to start the respective webdriver that starts the required browser. This could be disabled with the useSeleniumJar option. Selenium command line arguments could be provided in conf.js:
```javascript
browsers: [{
  browserName: 'chrome',
  capabilities: {
    seleniumOptions: {
        args: ['-debug', '-log','selenium.log']
    },
  }
}]
```
List the available arguments by executing:
```
$ java -jar selenium-server-standalone-3.0.1.jar -help
```
## Chrome
Chrome uses the chromedriver that is updated regularly so by default we use the latest version.
All chromedriver options from: [ServiceBuilder](https://github.com/SeleniumHQ/selenium/blob/master/javascript/node/selenium-webdriver/chrome.js) could be specified similar to selenium options under the 'chromedriverOptions' key. A list of recognized options can be viewed [here](http://chromedriver.chromium.org/capabilities).
All chrome options from: [Options](https://github.com/SeleniumHQ/selenium/blob/master/javascript/node/selenium-webdriver/chrome.js) could be specified similar to selenium options under the 'chromeOptions' key.
```javascript
browserCapabilities: {
  chrome: {
    chromedriverOptions: {
      loggingTo: ['chromedriver.log']
    },
    chromeOptions: {
      args: ['start-maximized']
    }
  }
}
```

## Firefox
Firefox uses the geckodriver that is updated regularly so by default we use the latest version.
All geckodriverdriver options from: [ServiceBuilder](https://github.com/SeleniumHQ/selenium/blob/master/javascript/node/selenium-webdriver/firefox.js) could be specified similar to selenium options under the 'geckodriverOptions' key.
All firefox options from: [Options](https://github.com/SeleniumHQ/selenium/blob/master/javascript/node/selenium-webdriver/firefox.js) could be specified similar to selenium options under the 'firefoxOptions' key. A list of options can be found [here](https://developer.mozilla.org/en-US/docs/Mozilla/Command_Line_Options).
```javascript
browserCapabilities: {
  firefox: {
    geckodriverOptions: {
      loggingTo: ['chromedriver.log']
    },
    firefoxOptions: {
      addArguments: ['-private']
    }
  }
}
```

## Internet Explorer
Internet explorer uses the iedriver which is only available on Windows. Currently, you need to specify an exact version (automatic latest version detection is not implemented). All iedriver options from: [ServiceBuilder](https://github.com/SeleniumHQ/selenium/blob/master/javascript/node/selenium-webdriver/ie.js) could be specified similar to selenium options under the 'iedriverOptions' key.
All IE options from: [Options](https://github.com/SeleniumHQ/selenium/blob/master/javascript/node/selenium-webdriver/ie.js) could be specified similar to selenium options under the 'ieOptions' key.
There is a [browser configuration](https://github.com/SeleniumHQ/selenium/wiki/InternetExplorerDriver#required-configuration) that should be followed before you start testing on IE. It is preferable to modify your browser's security settings as described [here](https://github.com/seleniumQuery/seleniumQuery/wiki/seleniumQuery-and-IE-Driver#protected-mode-exception-while-launching-ie-driver). This is the only way to overcome security limitations when selenium jar is used (which is the default case). When you don't use selenium jar, you can enable the 'introduceFlakinessByIgnoringProtectedModeSettings' option, but keep in mind that it is reported to cause driver instability.
```javascript
browserCapabilities: {
  ie: {
    iedriverOptions: {
      introduceFlakinessByIgnoringProtectedModeSettings: ['true']
    },
    ieOptions: {
      addArguments: ['-foreground']
    }
  }
}
```

## Edge
Microsoft Edge requires a webdriver that is distributed as a native installation. Please make sure you have the latest version installed as explained in: [Microsoft Edge WebDriver](https://developer.microsoft.com/en-us/microsoft-edge/tools/webdriver/)

## Safari
Safari10 includes native webdriver that is bundled with the Safari browser. Please make sure you have enabled it as explained in [Testing with WebDriver in Safari](https://developer.apple.com/documentation/webkit/testing_with_webdriver_in_safari)


