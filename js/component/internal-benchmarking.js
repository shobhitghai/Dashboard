(function() {
    app['internal-benchmarking'] = {
        settings: {
            target: '.mod-internal-benchmarking'
        },
        init: function(context) {
            var s = this.settings;
            var walkins_chart = $(s.target).find('#walkins-chart');
            storeFront_chart = $(s.target).find('#storeFront-chart');
            engagement_chart = $(s.target).find('#engagement-chart');
            dwell_chart = $(s.target).find('#dwell-chart');
            repeatCustomers_chart = $(s.target).find('#repeatCustomers-chart');
            topCustomers_chart = $(s.target).find('#topCustomers-chart');

            categoriesArr = ['Your Store', 'This Mall/Area', 'Stores(same city tier)', 'Stores(All)']

            var chartObj = {
                labelName: 'Walk-ins',
                containerName: walkins_chart,
                dataArr: [{
                    name: 'Last Month',
                    data: [107, 31, 635, 203]
                }]
            }

            var chartObj1 = {
                labelName: 'Storefront conversion',
                containerName: storeFront_chart,
                dataArr: [{
                    name: 'Last Month',
                    data: [17, 341, 211, 343]
                }]
            }

            var chartObj2 = {
                labelName: 'Engagement levels',
                containerName: engagement_chart,
                dataArr: [{
                    name: 'Last Month',
                    data: [99, 77, 665, 63]
                }]
            }

            var chartObj3 = {
                labelName: 'Dwell time',
                containerName: dwell_chart,
                dataArr: [{
                    name: 'Last Month',
                    data: [107, 31, 635, 203]
                }]
            }

            var chartObj4 = {
                labelName: 'Repeat customers',
                containerName: repeatCustomers_chart,
                dataArr: [{
                    name: 'Last Month',
                    data: [107, 31, 635, 203]
                }]
            }

            var chartObj5 = {
                labelName: 'Top customers',
                containerName: topCustomers_chart,
                dataArr: [{
                    name: 'Last Month',
                    data: [107, 31, 635, 203]
                }]
            }


            app['internal-benchmarking'].renderChart(chartObj), categoriesArr;
            app['internal-benchmarking'].renderChart(chartObj1, categoriesArr);
            app['internal-benchmarking'].renderChart(chartObj2, categoriesArr);
            app['internal-benchmarking'].renderChart(chartObj3, categoriesArr);
            app['internal-benchmarking'].renderChart(chartObj4, categoriesArr);
            app['internal-benchmarking'].renderChart(chartObj5, categoriesArr);


        },
        renderChart: function(chartObj) {
            var chartContainer = chartObj.containerName;

            chartContainer.highcharts({
                chart: {
                    type: 'bar'
                },
                title: {
                    text: ''
                },
                xAxis: {
                    categories: categoriesArr,
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
                        text: chartObj.labelName                    },
                    minorTickLength: 0,
                    tickLength: 0
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
                    enabled: false
                },
                credits: {
                    enabled: false
                },
                series: chartObj.dataArr
            });
        }
    }
})(app);