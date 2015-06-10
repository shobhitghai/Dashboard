module.exports = function(grunt) {
    var components = [
        'js/component/base.js',
        'js/component/tile-section.js'
    ];

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            options: {
                banner: '/*! <%= pkg.name %> <%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
                process: function(src, filepath) {
                    return '//####' + filepath + '\n' + src;
                }
            },
            basic: {
                src: components,
                dest: 'js/build/app.js'
            }
        },
        watch: {
            js: {
                files: components,
                tasks: ['concat', 'uglify', 'cssmin'],
                dest: 'js/build/app.js'
            },
            css:{
                files: 'css/app.css',
                tasks: ['cssmin']
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: components,
                dest: 'js/build/app.min.js'
            }
        },
        cssmin: {
            minify: {
                expand: true,
                cwd: 'css/',
                src: ['app.css'],
                dest: 'css/',
                ext: '.min.css'
            }
        }
    });

    // We've set up each task's configuration.
    // Now actually load the tasks.
    // This will do a lookup similar to node's require() function.
    grunt.loadNpmTasks('grunt-contrib-concat');

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.loadNpmTasks('grunt-contrib-cssmin');

    // Register our own custom task alias.
    grunt.registerTask('build', ['concat']);
    // Default task(s).
    grunt.registerTask('default', ['uglify']);

};
