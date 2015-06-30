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


            app['tile-section'].fetchData('getTilesData', s.metric);

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
                            period: $('.grp-timeline .active').data('metric-period').trim()
                        }
                    } else {
                        s.metric = {
                            comparison: $('.grp-comparison .active').data('metric-comparison').trim(),
                            period: $(this).data('metric-period').trim(),
                        }
                    }

                    app['tile-section'].fetchData('getTilesData', s.metric);

                }

            })

            setInterval(function() {
                app['tile-section'].fetchData('getTilesData', s.metric || initMetric);
            }, 5000);

        },
        fetchData: function(url, metric) {
            var s = this.settings;

            function successCallback(data) {
                app['tile-section'].bindTemplate(data, metric);
                console.log(s.c++ + ' ' + metric.period)
            }

            function errorCallback(err) {
                console.log(err || 'err');
            }

            app['ajax-wrapper'].sendAjax(url, metric, successCallback, errorCallback)

        },
        bindTemplate: function(data, metric) {
            var response = $.parseJSON(data);
            var opportunityData = response.opportunityData;
            var storefrontData = response.storefrontData;
            var dwellTimeData = response.dwellTimeData;

            $('.section-opportunity').html(this.tile_template({
                'tile-name': 'Outside Opportunity',
                'tile-percent': opportunityData['current'] || 'NA',
                'tile-percent-change': (opportunityData['comparison'] ? opportunityData['comparison'].toFixed(1) : 'NA') + '%',
                'tile-period-param': 'vs last ' + metric.period
            }));

            $('.section-storeFront').html(this.tile_template({
                'tile-name': 'Storefront Conversion',
                'tile-percent': (storefrontData['current'] ? storefrontData['current'].toFixed(1) : 'NA') + '%',
                'tile-percent-change': (storefrontData['comparison'] ? storefrontData['comparison'].toFixed(1) : 'NA') + '%',
                'tile-period-param': 'vs last ' + metric.period
            }));

            $('.section-dwellTime').html(this.tile_template({
                'tile-name': 'Dwell Time',
                'tile-percent': dwellTimeData['current'] ? (dwellTimeData['current'] / 60).toFixed(1) + ' min' : 'NA',
                'tile-percent-change': (dwellTimeData['comparison'] ? dwellTimeData['comparison'].toFixed(1) : 'NA') + '%',
                'tile-period-param': 'vs last ' + metric.period
            }));
        }
    }
})(app);