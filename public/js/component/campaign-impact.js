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
            var startDate = target.find('.campaign-start-date input');
            var endDate = target.find('.campaign-end-date input');
            var reqObj = {

            }

            configure_panel.addClass('edit-active');

            $('.campaign-start-date').datepicker({
                format: 'yyyy-mm-dd'
            });

            $('.campaign-end-date').datepicker({
                format: 'yyyy-mm-dd'
            });

            $(s.target).find('.config-save').off('click').on('click', function() {
                if (startDate.val() && endDate.val()) {
                    reqObj.sDate = "'" + startDate.val() + "'";
                    reqObj.eDate = "'" + endDate.val() + "'";
                    reqObj.filterParamObj = window.filterParamObj;

                    app['campaign-impact'].fetchData('getCampaignImpact', reqObj);
                    configure_panel.toggleClass('edit-active');
                }
            })

            edit_btn.off('click').on('click', function() {
                configure_panel.toggleClass('edit-active');
            });

            $(s.target).find('.config-cancel').off('click').on('click', function() {
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
                console.log("res from camp impact")
                console.log(response)

                var avgCampaignPeriod = response['campaignData'].cnt / response['campaignData'].DiffDate;
                var avgLastMonth = response['lastMonthData'].cnt / response['lastMonthData'].DiffDate;
                var walk_in = Math.round((avgCampaignPeriod - avgLastMonth) / avgLastMonth * 100);

                var dwtCampaignPeriod = response['campaignData'].dwt;
                var dwtLastMonth = response['lastMonthData'].dwt;
                var dwell_time = Math.round((dwtCampaignPeriod - dwtLastMonth) / dwtLastMonth * 100);

                var newWalkinData = response['newWalkinData'];
                var newWalkInDataCurrent = newWalkinData.current.cnt / newWalkinData.current.DiffDate;
                var newWalkInDataComparison = newWalkinData.comparison.cnt / newWalkinData.comparison.DiffDate;
                var newWalkIn = Math.round((newWalkInDataCurrent - newWalkInDataComparison)/newWalkInDataComparison * 100);

                $('#campaign-walkin span').text(self.formatConversionData(walk_in) + '%');
                $('#campaign-dwt span').text(self.formatConversionData(dwell_time) + '%');
                $('#campaing-new-walkin span').text(self.formatConversionData(newWalkIn) + '%');

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