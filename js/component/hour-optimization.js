(function() {
    app['hour-optimization'] = {
        settings: {
            target: '.mod-hour-optimization'
        },
        init: function(context) {
            var s = this.settings;
            var chartContainer = $(s.target).find('#hour-optimization-chart');

            app['hour-optimization'].fetchData('getHourOptimizationData', chartContainer);


        },
        refreshData: function() {
            var self = this;
            app['hour-optimization'].init();
        },
        fetchData: function(url, chartContainer) {
            function successCallback(res) {
                var res = $.parseJSON(res);
                var dataObj = new Array();
                console.log(res);

                $.each(res, function(i, v) {
                    if (i <= 12) {
                        dataObj.push(this.avg_walk_by)
                    }
                });

                app['hour-optimization'].renderChart(chartContainer, dataObj);

            }

            function errorCallback(err) {
                console.log('navbar' + err || 'err');
            }

            app['ajax-wrapper'].sendAjax(url, {
                storeName: window.storeDetail.name
            }, successCallback, errorCallback)
        },
        renderChart: function(chartContainer, dataObj) {
            chartContainer.highcharts({
                chart: {
                    type: 'column',
                    style: {
                        fontFamily: 'Arial'
                    }
                },
                title: {
                    text: ''
                },
                xAxis: {
                    categories: [
                        '10 a.m',
                        '11 a.m',
                        '12 p.m',
                        '1 p.m',
                        '2 p.m',
                        '3 p.m',
                        '4 p.m',
                        '5 p.m',
                        '6 p.m',
                        '7 p.m',
                        '8 p.m',
                        '9 p.m',
                        '10 p.m'
                    ],
                    crosshair: true,
                    title: {
                        text: null
                    }
                },
                yAxis: {
                    title: {
                        text: null
                    },
                    lineWidth: 0,
                    minorGridLineWidth: 0,
                    lineColor: 'transparent',
                    gridLineColor: 'transparent',
                },
                tooltip: {
                    enabled: true
                },
                plotOptions: {
                    column: {
                        pointPadding: 0.2,
                        borderWidth: 0,
                        dataLabels: {
                            enabled: true,
                            format: '{y}'
                        }
                    }
                },
                series: [{
                    name: 'Average Walk By',
                    data: dataObj

                }],
                credits: {
                    enabled: false
                }
            });
        }
    }
})(app);