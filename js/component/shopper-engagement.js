(function() {
    app['shopper-engagement'] = {
        settings: {
            target: '.mod-shopper-engagement'
        },
        init: function(context) {
            var s = this.settings;
            var chartContainer = $(s.target).find('#shopper-engagement-chart');

            app['shopper-engagement'].fetchData('getShopperEngagement', chartContainer);


        },
        refreshData: function() {
            var self = this;
            app['shopper-engagement'].init();
        },
        fetchData: function(url, chartContainer) {
            function successCallback(res) {
                var res = $.parseJSON(res);
                var dataObj = {};

                dataObj.currentData = app['shopper-engagement'].reformatData(res.currentMonthArray);
                dataObj.pastData = app['shopper-engagement'].reformatData(res.lastMonthMArray);

                app['shopper-engagement'].renderChart(chartContainer, dataObj);

            }

            function errorCallback(err) {
                console.log('navbar' + err || 'err');
            }

            app['ajax-wrapper'].sendAjax(url, {
                storeName: window.storeDetail.name
            }, successCallback, errorCallback)
        },
        reformatData: function(data) {
            var total = data[0] + data[1] + data[2] + data[3];
            var res = [];

            $.each(data, function(i, value) {
                res.push(Math.round((value / total) * 100));
            });

            return res;
        },
        renderChart: function(chartContainer, dataObj) {
            chartContainer.highcharts({
                chart: {
                    type: 'bar',
                    style: {
                        fontFamily: 'Arial'
                    }
                },
                colors: ['#a6a6a6', '#55c6f2'],
                title: {
                    text: ''
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
                        text: ''
                    },
                    labels: {
                        overflow: 'justify'
                    }
                },
                tooltip: {
                    valueSuffix: ' %'
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
                    data: dataObj.pastData
                }, {
                    name: 'This Month',
                    data: dataObj.currentData
                }]
            });
        }
    }
})(app);