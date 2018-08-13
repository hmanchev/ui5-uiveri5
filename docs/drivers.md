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
All chromedriver options from: [ServiceBuilder](https://github.com/SeleniumHQ/selenium/blob/master/javascript/node/selenium-webdriver/chrome.js) could be specified similar to selenium options under the 'chromediverOptions' key.
All chrome options from: [Options](https://github.com/SeleniumHQ/selenium/blob/master/javascript/node/selenium-webdriver/chrome.js) could be specified similar to selenium options under the 'chromeOptions' key.

## Firefox
Firefox uses the geckodriver that is updated regularly so by default we use the latest version.
All geckodriverdriver options from: [ServiceBuilder](https://github.com/SeleniumHQ/selenium/blob/master/javascript/node/selenium-webdriver/firefox.js) could be specified similar to selenium options under the 'geckodiverOptions' key.
All firefox options from: [Options](https://github.com/SeleniumHQ/selenium/blob/master/javascript/node/selenium-webdriver/firefox.js) could be specified ismilar to selenium options under the 'firefoxOptions' key.

## Internet Explorer

## Edge
Microsoft Edge requires a webdriver that is distributed as a native installation. Please make sure you have the latest version installed as explained in: [Microsoft Edge WebDriver](https://developer.microsoft.com/en-us/microsoft-edge/tools/webdriver/)

## Safari
Safari10 includes native webdriver that is bundled with the Safari browser. Please make sure you have enabled it as explained in [Testing with WebDriver in Safari](https://developer.apple.com/documentation/webkit/testing_with_webdriver_in_safari)


