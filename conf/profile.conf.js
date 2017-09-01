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
          version: '2.9',
          unzip: true,
          filename: 'chromedriver',
          url: 'https://chromedriver.storage.googleapis.com/${version}/${filename}_${osTypeString}.zip',
          executable: {
            win32: '${filename}-${version}.exe',
            mac32: '${filename}-${version}'
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
    'browser,chrome': {
      'android': {
        '*': {
          deviceName: 'android'
          /*
           remoteWebDriverOptions: {
           contextSwitch: true, // {native: 'NATIVE_APP', webview: 'WEBVIEW_1'}
           crops: {
           position: {
           y: 116
           },
           size: {
           height: 684
           }
           },
           scaling: {
           x: 1.5,
           y: 1.5
           }
           }
           */
        }
      }
    },
    'chrome,chromium': {
      'windows,mac,linux': {
        '*': {
          remoteWebDriverOptions: {
            maximized: true
          },
          enableClickWithActions: true
          /*
           chromedriverOptions: {
           'enableVerboseLogging': [],
           'loggingTo': ['C:\\work\\git\\openui5\\chromedriver.log']
           }
           */
        }
      }
    },
    'firefox,ie,safari': {
      'windows,linux': {
        '*': {
          remoteWebDriverOptions: {
            maximized: true
          },
          enableClickWithActions: true
        }
      },
      'mac': {
        '*': {
          remoteWebDriverOptions: {
            maximized: true
          }
          /*
           position: {
           x: 0,
           y: 0
           },
           size: {
           width: 1920,
           height: 1067
           },
           browserSize: {
           width: 1920,
           height: 1067
           },
           viewportSize: {
           width: 1920,
           height: 1067
           }
           seleniumOptions: {
           args: ['-debug', '-log','C:/work/git/openui5/selenium.log']
           }
           */
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
