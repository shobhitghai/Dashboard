(function() {
    app['right-now'] = {
        settings: {
            target: '.mod-right-now'
        },
        init: function(context) {
            var s = this.settings;
            var shoppersMall = $(s.target).find('#shoppers-mall-chart');
            var shoppersStore = $(s.target).find('#shoppers-store-chart');

            var shoppersMall_series = [{
                name: 'Discount Sensitive',
                data: [5]
            }, {
                name: 'Utility Buyer',
                data: [2]
            }, {
                name: 'Fashion',
                data: [3]
            }];

            var shoppersStore_series = [{
                name: 'Discount Sensitive',
                data: [2]
            }, {
                name: 'Utility Buyer',
                data: [5]
            }, {
                name: 'Fashion',
                data: [3]
            }]

            app['right-now'].renderChart(shoppersMall, shoppersMall_series);
            app['right-now'].renderChart(shoppersStore, shoppersStore_series);


        },
        renderChart: function(chartContainer, series) {
            chartContainer.highcharts({
                chart: {
                    type: 'bar',
                    height: 100,
                    // width: 190
                },
                title: {
                    text: ''
                },
                xAxis: {
                    lineWidth: 0,
                    minorGridLineWidth: 0,
                    lineColor: 'transparent',
                    labels: {
                        enabled: false
                    },
                    minorTickLength: 0,
                    tickLength: 0
                },
                yAxis: {
                    lineWidth: 0,
                    minorGridLineWidth: 0,
                    lineColor: 'transparent',
                    gridLineColor: 'transparent',
                    labels: {
                        enabled: false
                    },
                    title: {
                        text: ''
                    },
                    minorTickLength: 0,
                    tickLength: 0
                },
                legend: {
                    reversed: true,
                    enabled: false
                },
                plotOptions: {
                    series: {
                        stacking: 'normal',
                        pointWidth: 50
                    }
                },
                series: series,
                credits: {
                    enabled: false
                }
            });
        }
    }
})(app);