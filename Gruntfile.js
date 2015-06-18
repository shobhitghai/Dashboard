module.exports = function(grunt) {
    var components = [
        'js/component/base.js',
        'js/component/highcharts-options.js',
        'js/component/tile-section.js',
        'js/component/shopper-engagement.js',
        'js/component/shopper-profile.js',
        'js/component/revisit-frequency.js',
        'js/component/cross-store.js',
        'js/component/time-trend.js',
        'js/component/right-now.js',
        'js/component/internal-benchmarking.js',
        'js/component/campaign-impact.js',
        'js/component/storefront-impact.js',
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
                tasks: ['concat', 'uglify', 'cssmin', 'handlebars'],
                dest: 'js/build/app.js'
            },
            css: {
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
        },
        handlebars: {
            options: {
                namespace: 'App.Template',
                processName: function(filePath) {
                    return filePath.replace(/^templates\//, '').replace(/\.handlebars$/, '');
                }
            },
            all: {
                files: {
                    "js/build/templates.js": ["templates/**/*.handlebars"]
                }
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

    grunt.loadNpmTasks('grunt-contrib-handlebars');

    // Register our own custom task alias.
    grunt.registerTask('build', ['concat']);
    // Default task(s).
    grunt.registerTask('default', ['uglify']);

};
