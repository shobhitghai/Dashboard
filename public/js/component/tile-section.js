(function() {
    app['tile-section'] = {
        settings: {
            target: '.mod-tile-section',
            metric: {
                comparison: 'Consecutive',
                period: 'Day'
            },
            c: 0
        },
        init: function(context) {
            var self = this;
            this.triggerNext = true;
            this.tile_template = App.Template['tile-opportunity'];
            this.tile_repeat_cust = App.Template['tile-repeat-cust'];

            var s = this.settings;

            s.metric.storeName = window.storeDetail.name;
            s.metric.filterParamObj = window.filterParamObj;

            app['tile-section']._fetchData('getTilesData', s.metric, true);

            $(s.target).find('.btn-metric').off().on('click', function() {

                if ($(this).attr('data-metric-comparison') == 'Like') {
                    $(s.target).find('.grp-timeline .btn-metric[data-metric-period != "Day"]').removeClass('active').addClass('disabled');
                    $(s.target).find('.grp-timeline .btn-metric[data-metric-period="Day"]').addClass('active');
                } else if ($(this).attr('data-metric-comparison') == 'Consecutive') {
                    $(s.target).find('.grp-timeline .btn-metric[data-metric-period != "Day"]').removeClass('disabled');
                }

                if (!$(this).hasClass('active')) {
                    if ($(this).attr('data-metric-comparison')) {
                        s.metric = {
                            comparison: $(this).data('metric-comparison').trim(),
                            period: $('.grp-timeline .active').data('metric-period').trim(),
                            storeName: window.storeDetail.name,
                            filterParamObj: window.filterParamObj
                        }
                    } else {
                        s.metric = {
                            comparison: $('.grp-comparison .active').data('metric-comparison').trim(),
                            period: $(this).data('metric-period').trim(),
                            storeName: window.storeDetail.name,
                            filterParamObj: window.filterParamObj
                        }
                    }

                    app['tile-section']._fetchData('getTilesData', s.metric, true);

                }

            })

            this.ajaxInterval = setInterval(function() {
                s.metric.storeName = window.storeDetail.name;
                s.metric.filterParamObj = window.filterParamObj;

                if (self.triggerNext) {
                    app['tile-section']._fetchData('getTilesData', s.metric);
                }
            }, 5000);

        },
        refreshData: function() {
            var self = this;
            clearInterval(self.ajaxInterval);
            app['tile-section'].init();

        },
        _fetchData: function(url, metric, showLoader) {
            var self = this;
            var s = this.settings;
            self.triggerNext = false;

            function successCallback(data) {
                if (data.Error) {
                    clearInterval(self.ajaxInterval);
                } else {
                    self.triggerNext = true;
                    app['tile-section']._bindTemplate(data, metric);
                }
            }

            function errorCallback(err) {
                clearInterval(self.ajaxInterval);
            }

            app['ajax-wrapper'].sendAjax(url, metric, successCallback, errorCallback, showLoader);

        },
        _bindTemplate: function(data, metric) {
            var response = $.parseJSON(data);
            var opportunityData = response.opportunityData;
            var storefrontData = response.storefrontData;
            var dwellTimeData = response.dwellTimeData;
            var repeatCustomer = response.repeatCustomer;

            $('.section-opportunity').html(this.tile_template({
                'tile-name': 'Outside Opportunity',
                'tile-percent': opportunityData['current'] || 'NA',
                'tile-percent-change': (opportunityData['comparison'] ?
                    app['tile-section']._formatComparisonPercent(opportunityData['comparison'].toFixed(1)) : 'NA') + '%',
                'tile-period-param': 'vs last ' + app['tile-section']._formatPeriodParam(metric)
            }));

            $('.section-storeFront').html(this.tile_template({
                'tile-name': 'Storefront Conversion',
                'tile-percent': (storefrontData['current'] ? storefrontData['current'].toFixed(1) : 'NA') + '%',
                'tile-percent-change': (storefrontData['comparison'] ?
                    app['tile-section']._formatComparisonPercent(storefrontData['comparison'].toFixed(1)) : 'NA') + '%',
                'tile-period-param': 'vs last ' + app['tile-section']._formatPeriodParam(metric)
            }));

            $('.section-dwellTime').html(this.tile_template({
                'tile-name': 'Dwell Time (mm:ss)',
                'tile-percent': dwellTimeData['current'] ? app['tile-section']._formatDwellTime(dwellTimeData['current'].toFixed(0)) : 'NA',
                'tile-percent-change': (dwellTimeData['comparison'] ?
                    app['tile-section']._formatComparisonPercent(dwellTimeData['comparison'].toFixed(1)) : 'NA') + '%',
                'tile-period-param': 'vs last ' + app['tile-section']._formatPeriodParam(metric)
            }));

            $('.section-customers').html(this.tile_repeat_cust({
                'tile-name': 'Repeat Customers',
                'tile-percent': repeatCustomer['current'] ? repeatCustomer['current'].toFixed(1) + '%' : 'NA',
                'tile-percent-change': (repeatCustomer['comparison'] ?
                    app['tile-section']._formatComparisonPercent(repeatCustomer['comparison'].toFixed(1)) : 'NA') + '%',
                'tile-period-param': 'vs last ' + app['tile-section']._formatPeriodParam(metric)
            }));

        },
        _formatPeriodParam: function(metric) {
            if (metric.comparison == 'Like') {
                return Date().split(' ')[0];
            } else {
                return metric.period;
            }
        },
        _formatComparisonPercent: function(data) {
            if (data.indexOf('-') == -1) {
                data = '+' + data;
            }
            return data;
        },
        _formatDwellTime: function(seconds) {
            // var hours = parseInt(seconds / 3600) % 24;
            var minutes = parseInt(seconds / 60) % 60;
            var sec = parseInt(seconds) % 60;

            return (minutes < 10 ? "0" + minutes : minutes) + ":" + (sec < 10 ? "0" + sec : sec);
        }
    }
})(app);