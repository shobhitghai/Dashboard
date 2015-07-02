(function() {
    app['time-trend'] = {
        settings: {
            target: '.mod-time-trend'
        },
        init: function(context) {
            var s = this.settings;
            var chartContainer = $(s.target).find('#time-trend-chart');

            app['time-trend'].renderChart(chartContainer);


        },
        refreshData: function() {
            var self = this;
            app['time-trend'].init();
        },
        renderChart: function(chartContainer) {
            chartContainer.highcharts({
                title: {
                    text: '',
                    style: {
                        fontFamily: 'Arial'
                    }
                },
                xAxis: {
                    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
                    ]
                },
                yAxis: {
                    title: {
                        text: 'Walk-ins'
                    },
                    plotLines: [{
                        value: 0,
                        width: 1,
                        color: '#808080'
                    }]
                },
                tooltip: {
                    valueSuffix: ''
                },
                legend: {
                    layout: 'vertical',
                    align: 'right',
                    verticalAlign: 'middle',
                    borderWidth: 0
                },
                series: [{
                    name: 'Tokyo',
                    data: [7.0, 6.9, 9.5, 14.5, 22, 11, 21.2, 26.5, 23.3, 18.3, 13.9, 9.6]
                }, {
                    name: 'New York',
                    data: [-0.2, 0.8, 8, 21, 17.0, 20.0, 8, 11.1, 29.1, 14.1, 8.6, 2.5]
                }],
                credits: {
                    enabled: false
                }
            });
        }
    }
})(app);