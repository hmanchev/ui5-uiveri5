
describe("RuntimeResolver", function() {
  var resolver = new require('../src/runtimeResolver')();

  describe("Should match browserCapabilities", function() {
    it('Should handle separate names', function () {
      var runtime = {
        capabilities: {},
        browserName: 'chrome',
        platformName: 'windows'
      };
      resolver._mergeMatchingCapabilities(runtime,{
        'chrome,chromium': {
          'windows,mac,linux': {
            matched: true
          }
        }
      });
      expect(runtime.capabilities.matched).toBe(true);
    });

    it('Should handle wildcard', function () {
      var runtime = {
        capabilities: {},
        browserName: 'chrome',
        platformName: 'windows'
      };
      resolver._mergeMatchingCapabilities(runtime,{
        'chrome': {
          '*': {
            matched: true
          }
        }
      });
      expect(runtime.capabilities.matched).toBe(true);
    });

    it('Should handle excludes', function () {
      var runtime = {
        capabilities: {},
        browserName: 'chrome',
        platformName: 'windows'
      };
      resolver._mergeMatchingCapabilities(runtime,{
        'chrome': {
          '*,!windows': {
            matched: true
          }
        }
      });
      expect(runtime.capabilities.matched).toBeUndefined();
    });
  });

  describe("Should merge with runtime capabilities", function() {
    it('Runtime capabilities should overwrite browserCapabilities', function () {
      var runtime = {
        capabilities: {
          key: 'value'
        },
        browserName: 'chrome',
        platformName: 'windows'
      };
      resolver._mergeMatchingCapabilities(runtime, {
        'chrome,chromium': {
          'windows,mac,linux': {
            key: 'new_value'
          }
        }
      });
      expect(runtime.capabilities.key).toBe('value');
    });
  });
});
