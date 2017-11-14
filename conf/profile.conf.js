exports.config = {
  // timeouts in ms, keep proportions when modifying
  timeouts: {
    waitForUI5Delta: 500,
    getPageTimeout: 10000,
    allScriptsTimeout: 11000,
    defaultTimeoutInterval: 30000
  },
  useClassicalWaitForUI5: true,
  connection: 'direct',
  connectionConfigs: {
    'direct': {
      name : './connection/directConnectionProvider',
      binaries: {
        selenium: {
          version: '2.51',
          patch: '0',
          filename: 'selenium-server-standalone',
          url: 'https://selenium-release.storage.googleapis.com/${version}/${filename}-${version}.${patch}.jar',
          executable: '${filename}-${version}.${patch}.jar'
        },
        chromedriver: {
          version: '2.33',
          unzip: true,
          filename: 'chromedriver',
          url: 'https://chromedriver.storage.googleapis.com/${version}/${filename}_${osTypeString}.zip',
          executable: {
            win32: '${filename}-${version}.exe',
            mac64: '${filename}-${version}',
            linux32: '${filename}-${version}',
            linux64: '${filename}-${version}'
          }
        },
        // for screenshots to work we need to use 32bit IE even with 64bit system, details:
        iedriver: {
          version: '2.51',
          patch: '0',
          unzip: true,
          filename: 'IEDriverServer',
          url: 'http://selenium-release.storage.googleapis.com/${version}/${filename}_Win32_${version}.${patch}.zip',
          executable: '${filename}-${version}.${patch}.exe'
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
    'chrome,chromium,firefox,ie,safari': {
      'windows,mac,linux': {
        '*': {
          remoteWebDriverOptions: {
            maximized: true
          },
          /*
          chromedriverOptions: {
            'enableVerboseLogging': [],
            'loggingTo': ['C:\\work\\git\\openui5\\chromedriver.log']
          }
          seleniumOptions: {
            args: ['-debug', '-log','C:/work/git/openui5/selenium.log']
          }
          */
        }
      }
    },
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
