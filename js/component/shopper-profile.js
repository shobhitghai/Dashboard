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
