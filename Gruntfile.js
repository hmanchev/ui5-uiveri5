module.exports = function (grunt) {

  function buildE2ECmd(cwd) {
    return {
      command: 'node ../../bin/visualtest --v',
      cwd: cwd,
      options: {
        failOnError: false
      }
    };
  }

  grunt.initConfig({
    connect: {
      server: {
        options: {
          port: 9000,
          base: 'e2e/UI5'
        }
      }
    },
    shell: {
      'e2e-noUI5': buildE2ECmd('e2e/noUI5'),
      'e2e-UI5': buildE2ECmd('e2e/UI5')
    }
  });

  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-shell');

  grunt.registerTask('e2e', ['connect', 'shell:e2e-UI5']);

};
