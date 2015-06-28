(function() {
    app['tile-section'] = {
        settings: {
            target: '.mod-tile-section'
        },
        init: function(context) {
            var s = this.settings;
            var tile_template = App.Template['tile-opportunity'];

            var initMetric = {
                comparison: 'Consecutive',
                period: 'Day'
            }

            app['tile-section'].fetchData('getTilesData', tile_template, initMetric);

            $(s.target).find('.btn-metric[data-metric-comparison]').on('click', function() {
                if ($(this).attr('data-metric-comparison') == 'Like') {
                    $(s.target).find('.grp-timeline .btn-metric[data-metric-period != "Day"]').removeClass('active').addClass('disabled');
                    $(s.target).find('.grp-timeline .btn-metric[data-metric-period="Day"]').addClass('active');
                }else{
                    $(s.target).find('.grp-timeline .btn-metric[data-metric-period != "Day"]').removeClass('disabled');
                }
            });


            $(s.target).find('.btn-metric').on('click', function() {
                if ($(this).attr('data-metric-comparison')) {
                    var metric = {
                        comparison: $(this).data('metric-comparison').trim(),
                        period: $('.grp-timeline .active').data('metric-period').trim()
                    }
                } else {
                    var metric = {
                        comparison: $('.grp-comparison .active').data('metric-comparison').trim(),
                        period: $(this).data('metric-period').trim(),
                    }
                }

                console.log(metric);
                app['tile-section'].fetchData('getTilesData', tile_template, metric);

            })


        },
        fetchData: function(url, template, metric) {
            $.ajax({
                url: hostUrl + url,
                data: metric || {},
                success: function(data) {
                    app['tile-section'].bindTemplate(data, template, metric);
                },
                error: function(err) {
                    console.log('err');
                }
            })
        },
        bindTemplate: function(data, template, metric) {
            var response = $.parseJSON(data);
            var opportunityData = response.opportunityData;
            var storefrontData = response.storefrontData;
            var dwellTimeData = response.dwellTimeData;

            $('.section-opportunity').html(template({
                'tile-name': 'Outside Opportunity',
                'tile-percent': opportunityData['current'] || 'NA',
                'tile-percent-change': (opportunityData['comparison'] ? opportunityData['comparison'].toFixed(1) : 'NA') + '%',
                'tile-period-param': 'vs last ' + metric.period
            }));

            $('.section-storeFront').html(template({
                'tile-name': 'Storefront Conversion',
                'tile-percent': (storefrontData['current'] ? storefrontData['current'].toFixed(1) : 'NA') + '%',
                'tile-percent-change': (storefrontData['comparison'] ? storefrontData['comparison'].toFixed(1) : 'NA') + '%',
                'tile-period-param': 'vs last ' + metric.period
            }));

            $('.section-dwellTime').html(template({
                'tile-name': 'Dwell Time',
                'tile-percent': dwellTimeData['current'] ? dwellTimeData['current'].toFixed(1) : 'NA',
                'tile-percent-change': (dwellTimeData['comparison'] ? dwellTimeData['comparison'].toFixed(1) : 'NA') + '%',
                'tile-period-param': 'vs last ' + metric.period
            }));
        }
    }
})(app);