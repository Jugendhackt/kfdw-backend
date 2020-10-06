module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt);
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-nsp');
    grunt.initConfig({
	eslint: {
	    target: ['src/**', 'data/**/*.js'],
	    failOnError: false
	},
        jshint: {
            files: ['Gruntfile.js', 'src/**/*.js', 'data/**/*.js'],
            options: {
		esversion: 6,
		force: true	
	    }
	},
	nsp: {
	    package: grunt.file.readJSON('package.json')
	}
    });
};
