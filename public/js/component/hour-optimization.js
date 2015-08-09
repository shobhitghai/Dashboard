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
                var periodObj = new Array();

                $.each(res, function(i, v) {
                    dataObj.push(Math.round(this.avg_walk_by));
                    periodObj.push(Math.round(this.hour))
                });

                app['hour-optimization'].renderChart(chartContainer, dataObj, periodObj);

            }

            function errorCallback(err) {
                console.log('navbar' + err || 'err');
            }

            app['ajax-wrapper'].sendAjax(url, {
                storeName: window.storeDetail.name,
                filterParamObj: window.filterParamObj
            }, successCallback, errorCallback)
        },
        renderChart: function(chartContainer, dataObj, periodObj) {
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
                    categories: periodObj,
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
                    name: 'Outside opportunity',
                    data: dataObj

                }],
                credits: {
                    enabled: false
                }
            });
        }
    }
})(app);