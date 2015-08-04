module.exports = function(grunt) {
    var components = [
        'public/js/component/base.js',
        'public/js/component/ajax-wrapper.js',
        'public/js/component/filter-panel.js',
        'public/js/component/tile-section.js',
        'public/js/component/shopper-engagement.js',
        'public/js/component/shopper-profile.js',
        'public/js/component/revisit-frequency.js',
        'public/js/component/cross-store.js',
        'public/js/component/time-trend.js',
        'public/js/component/right-now.js',
        'public/js/component/internal-benchmarking.js',
        'public/js/component/campaign-impact.js',
        'public/js/component/storefront-impact.js',
        'public/js/component/hour-optimization.js'
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
                dest: 'public/js/build/app.js'
            }
        },
        watch: {
            js: {
                files: components,
                tasks: ['concat', 'uglify', 'cssmin', 'handlebars'],
                dest: 'public/js/build/app.js'
            },
            css: {
                files: 'public/css/app.css',
                tasks: ['cssmin']
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: components,
                dest: 'public/js/build/app.min.js'
            }
        },
        cssmin: {
            minify: {
                expand: true,
                cwd: 'public/css/',
                src: ['app.css'],
                dest: 'public/css/',
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
                    "public/js/build/templates.js": ["templates/**/*.handlebars"]
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
