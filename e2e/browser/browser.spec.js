var Runner = require('../Runner');
var LogInterceptor = require('../LogInterceptor');

describe('Browser tests', function() {
    var app;

    beforeAll(() => {
        return Runner.startApp('/browser/fixture/apps').then((appData) => {
            app = appData;
        });
    });

    afterAll(() => {
       app.server.close();
    });

    it('should execute all UI5 tests', () => {
        return Runner.execTest({
            specs: './browser/specs/by_control.spec.js',
            baseUrl: app.host + '/browser/index.html'
        });
    }, 40000);

    it('should fail if no UI5 on page', () => {
        var logInterceptor = new LogInterceptor();
        logInterceptor.start('uiveri5 console: DEBUG:.*waitForUI5: no UI5 on this page');
        return Runner.execTest({
            specs: './browser/specs/error/noUI5.spec.js',
            baseUrl: 'http://google.com'
        }).catch(function () {
            expect(logInterceptor.aLogs.length).toBeTruthy();
            logInterceptor.stop();
        });
    }, 40000);
});
