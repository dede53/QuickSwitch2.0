module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			},
			build: {
				src: 'dist/app.js',
				dest: 'dist/uglified.min.js'
			}
		},
		copy: {
			main: {
				files: [
					// includes files within path 
					// {expand: true, src: ['path/*'], dest: 'dest/', filter: 'isFile'},
		 
					// includes files within path and its sub-directories 
					{expand: true, src: ['public/mobile/**'], dest: 'dest/'},
					{expand: true, src: ['public/pc/**'], dest: 'dest/'},
					{expand: true, src: ['public/settings/**'], dest: 'dest/'},
		 
					// makes all src relative to cwd 
					// {expand: true, cwd: 'path/', src: ['**'], dest: 'dest/'},
		 
					// flattens results to a single level 
					// {expand: true, flatten: true, src: ['path/**'], dest: 'dest/', filter: 'isFile'},
				]
			}
		},
		concat:   {
			dist:    {
				src:  [
					'dest/public/mobile/assets/libs/*.js',
					'dest/public/mobile/assets/js/*.js',
					'dist/template.js'
				],
				dest: 'dist/app.js'
			}
		},
		// useminPrepare: {
		// 	html:'dest/test.html'
		// },
		ngtemplates:  {
			app:        {
				src:      [
					'dest/public/mobile/app/**/*.js',
					'dest/public/mobile/index.html'
				],
				dest:     'dist/template.js',
				options:  {
					usemin: 'dist/vendors.js' // <~~ This came from the <!-- build:js --> block 
				}
			}
		}
	});

	// Load the plugin that provides the "uglify" task.
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-angular-templates');
	grunt.loadNpmTasks('grunt-usemin');

	grunt.registerTask('usemin', [
		'ngtemplates',
		'concat',
		'uglify'
		// 'usemin'
	]);
	// Default task(s).
	grunt.registerTask('default', ['copy']);
	grunt.registerTask('ng', ['ngtemplates']);

};