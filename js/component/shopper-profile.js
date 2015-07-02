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
        refreshData: function() {
            var self = this;
            app['shopper-profile'].init();
        },
        renderChart: function(chartContainer) {
            chartContainer.highcharts({
                chart: {
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    plotShadow: false,
                    style: {
                        fontFamily: 'Arial'
                    }
                },
                colors: ['#55c6f2', '#a9d18e', '#f7d348', '#c9c9c9'],
                title: {
                    text: ""
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
                legend: {
                    itemMarginBottom: 10
                },
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
