(function() {
    app['time-trend'] = {
        settings: {
            target: '.mod-time-trend'
        },
        init: function(reloadSection) {
            var s = this.settings;
            if(reloadSection == true){
                var chartContainer = $(s.target).find('#time-trend-chart');
                app['time-trend'].fetchData('getMonthlyTimeTrendData', chartContainer);
            }

        },
        refreshData: function() {
            var self = this;
            app['time-trend'].init();
        },
        fetchData: function(url, chartContainer) {
            function successCallback(res) {
                var res = $.parseJSON(res);
                console.log(res);

                var data = app['time-trend'].buildChartObj(res);

                app['time-trend'].renderChart(chartContainer, data);
            }

            function errorCallback(err) {
                console.log('navbar' + err || 'err');
            }

            app['ajax-wrapper'].sendAjax(url, {
                filterParamObj: window.filterParamObj,
                sectionParamObj: window.trendSectionObj
            }, successCallback, errorCallback)
        },
        buildChartObj: function(res){
            var data = {
                globalArr: [],
                sectionArr: [],
                periodArr: []
            };
            

            $.each(res.filterPanelData.data, function(i,v){
                data.periodArr.push(this.period);
                data.globalArr.push(this.data);
            })

            $.each(res.sectionPanelData.data, function(i,v){
                data.sectionArr.push(this.data);
            })

            return data;
        },
        renderChart: function(chartContainer, data) {
            chartContainer.highcharts({
                title: {
                    text: '',
                    style: {
                        fontFamily: 'Arial'
                    }
                },
                xAxis: {
                    categories: data.periodArr
                },
                yAxis: {
                    title: {
                        text: 'Count'
                    },
                    plotLines: [{
                        value: 0,
                        width: 1,
                        color: '#808080'
                    }]
                },
                tooltip: {
                    valueSuffix: ''
                },
                legend: {
                    layout: 'vertical',
                    align: 'right',
                    verticalAlign: 'middle',
                    borderWidth: 0
                },
                series: [{
                    name: 'Global Selection',
                    data: data.globalArr
                }, {
                    name: 'Specific Selection',
                    data: data.sectionArr
                }],
                credits: {
                    enabled: false
                }
            });
        }
    }
})(app);