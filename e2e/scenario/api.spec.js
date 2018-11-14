var Runner = require('../Runner');
var restServiceMock = require('./fixture/mock/apiServiceMock');

describe('API tests', function() {
    var app;

    beforeAll(() => {
        return Runner.startMock(restServiceMock).then((appData) => {
            app = appData;
        })
    });
    
    afterAll(() => {
        app.server.close();
    });

    it('should execute api tests', () => {
        return Runner.execTest({
            specs: './scenario/fixture/api.spec.js',
            confjs: './scenario/api.conf.js',
            params: {
                apiUrl: app.host
            }
        });
    }, 40000);
});
