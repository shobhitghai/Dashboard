(function() {
    app['cross-store'] = {
        settings: {
            target: '.mod-cross-store'
        },
        init: function(context) {
            var s = this.settings;
            var chartContainer = $(s.target).find('#cross-store-chart');

            app['cross-store'].fetchData('getCrossVisitData', chartContainer);




        },
        refreshData: function() {
            var self = this;
            app['cross-store'].init();
        },
        fetchData: function(url, chartContainer) {
            function successCallback(res) {
                var res = $.parseJSON(res);
                res = res.crossVisit;
                var dataObj = [{
                    y: 0,
                    color: '#a9d18e'
                }, {
                    y: 0,
                    color: '#55c6f2'
                }];

                $.each(res, function(i, v) {
                    if (i == 'store') {
                        dataObj[0].y = parseFloat(v);
                    } else {
                        dataObj[1].y = parseFloat(v);
                    }

                });
                app['cross-store'].renderChart(chartContainer, dataObj);

            }

            function errorCallback(err) {
                console.log('navbar' + err || 'err');
            }

            // console.log(window.panelList)

            // $.each(window.panelList, function(i,v){
                
            // });

            app['ajax-wrapper'].sendAjax(url, {
                storeName: window.storeDetail.name,
                filterParamObj: window.filterParamObj,
                panelList: window.panelList
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
                        'Selected Store(s)',
                        'Brand Average'
                    ],
                    crosshair: true
                },
                yAxis: {
                    title: {
                        text: '% (cross store visits to total visits)'
                    }
                },
                legend: {
                    reversed: true,
                    enabled: false
                },
                tooltip: {
                    headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                    pointFormat: '<tr><td style="padding:0"><b>{point.y:.1f}%</b></td></tr>',
                    footerFormat: '</table>',
                    shared: true,
                    useHTML: true
                },
                plotOptions: {
                    column: {
                        pointPadding: 0.2,
                        borderWidth: 0
                    }
                },
                series: [{
                    name: 'Cross-store',
                    data: dataObj
                }],
                credits: {
                    enabled: false
                }
            });
        }
    }
})(app);