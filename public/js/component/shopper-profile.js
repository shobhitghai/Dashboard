(function() {
    app['shopper-profile'] = {
        settings: {
            target: '.mod-shopper-profile'
        },
        init: function(context) {
            var s = this.settings;
            var chartContainer = $(s.target).find('#shopper-profile-chart');

            app['shopper-profile'].fetchData('getShopperProfile', chartContainer);


        },
        refreshData: function() {
            var self = this;
            app['shopper-profile'].init();
        },
        fetchData: function(url, chartContainer) {
            function successCallback(res) {
                var res = $.parseJSON(res);
                var dataObj = new Array();
                var otherObj = ['Others', 0];

                $.each(res, function(i, v) {
                    if (i < 5) {
                        var itemObj = new Array();
                        itemObj.push(this['s_profile']);
                        itemObj.push(Math.round(this['count(distinct(tv.mac_address))']));
                        dataObj.push(itemObj);
                    } else {
                        otherObj[1] = otherObj[1] + Math.round(this['count(distinct(tv.mac_address))']);
                        if (i == res.length - 1) {
                            dataObj.push(otherObj);
                        }
                    }

                });

                //right now obj
                var rightNowArr = [];

                $.each(res, function(i, v) {
                    var rightNowObj = {};
                    var dataArr = [];
                    rightNowObj.name = this['s_profile'];
                    dataArr.push(Math.round(this['count(distinct(tv.mac_address))']));
                    rightNowObj.data = dataArr;

                    rightNowArr.push(rightNowObj)
                });

                app['shopper-profile'].renderChart(chartContainer, dataObj);
                app['right-now'].renderChart($('#shoppers-mall-chart'), rightNowArr);
                app['right-now'].renderChart($('#shoppers-store-chart'), rightNowArr);

            }

            function errorCallback(err) {
                console.log('navbar' + err || 'err');
            }

            app['ajax-wrapper'].sendAjax(url, {
                storeName: window.storeDetail.name,
                filterParamObj: window.filterParamObj
            }, successCallback, errorCallback)
        },
        renderChart: function(chartContainer, dataObj) {
            chartContainer.highcharts({
                chart: {
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    plotShadow: false,
                    style: {
                        fontFamily: 'Arial'
                    },
                    height: 366
                },
                colors: ['#55c6f2', '#a9d18e', '#f7d348', '#c9c9c9', '#b4c7e7', '#767171'],
                title: {
                    text: ""
                },
                tooltip: {
                    pointFormat: '<b>{point.percentage:.1f}%</b>'
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
                                return Math.round(this.percentage) + '%';
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
                    data: dataObj
                }],
                credits: {
                    enabled: false
                },
            });
        }
    }
})(app);