const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      on('task', { 
        log(message) {
          console.log(message)
          return null
        },
      })
    },
  },
  reporter: 'reporter/SpiraReporter',
  reporterOptions: {
    projectId: 1,
    releaseId: 1,
    testSetId: null,
    login: 'fredbloggs',
    apiKey: '{7A05FD06-83C3-4436-B37F-51BCF0060483}',
    protocol: 'http',
    host: '127.0.0.1',
    vdir: 'Spira',
    mapping: {
      "with a checked task": 4,
      "with a checked task 2": 5,
      "with a checked task 3": 6
    }
  }
});
