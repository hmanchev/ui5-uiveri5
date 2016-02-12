
describe("StatisticCollector", function() {
  var reporter;

  beforeEach(function(){
    reporter = require('../src/statisticCollector')();
  });

  it("Should compute overall statistic", function() {
    // simulate jasmine-core calling our reporter
    reporter.jasmineStarted();
    reporter.suiteStarted({description: 'Enabled suite'});
    reporter.specStarted({fullName: 'should pass'});
    reporter.specDone({
      status: 'passed',
      passedExpectations:[{
        status: 'passed',
        matcherName: 'toBe'
      }],
      failedExpectations:[]
    });
    reporter.specStarted({fullName: 'should fail'});
    reporter.specDone({
      status: 'failed',
      passedExpectations:[],
      failedExpectations:[{
        status: 'failed',
        message: 'message',
        matcherName: 'toBe',
        stack: 'stack'
      },{
        status: 'failed',
        message: 'image diff',
        matcherName: 'toLookAs',
        stack: 'stack'
      }]
    });
    reporter.specStarted({fullName: 'should be pending'});
    reporter.specDone({
      status: 'pending',
      passedExpectations:[],
      failedExpectations:[]
    });
    reporter.suiteDone();
    reporter.suiteStarted({description: 'Disabled suite'});
    reporter.specStarted({fullName: 'should be disabled'});
    reporter.specDone({
      status: 'disabled',
      passedExpectations:[],
      failedExpectations:[]
    });
    reporter.suiteDone();
    reporter.jasmineDone();

    // validate stats
    var overview = reporter.getOverview();
    expect(overview.statistic.suites.total).toBe(2);
    expect(overview.statistic.suites.passed).toBe(1);
    expect(overview.statistic.suites.failed).toBe(1);

    expect(overview.statistic.specs.total).toBe(4);
    expect(overview.statistic.specs.passed).toBe(1);
    expect(overview.statistic.specs.failed).toBe(1);
    expect(overview.statistic.specs.pending).toBe(1);
    expect(overview.statistic.specs.disabled).toBe(1);

    expect(overview.statistic.expectations.total).toBe(3);
    expect(overview.statistic.expectations.passed).toBe(1);
    expect(overview.statistic.expectations.failed.total).toBe(2);
    expect(overview.statistic.expectations.failed.error).toBe(1);
    expect(overview.statistic.expectations.failed.image).toBe(1);
  });

  it("Should handle failed expectation details", function() {
    reporter.jasmineStarted();
    reporter.suiteStarted({description: 'Enabled suite'});
    reporter.specStarted({fullName: 'should fail'});
    reporter.specDone({
      status: 'failed',
      passedExpectations:[],
      failedExpectations:[{
        status: 'failed',
        message: JSON.stringify({
          message: 'message',
          details:{
            key:'value'
          }}),
        matcherName: 'toLookAs',
        stack: 'stack'
      }]
    });
    reporter.suiteDone();
    reporter.jasmineDone();

    // validate
    var overview = reporter.getOverview();
    var failedExpectation = overview.suites[0].specs[0].expectations[0];
    expect(failedExpectation.message).toBe('message');
    expect(failedExpectation.details.key).toBe('value');
  });

  it("Should handle passed expectation details", function() {
    reporter.jasmineStarted();
    reporter.suiteStarted({description: 'Enabled suite'});
    reporter.specStarted({fullName: 'should pass'});
    reporter.specDone({
      status: 'passed',
      passedExpectations:[{
        status: 'passed',
        matcherName: 'toBe',
        passed: {
          message: JSON.stringify({message: 'fine',details: 'url'})
        }
      }],
      failedExpectations:[]
    });
    reporter.suiteDone();
    reporter.jasmineDone();

    // validate
    var overview = reporter.getOverview();
    var passedExpectation = overview.suites[0].specs[0].expectations[0];
    expect(passedExpectation.message).toBe('fine');
    expect(passedExpectation.details).toBe('url');
  })
});
