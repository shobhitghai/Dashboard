(function() {
    app['right-now'] = {
        settings: {
            target: '.mod-right-now'
        },
        init: function(context) {
            var self = this;
            this.triggerNext = true;
            var s = this.settings;
            var shoppersMall = $(s.target).find('#shoppers-mall-chart');
            var shoppersStore = $(s.target).find('#shoppers-store-chart');

            app['right-now'].fetchData('getRightNowData');

            this.refreshInterval = setInterval(function() {
                if (self.triggerNext) {
                    app['right-now'].fetchData('getRightNowData');
                }
            }, 5000);



            // var shoppersMall_series = [{
            //     name: 'Discount Sensitive',
            //     data: [5]
            // }, {
            //     name: 'Utility Buyer',
            //     data: [2]
            // }, {
            //     name: 'Fashion',
            //     data: [3]
            // }];

            // var shoppersStore_series = [{
            //     name: 'Discount Sensitive',
            //     data: [2]
            // }, {
            //     name: 'Utility Buyer',
            //     data: [5]
            // }, {
            //     name: 'Fashion',
            //     data: [3]
            // }]

            // app['right-now'].renderChart(shoppersMall, shoppersMall_series);
            // app['right-now'].renderChart(shoppersStore, shoppersStore_series);


        },
        refreshData: function() {
            var self = this;
            clearInterval(self.refreshInterval);
            app['right-now'].init();
        },
        fetchData: function(url) {
            var self = this;
            self.triggerNext = false;
            var section = $(self.settings.target);

            function successCallback(res) {
                if (res.Error) {
                    clearInterval(self.refreshInterval);
                } else {
                    self.triggerNext = true;
                    var res = $.parseJSON(res);
                    var dataObj = {};

                    if (res.length && res[0] && res[1]) {
                        dataObj.peopleMall = res[0]['cnt'] + res[1]['cnt'];
                        dataObj.peopleStore = res[1]['cnt'];
                        dataObj.conv = ((dataObj.peopleStore / dataObj.peopleMall) * 100).toFixed(2) + '%';

                        section.find('.people-mall-count').text(dataObj.peopleMall);
                        section.find('.people-store-count').text(dataObj.conv);
                        section.find('.people-sales-count').text(Math.ceil(dataObj.peopleStore / 4));

                    } else {
                        section.find('.people-mall-count').text("NA");
                        section.find('.people-store-count').text("NA");
                        section.find('.people-sales-count').text("NA");
                    }
                }

            }

            function errorCallback(err) {
                console.log('right-now' + err || 'err');
            }

            app['ajax-wrapper'].sendAjax(url, {
                storeName: window.storeDetail.name,
                filterParamObj: window.filterParamObj
            }, successCallback, errorCallback)
        },
        renderChart: function(chartContainer, series) {
            chartContainer.highcharts({
                chart: {
                    type: 'bar',
                    height: 100,
                },
                colors: ['#55c6f2', '#a9d18e', '#f7d348', '#c9c9c9', '#b4c7e7', '#767171'],
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
                    title: {
                        text: ''
                    },
                    minorTickLength: 0,
                    tickLength: 0
                },
                tooltip: {
                    headerFormat: '',
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
                    enabled: false
                },
                plotOptions: {
                    series: {
                        stacking: 'normal',
                        pointWidth: 50,
                        dataLabels: {
                            enabled: true,
                            formatter: function() {
                                return Math.round(this.percentage) + '%';
                            },
                            distance: -30,
                            color: 'white'
                        }
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