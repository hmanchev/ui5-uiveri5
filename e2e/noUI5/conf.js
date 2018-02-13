exports.config = {
    profile: 'integration',

    baseUrl: 'http://www.google.com',

    takeScreenshot: {
        onExpectFailure: false,
        onExpectSuccess: false,
        onAction: false
    }
};