(function() {
    app['campaign-impact'] = {
        settings: {
            target: '.mod-campaign-impact'
        },
        init: function(context) {
            var self = this;
            var s = this.settings;
            var target = $(s.target);
            var edit_btn = target.find('.edit-btn');
            var configure_panel = target.find('.impact-edit');
            var panel_btn = target.find('.config-save, .config-cancel');
            var startDate = target.find('.campaign-start-date input');
            var endDate = target.find('.campaign-end-date input');

            var reqObj = {

            }

            $('.campaign-start-date').datepicker({
                format: 'yyyy-mm-dd'
            });
            $('.campaign-end-date').datepicker({
                format: 'yyyy-mm-dd'
            });

            $(s.target).find('.config-save').on('click', function() {
                if (startDate.val() && endDate.val()) {
                    reqObj.sDate = "'" + startDate.val() + "'";
                    reqObj.eDate = "'" + endDate.val() + "'";

                    app['campaign-impact'].fetchData('getCampaignImpact', reqObj);
                }
            })

            edit_btn.on('click', function() {
                configure_panel.toggleClass('edit-active');
            });

            panel_btn.on('click', function() {
                configure_panel.toggleClass('edit-active');
            })
        },
        refreshData: function() {
            var self = this;
            app['campaign-impact'].init();
        },
        saveForm: function() {

        },
        fetchData: function(url, reqObj) {
            var self = this;

            function successCallback(data) {
                var response = $.parseJSON(data);

                var avgCampaignPeriod = response['campaignData'].cnt / response['campaignData'].DiffDate;
                var avgLastMonth = response['lastMonthData'].cnt / response['lastMonthData'].DiffDate;
                var walk_in = Math.round((avgCampaignPeriod - avgLastMonth) / avgLastMonth * 100);

                var dwtCampaignPeriod = response['campaignData'].dwt;
                var dwtLastMonth = response['lastMonthData'].dwt;
                var dwell_time = Math.round((dwtCampaignPeriod - dwtLastMonth) / dwtLastMonth * 100);

                $('#campaign-walkin span').text(self.formatConversionData(walk_in) + '%');
                $('#campaign-dwt span').text(self.formatConversionData(dwell_time) + '%');

                self.formatImpactChangeColor();
            }

            function errorCallback(err) {
                console.log(err || 'err');
            }

            app['ajax-wrapper'].sendAjax(url, reqObj, successCallback, errorCallback)

        },
        formatConversionData: function(value) {
            if (parseInt(value) >= 0) {
                return '+' + value;
            } else {
                return value || 'NA';
            }
        },
        formatImpactChangeColor: function() {
            var valueLabels = $('.mod-campaign-impact .impact-change');
            $.each(valueLabels, function(i, v) {
                if (parseFloat($(this).find('span').text()) >= 0) {
                    $(this).addClass('impact-pos');
                } else {
                    $(this).addClass('impact-neg');
                }
            });
        }
    }
})(app);


// bindTemplate: function(data, template) {
//     var response = $.parseJSON(data);

//     $('.section-opportunity').html(template({
//         'tile-name': 'Data count',
//         'tile-percent': response.length,
//         'tile-percent-change': '',
//         'tile-period-param': 'Count of rows'
//     }));
// }