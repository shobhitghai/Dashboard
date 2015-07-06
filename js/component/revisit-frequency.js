(function() {
    app['revisit-frequency'] = {
        settings: {
            target: '.mod-revisit-frequency'
        },
        init: function(context) {
            var s = this.settings;
            var chartContainer = $(s.target).find('#revisit-frequency-chart');
            app['revisit-frequency'].fetchData('getRevisitFrequency', chartContainer);



        },
        refreshData: function() {
            var self = this;
            app['revisit-frequency'].init();
        },
        fetchData: function(url, chartContainer) {
            function successCallback(res) {
                var res = $.parseJSON(res);
                var dataObj = new Array();

                console.log(res);

                $.each(res, function(i, v) {
                    var itemObj = new Array();
                    itemObj.push(this['category']);
                    itemObj.push(this['COUNT(mac_address)']);
                    dataObj.push(itemObj);
                });
                app['revisit-frequency'].renderChart(chartContainer, dataObj);

            }

            function errorCallback(err) {
                console.log('navbar' + err || 'err');
            }

            app['ajax-wrapper'].sendAjax(url, {
                storeName: window.storeDetail.name
            }, successCallback, errorCallback)
        },
        renderChart: function(chartContainer, dataObj) {
            // Highcharts.setOptions({
            //         colors: ['#00b0f0', '#f7d348', '#92d050', '#0070c0', '#ff6d60', '#7030a0']
            //     });
            chartContainer.highcharts({
                chart: {
                    type: 'pie',
                    style: {
                        fontFamily: 'Arial'
                    }
                },
                colors: ['#b4c7e7', '#0070c0', '#a9d18e', '#55c6f2', '#f7d348', '#767171'],
                title: {
                    text: ''
                },
                yAxis: {
                    title: {
                        text: 'Total percent market share'
                    }
                },
                plotOptions: {
                    pie: {
                        shadow: false
                    },
                    series: {
                        dataLabels: {
                            enabled: true,
                            formatter: function() {
                                return 'test';
                            },
                            distance: -30,
                            color: 'white'
                        }
                    }
                },
                tooltip: {
                    formatter: function() {
                        return '<b>' + this.point.name + '</b>: ' + this.y ;
                    }
                },
                legend: {
                    enabled: true,
                    layout: 'vertical',
                    align: 'right',
                    width: 200,
                    verticalAlign: 'middle',
                    useHTML: true,
                    itemMarginTop: 10,
                    itemMarginBottom: 10,
                    labelFormatter: function() {
                        return '<div style="text-align: left; width:50px;float:right;">' + this.name + '</div>';
                    }
                },
                series: [{
                    name: 'Revisit Freq.',
                    data: dataObj,
                    size: '100%',
                    innerSize: '60%',
                    showInLegend: true,
                    dataLabels: {
                        enabled: false
                    }
                }],
                credits: {
                    enabled: false
                },
            });
        }
    }
})(app);