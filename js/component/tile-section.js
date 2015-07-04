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
            this.tile_template = App.Template['tile-opportunity'];

            var s = this.settings;

            s.metric.storeName = window.storeDetail.name;
            app['tile-section']._fetchData('getTilesData', s.metric);

            $(s.target).find('.btn-metric[data-metric-comparison]').on('click', function() {
                if ($(this).attr('data-metric-comparison') == 'Like') {
                    $(s.target).find('.grp-timeline .btn-metric[data-metric-period != "Day"]').removeClass('active').addClass('disabled');
                    $(s.target).find('.grp-timeline .btn-metric[data-metric-period="Day"]').addClass('active');
                } else {
                    $(s.target).find('.grp-timeline .btn-metric[data-metric-period != "Day"]').removeClass('disabled');
                }
            });


            $(s.target).find('.btn-metric').on('click', function() {
                if (!$(this).hasClass('active')) {
                    if ($(this).attr('data-metric-comparison')) {
                        s.metric = {
                            comparison: $(this).data('metric-comparison').trim(),
                            period: $('.grp-timeline .active').data('metric-period').trim(),
                            storeName: window.storeDetail.name
                        }
                    } else {
                        s.metric = {
                            comparison: $('.grp-comparison .active').data('metric-comparison').trim(),
                            period: $(this).data('metric-period').trim(),
                            storeName: window.storeDetail.name
                        }
                    }

                    app['tile-section']._fetchData('getTilesData', s.metric);

                }

            })

            this.ajaxInterval = setInterval(function() {
                s.metric.storeName = window.storeDetail.name;
                app['tile-section']._fetchData('getTilesData', s.metric);
            }, 5000);

        },
        refreshData: function() {
            var self = this;
            clearInterval(self.ajaxInterval);
            app['tile-section'].init();

        },
        _fetchData: function(url, metric) {
            var self = this;
            var s = this.settings;

            function successCallback(data) {
                app['tile-section']._bindTemplate(data, metric);
                // console.log(s.c++ + ' ' + metric.period)
            }

            function errorCallback(err) {
                // console.log(err || 'err');
                clearInterval(self.ajaxInterval);
            }

            app['ajax-wrapper'].sendAjax(url, metric, successCallback, errorCallback)

        },
        _bindTemplate: function(data, metric) {
            var response = $.parseJSON(data);
            var opportunityData = response.opportunityData;
            var storefrontData = response.storefrontData;
            var dwellTimeData = response.dwellTimeData;

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
                'tile-name': 'Dwell Time (hh:mm)',
                'tile-percent': dwellTimeData['current'] ? app['tile-section']._formatDwellTime(dwellTimeData['current'].toFixed(0)) : 'NA',
                'tile-percent-change': (dwellTimeData['comparison'] ?
                    app['tile-section']._formatComparisonPercent(dwellTimeData['comparison'].toFixed(1)) : 'NA') + '%',
                'tile-period-param': 'vs last ' + app['tile-section']._formatPeriodParam(metric)
            }));

            $('.section-customers .tile-data-count').text(Math.floor((Math.random() * 1) + 5) + '%');
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
            var hours = parseInt(seconds / 3600) % 24;
            var minutes = parseInt(seconds / 60) % 60;

            return (hours < 10 ? "0" + hours : hours) + ":" + (minutes < 10 ? "0" + minutes : minutes);
        }
    }
})(app);