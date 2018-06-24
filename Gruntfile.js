module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.initConfig({
        jshint: {
            files: ['Gruntfile.js', 'src/**/*.js', 'data/**/*.js'],
            options: {
		esversion: 6	
	    }
	}
    });
};
