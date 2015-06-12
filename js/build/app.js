/*! Fashion_Dashboard 1.0.0 2015-06-12 */
//####js/component/base.js
// Define Namespace
(function() {
    this.app = {};
}).call(this);

// Config
(function() {
    app.config = {
        hello: 'world'
    };
}(app));

//use media queries to determine if what screen size we are using
// Create the state-indicator element
var indicator = document.createElement('div');
indicator.className = 'state-indicator';
document.body.appendChild(indicator);

//function added below - getDeviceState - use this to determine state.
// Create a method which returns device state
function getDeviceState() {
    var state = window.getComputedStyle(
        document.querySelector('.state-indicator'), ':before'
    ).getPropertyValue('content')

    state = state.replace(/"/g, "");
    state = state.replace(/'/g, ""); //fix for update in chrome which returns ''

    return state; //need to replace quotes to support mozilla - which returns a string with quotes inside.

}

// FOR DEBUG
// Cancel out errors in browsers that don't recognise various console functions
(function() {
    if (!window.console) {
        window.console = {};
    }
    // Union of Chrome, FF, IE, and Safari console methods
    var m = [
        "log", "info", "warn", "error", "debug", "trace", "dir", "group",
        "groupCollapsed", "groupEnd", "time", "timeEnd", "profile", "profileEnd",
        "dirxml", "assert", "count", "markTimeline", "timeStamp", "clear"
    ];
    // Define undefined methods as noops to prevent errors
    var noops = function() {};
    for (var i = 0; i < m.length; i++) {
        if (!window.console[m[i]]) {
            window.console[m[i]] = noops;
        }
    }
})();


$(function() {
    app.util.initModules();
});


(function() {
    app.util = {
        initModules: function(context) {

            var modules = [],
                unique = [],
                pattern = '[class^="mod-"], [class*=" mod-"]';
            targets = $(pattern, context);

            // NOTE: When calling this function you CAN pass either a selector
            // string or jQuery object as the context, it will handle either.
            context = $(context);

            // No context? Set as the document
            if (context.length === 0) context = $(document);

            // If context is a valid element, add it as a target. This catches
            // instances where the context is also a module
            // NOTE: Context could reference multiple elements, hence the loop
            context.each(function() {
                if (!!$(this).filter(pattern).length) targets = targets.add($(this));
            });

            // Loop through all targets (target are elements with .mod class)
            targets.each(function() {

                // Grab element classes & match pattern mod-{module}
                var matches = $(this).prop('class').match(/mod-([^ ]+)/g);

                // Add module(s) to modules array
                $.each(matches, function(i) {

                    // NOTE: We strip out 'mod-' here as the global tag in the
                    // regex causes the whole match to be returned, not just
                    // the capture group #BangsHeadAgainstWall
                    var module = matches[i].replace('mod-', '');

                    // Add only if module exists
                    if (app[module]) {
                        modules.push(module);

                    }
                });
            });

            // Remove duplicate entries
            $.each(modules, function(i, n) {
                if ($.inArray(n, unique) === -1) unique.push(n);
            });
            modules = unique;

            // Fire init on each module
            var defer = [];
            $.each(modules, function(i) {
                if (app[modules[i]].init) {

                    // Defer till after main init loop?
                    if (app[modules[i]].settings.defer) {
                        defer.push(modules[i]);
                    } else {
                        app[modules[i]].init(context);
                    }
                } else {
                    console.log('initModule: The module \'' + modules[i] + '\' does not have an init method');
                }
            });

            // Fire init on deferred modules
            $.each(defer, function(i) {
                if (app[defer[i]].init) {
                    app[defer[i]].init(context);
                } else {
                    console.log('initModule: The module \'' + defer[i] + '\' does not have an init method');
                }
            });

            // Return list of modules
            return modules;

        },
    }
})(app);



//####js/component/tile-section.js
(function() {
    app['tile-section'] = {
        settings: {
            target: 'mod-tile-section'
        },
        init: function(context) {
            //dummy handlebar
            var template = App.Template['tile-opportunity'];

            //move to separate global wrapper
            $.ajax({
                url: 'http://localhost:3001/api/getData',
                success: function(data) {
                    app['tile-section'].bindTemplate(data, template);
                },
                error: function(err) {
                    console.log('err');
                }
            })
        },
        bindTemplate: function(data, template) {
        	var response = $.parseJSON(data);

            $('.section-opportunity').html(template({
                'tile-name': 'Data count',
                'tile-percent': response.length,
                'tile-percent-change': '',
                'tile-period-param': 'Count of rows'
            }));
        }
    }
})(app);

//####js/component/shopper-engagement.js
(function() {
    app['shopper-engagement'] = {
        settings: {
            target: '.mod-shopper-engagement'
        },
        init: function(context) {
            var s = this.settings;
            var chartContainer = $(s.target).find('#shopper-engagement-chart');

            app['shopper-engagement'].renderChart(chartContainer);


        },
        renderChart: function(chartContainer) {
            chartContainer.highcharts({
                chart: {
                    type: 'bar'
                },
                title: {
                    text: 'Shopper Engagement'
                },
                xAxis: {
                    categories: ['>10 mins', '5-20 mins', '2-5 mins', 'bounced'],
                    title: {
                        text: null
                    }
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: 'Population (millions)',
                        align: 'high'
                    },
                    labels: {
                        overflow: 'justify'
                    }
                },
                tooltip: {
                    valueSuffix: ' millions'
                },
                plotOptions: {
                    bar: {
                        dataLabels: {
                            enabled: true
                        }
                    }
                },
                legend: {
                    layout: 'vertical',
                    align: 'right',
                    verticalAlign: 'top',
                    x: -40,
                    y: 100,
                    floating: true,
                    borderWidth: 1,
                    backgroundColor: ((Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'),
                    shadow: true
                },
                credits: {
                    enabled: false
                },
                series: [{
                    name: 'Last Month',
                    data: [107, 31, 635, 203]
                }, {
                    name: 'This Month',
                    data: [133, 156, 947, 408]
                }]
            });
        }
    }
})(app);

//####js/component/shopper-profile.js
(function() {
    app['shopper-profile'] = {
        settings: {
            target: '.mod-shopper-profile'
        },
        init: function(context) {
            var s = this.settings;
            var chartContainer = $(s.target).find('#shopper-profile-chart');

            app['shopper-profile'].renderChart(chartContainer);


        },
        renderChart: function(chartContainer) {
            chartContainer.highcharts({
                chart: {
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    plotShadow: false
                },
                title: {
                    text: "Shopper's profile"
                },
                tooltip: {
                    pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: false
                        },
                        showInLegend: true
                    },
                    series: {
                        dataLabels: {
                            enabled: true,
                            formatter: function() {
                                return this.y;
                            },
                            distance: -30,
                            color: 'white'
                        }
                    }
                },
                // legend: {
                //     enabled: true,
                //     layout: 'vertical',
                //     align: 'right',
                //     width: 100,
                //     verticalAlign: 'middle',
                //     useHTML: true,
                //     labelFormatter: function() {
                //         return '<div style="text-align: left;font-size: 10px; width:50px;float:right;">' + this.name + '</div>';
                //     }
                // },
                series: [{
                    type: 'pie',
                    name: 'Browser share',
                    data: [{
                            name: 'Discount Sensitive',
                            y: 45.8,
                            sliced: true,
                            selected: true
                        },
                        ['Fast fashion conscious', 26.8],
                        ['Utility buyer', 8.5],
                        ['Premium brand savy', 6.2]
                    ]
                }],
                credits: {
                    enabled: false
                },
            });
        }
    }
})(app);

//####js/component/revisit-frequency.js
(function() {
    app['revisit-frequency'] = {
        settings: {
            target: '.mod-revisit-frequency'
        },
        init: function(context) {
            var s = this.settings;
            var chartContainer = $(s.target).find('#revisit-frequency-chart');

            app['revisit-frequency'].renderChart(chartContainer);


        },
        renderChart: function(chartContainer) {

            chartContainer.highcharts({
                chart: {
                    type: 'pie'
                },
                title: {
                    text: 'Revisit frequency'
                },
                yAxis: {
                    title: {
                        text: 'Total percent market share'
                    }
                },
                plotOptions: {
                    pie: {
                        shadow: false
                    },
                    series: {
                        dataLabels: {
                            enabled: true,
                            formatter: function() {
                                return 'test';
                            },
                            distance: -30,
                            color: 'white'
                        }
                    }
                },
                tooltip: {
                    formatter: function() {
                        return '<b>' + this.point.name + '</b>: ' + this.y + ' %';
                    }
                },
                legend: {
                    enabled: true,
                    layout: 'vertical',
                    align: 'right',
                    width: 200,
                    verticalAlign: 'middle',
                    useHTML: true,
                    labelFormatter: function() {
                        return '<div style="text-align: left; width:50px;float:right;">' + this.name + '</div>';
                    }
                },
                series: [{
                    name: 'Browsers',
                    data: [
                        ["0-2 weeks", 10],
                        ["2-4 weeks", 15],
                        ["1-3 months", 10],
                        ["3-6 months", 35],
                        ["6-1 months", 10],
                        ["> 1 year", 20]
                    ],
                    size: '100%',
                    innerSize: '60%',
                    showInLegend: true,
                    dataLabels: {
                        enabled: false
                    }
                }],
                credits: {
                    enabled: false
                },
            });
        }
    }
})(app);
