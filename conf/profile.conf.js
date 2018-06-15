exports.config = {
  // timeouts in ms, keep proportions when modifying
  timeouts: {
    waitForUI5Delta: 200,
    getPageTimeout: 10000,
    allScriptsTimeout: 11000,
    defaultTimeoutInterval: 30000,
    waitForUI5PollingInterval: 400
  },
  useClassicalWaitForUI5: false,
  connection: 'direct',
  connectionConfigs: {
    'direct': {
      name : './connection/directConnectionProvider',
      binaries: {
        selenium: {
          version: '3.12',
          patch: '0',
          filename: 'selenium-server-standalone',
          url: 'https://selenium-release.storage.googleapis.com/${connectionConfigs.direct.binaries.selenium.version}/' +
          '${connectionConfigs.direct.binaries.selenium.filename}-${connectionConfigs.direct.binaries.selenium.version}.' +
          '${connectionConfigs.direct.binaries.selenium.patch}.jar',
          executable: '${connectionConfigs.direct.binaries.selenium.filename}-${connectionConfigs.direct.binaries.selenium.version}.' +
          '${connectionConfigs.direct.binaries.selenium.patch}.jar'
        },
        chromedriver: {
          version: '{latest}',
          unzip: true,
          filename: 'chromedriver',
          baseurl: 'https://chromedriver.storage.googleapis.com',
          url: '${connectionConfigs.direct.binaries.chromedriver.baseurl}/${connectionConfigs.direct.binaries.chromedriver.version}/' +
          '${connectionConfigs.direct.binaries.chromedriver.filename}_${osTypeString}.zip',
          latestVersionUrl: '${connectionConfigs.direct.binaries.chromedriver.baseurl}/LATEST_RELEASE',
          executable: {
            win32: '${connectionConfigs.direct.binaries.chromedriver.filename}-${connectionConfigs.direct.binaries.chromedriver.version}.exe',
            mac64: '${connectionConfigs.direct.binaries.chromedriver.filename}-${connectionConfigs.direct.binaries.chromedriver.version}',
            linux32: '${connectionConfigs.direct.binaries.chromedriver.filename}-${connectionConfigs.direct.binaries.chromedriver.version}',
            linux64: '${connectionConfigs.direct.binaries.chromedriver.filename}-${connectionConfigs.direct.binaries.chromedriver.version}'
          }
        },
        // for screenshots to work we need to use 32bit IE even with 64bit system, details:
        iedriver: {
          version: '3.12',
          patch: '0',
          unzip: true,
          filename: 'IEDriverServer',
          url: 'http://selenium-release.storage.googleapis.com/${connectionConfigs.direct.binaries.iedriver.version}/' +
          '${connectionConfigs.direct.binaries.iedriver.filename}_Win32_${connectionConfigs.direct.binaries.iedriver.version}.' +
          '${connectionConfigs.direct.binaries.iedriver.patch}.zip',
          executable: '${connectionConfigs.direct.binaries.iedriver.filename}-${connectionConfigs.direct.binaries.iedriver.version}.' +
          '${connectionConfigs.direct.binaries.iedriver.patch}.exe'
        },
        geckodriver: {
          version: '{latest}',
          unzip: true,
          filename: 'geckodriver',
          baseurl: 'http://github.com/mozilla/geckodriver/releases',
          url: '${connectionConfigs.direct.binaries.geckodriver.baseurl}/download/v${connectionConfigs.direct.binaries.geckodriver.version}' +
          '/${connectionConfigs.direct.binaries.geckodriver.filename}-v${connectionConfigs.direct.binaries.geckodriver.version}-${osTypeString}.zip',
          latestVersionUrlRedirect: '${connectionConfigs.direct.binaries.geckodriver.baseurl}/latest',
          executable: {
            win32: '${connectionConfigs.direct.binaries.geckodriver.filename}-${connectionConfigs.direct.binaries.geckodriver.version}.exe',
            win64: '${connectionConfigs.direct.binaries.geckodriver.filename}-${connectionConfigs.direct.binaries.geckodriver.version}.exe',
            mac64: '${connectionConfigs.direct.binaries.geckodriver.filename}-${connectionConfigs.direct.binaries.geckodriver.version}',
            linux32: '${connectionConfigs.direct.binaries.geckodriver.filename}-${connectionConfigs.direct.binaries.geckodriver.version}',
            linux64: '${connectionConfigs.direct.binaries.geckodriver.filename}-${connectionConfigs.direct.binaries.geckodriver.version}'
          }
        }
      }
    }//,
    //'sauselabs': { name : './connection/sauselabsConnectionProvider' },
    //'browserstack': { name : './connection/browserstackConnectionProvider' },
  },

  browserCapabilities: {
    /* appium/android require deviceName */
    'browser,chrome': {
      'android': {
        '*': {
          deviceName: 'android'
        }
      }
    },
    /* maximize browser on all desktops to ensure consistent browser size */
    'chrome,chromium,firefox,ie,edge,safari': {
      'windows,mac,linux': {
        '*': {
          remoteWebDriverOptions: {
            maximized: true
          }
          /*
          seleniumOptions: {
            args: ['-debug', '-log','C:/work/git/openui5/selenium.log']
          }
          */
        }
      }
    },
    /* disable informabrs on chrome */
    'chrome,chromium': {
      '*': {
        '*': {
          chromeOptions: {
            'args': [
              'disable-infobars'
            ]
          },
          /*
          chromedriverOptions: {
            'enableVerboseLogging': [],
            'loggingTo': ['C:\\work\\git\\openui5\\chromedriver.log']
          }
          */
        }
      }
    },
    /* configure default Galaxy S7 emulation */
    'chromeMobileEmulation': {
      '*': {
        '*': {
          browserName: 'chrome',
          remoteWebDriverOptions: {
            maximized: false,
            scaling: {
              x: 4.0,
              y: 4.0
            }
          },
          chromeOptions: {
            mobileEmulation: {
              deviceMetrics: {
                width: 360,
                height: 560,
                pixelRatio: 4
              }
            }
          }
        }
      }
    }
  },

  auth: 'plain',
  authConfigs: {
    'plain': {
      name: './authenticator/plainAuthenticator'
    },
    'basic': {
      name: './authenticator/basicUrlAuthenticator'
    },
    'fiori-form': {
      name: './authenticator/formAuthenticator',
      userFieldSelector: '#USERNAME_FIELD input',
      passFieldSelector: '#PASSWORD_FIELD input',
      logonButtonSelector: '#LOGIN_LINK'
    },
    'sapcloud-form': {
      name: './authenticator/formAuthenticator',
      frameSelector: '#IDS_UI_Window',
      userFieldSelector: '#j_username',
      passFieldSelector: '#j_password',
      logonButtonSelector: '#logOnFormSubmit'
    }
  },

  reporters: [
    {name: './reporter/consoleReporter'}
  ],
  locators: [
    {name: './defaultLocators'}
  ]
};
