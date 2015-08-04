(function() {
    app['time-trend'] = {
        settings: {
            target: '.mod-time-trend'
        },
        init: function(reloadSection) {
            var s = this.settings;
            var self = this;
            this.chartContainer = $(s.target).find('#time-trend-chart');
            this.response = null;
            if (reloadSection == true) {
                app['time-trend'].fetchData('getMonthlyTimeTrendData', this.chartContainer);
                this.metricSelectionHandler();
            }

        },
        refreshData: function() {
            var self = this;
            app['time-trend'].init();
        },
        fetchData: function(url, chartContainer) {
            var self = this;

            function successCallback(res) {
                var res = $.parseJSON(res);

                self.response = res;
                var data = app['time-trend'].buildOpportunityObj(res);
                app['time-trend'].renderChart(chartContainer, data);
            }

            function errorCallback(err) {
                console.log('navbar' + err || 'err');
            }

            app['ajax-wrapper'].sendAjax(url, {
                filterParamObj: window.filterParamObj,
                sectionParamObj: window.trendSectionObj
            }, successCallback, errorCallback, true)
        },
        metricSelectionHandler: function() {
            var self = this;
            var $section = $(this.settings.target);

            $section.find('.btn-metric').on('click', function() {
                if (self.response) {
                    if ($(this).attr('data-trend-type') == 'Opportunities') {

                        app['time-trend'].renderChart(self.chartContainer, app['time-trend'].buildOpportunityObj(self.response));

                    } else if ($(this).attr('data-trend-type') == 'StoreFront') {

                        app['time-trend'].renderChart(self.chartContainer, app['time-trend'].buildStoreFrontObj(self.response));

                    } else if ($(this).attr('data-trend-type') == 'DwellTime') {

                        app['time-trend'].renderChart(self.chartContainer, app['time-trend'].buildDwellTimeObj(self.response));

                    } else if ($(this).attr('data-trend-type') == 'RepeatCustomer') {

                        app['time-trend'].renderChart(self.chartContainer, app['time-trend'].buildRepeatCustObj(self.response));

                    }
                }
            });
        },
        buildOpportunityObj: function(res) {
            var data = {
                globalArr: [],
                sectionArr: [],
                periodArr: []
            };


            $.each(res.filterPanelData.opportunityData, function(i, v) {
                data.periodArr.push(this.period);
                data.globalArr.push(this.data);
            })

            $.each(res.sectionPanelData.opportunityData, function(i, v) {
                data.sectionArr.push(this.data);
            })

            return data;
        },
        buildStoreFrontObj: function(res) {
            var data = {
                globalArr: [],
                sectionArr: [],
                periodArr: []
            };


            $.each(res.filterPanelData.storeFrontData, function(i, v) {
                data.periodArr.push(this.period);

                if (res.filterPanelData.opportunityData[i]) {
                    data.globalArr.push((this.data / res.filterPanelData.opportunityData[i].data) * 100);
                }
            })

            $.each(res.sectionPanelData.storeFrontData, function(i, v) {
                if (res.sectionPanelData.opportunityData[i]) {
                    data.sectionArr.push((this.data / res.sectionPanelData.opportunityData[i].data) * 100);
                }
            })

            return data;

        },
        buildDwellTimeObj: function(res) {
            var data = {
                globalArr: [],
                sectionArr: [],
                periodArr: []
            };


            $.each(res.filterPanelData.dwellTimeData, function(i, v) {
                data.periodArr.push(this.period);
                data.globalArr.push(this.data);
            })

            $.each(res.sectionPanelData.dwellTimeData, function(i, v) {
                data.sectionArr.push(this.data);
            })

            return data;
        },
        buildRepeatCustObj: function(res) {
            var data = {
                globalArr: [],
                sectionArr: [],
                periodArr: []
            };


            $.each(res.filterPanelData.repeatCustData, function(i, v) {
                data.periodArr.push(this.period);

                if (res.filterPanelData.storeFrontData[i]) {
                    data.globalArr.push((this.data / res.filterPanelData.storeFrontData[i].data) * 100);
                }
            })

            $.each(res.sectionPanelData.repeatCustData, function(i, v) {
                if (res.sectionPanelData.storeFrontData[i]) {
                    data.sectionArr.push((this.data / res.sectionPanelData.storeFrontData[i].data) * 100);
                }
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
                    valueSuffix: '',
                    valueDecimals: 2,
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