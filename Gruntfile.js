module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-nsp');
    grunt.initConfig({
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
