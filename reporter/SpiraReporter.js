var mocha = require('mocha');
var SpiraClient = require('./SpiraClient.js');

module.exports = SpiraReporter;

function SpiraReporter(runner, options) {
  mocha.reporters.Base.call(this, runner);

  var self = this;
  var color = mocha.reporters.Base.color;

  var passes = 0;
  var failures = 0;
  var startDate = new Date();
  var stackTrace = '';
  var testName = '-';
  var steps = [];
  this._options = {};

  //Get the Reporter options from configuration
  options = options || {};
	const reporterOptions = options.reporterOptions || {};
  //console.log(reporterOptions);
  if (reporterOptions) {
    this._options = reporterOptions;
  };

  var restDone = false;

  runner.on('start', function () {
    //Log to the console that we're running using this reporter
    console.log(color('suite', 'Starting Test Run using SpiraTest Reporter'));
  });

  runner.on('pass', function(test){
    passes++;

    //Log to the console
    console.log(color('checkmark', mocha.reporters.Base.symbols.ok) + ' ' + color('pass', 'pass: %s'), test.fullTitle());

    //Add to the stack trace and steps
    stackTrace +=  mocha.reporters.Base.symbols.ok + ' pass: ' + test.fullTitle() + '\n';
    steps.push({ ActualResult: 'Pass', ExecutionStatusId: 2 /* Pass */, Description: test.title });
    testName = test.parent.title;
  });

  runner.on('fail', function(test, err){
    failures++;
    //Output to the console - Spec format
    console.log(color('fail', mocha.reporters.Base.symbols.err + ' fail: %s -- error: %s'), test.fullTitle(), err.message);

    //Add to the stack trace
    stackTrace +=  mocha.reporters.Base.symbols.err + ' fail: ' + test.fullTitle() + '\n';
    steps.push({ ActualResult: err.message, ExecutionStatusId: 1 /* Fail */, Description: test.title });
    testName = test.parent.title;
  });

  runner.on('end', function(){

    //Find the matching test case id from the mapping
    var testCaseId = null;
    if (self._options.mapping && self._options.mapping[testName])
    {
      testCaseId = parseInt(self._options.mapping[testName]);
    }

    if (testCaseId)
    {
      console.log(color('suite', 'Test Run ended with: %d passed, %d failed out of %d test(s).'), passes, failures, passes + failures);
      console.log(color('suite', 'Sending results to SpiraTest for test case TC:' + testCaseId));

      //Send to SpiraTest
      var spiraClient = new SpiraClient(self._options.protocol, self._options.host, self._options.port, self._options.vdir, self._options.login, self._options.apiKey);
      var projectId = self._options.projectId;
      var releaseId = self._options.releaseId;
      var testSetId = self._options.testSetId;
      var endDate = new Date();
      var executionStatusId = 4; /* N/A */
      var assertCount = failures;
      var totalCount = passes + failures;
      var message = passes + ' passed, ' + failures + ' failed out of ' + totalCount + ' test(s).';
      if (totalCount > 0) {
        executionStatusId = (failures > 0) ? /* Failed */ 1 : /* Passed */ 2;      
      }
    
      spiraClient.recordTestRun(projectId, testCaseId, releaseId, testSetId, startDate, endDate, executionStatusId, testName, assertCount, message, stackTrace, steps, self._onRecordSuccess, self._onRecordFailure);
    }
    else
    {
      console.log(color('fail', 'No SpiraTest test case ID specified for this test, so it won\'t be reported back to SpiraTest'));
    }
  });
}

SpiraReporter.prototype._onRecordSuccess = function() {
};
SpiraReporter.prototype._onRecordFailure = function() {
};
