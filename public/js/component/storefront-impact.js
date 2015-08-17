(function() {
    app['modification-impact'] = {
        settings: {
            target: '.mod-modification-impact'
        },
        init: function(context) {
            var s = this.settings;
            var target = $(s.target);
            var edit_btn = target.find('.edit-btn');
            var configure_panel = target.find('.impact-edit');
            var startDate = target.find('.storefront-start-date input');
            var reqObj = {};

            configure_panel.addClass('edit-active');

            $(s.target).find('.config-save').off('click').on('click', function() {
                if (startDate.val()) {
                    reqObj.sDate = "'" + startDate.val() + "'";
                    reqObj.filterParamObj = window.filterParamObj;
                    
                    app['modification-impact'].fetchData('getStoreFrontChange', reqObj);
                    configure_panel.toggleClass('edit-active');

                }
            })

            edit_btn.off('click').on('click', function() {
                configure_panel.toggleClass('edit-active');
            });

            $('.storefront-start-date').datepicker({
                format: 'yyyy-mm-dd',
                autoclose: true
            });

        },
        refreshData: function() {
            var self = this;
            app['modification-impact'].init();
        },
        fetchData: function(url, reqObj) {
            var self = this;

            function successCallback(data) {
                var response = $.parseJSON(data);
                console.log(response);

                $('#sf-conversion-change span').text(self.formatConversionData(response.conversionChange) + '%');
                $('#sf-walk-in span').text(self.formatConversionData(response.walkIn) + '%');
                $('#sf-dwell-time span').text(self.formatConversionData(response.dwellTime) + '%');

                self.formatImpactChangeColor();

            }

            function errorCallback(err) {
                console.log(err || 'err');
            }

            app['ajax-wrapper'].sendAjax(url, reqObj, successCallback, errorCallback)

        },
        formatConversionData: function(value) {
            if (parseFloat(value) >= 0) {
                return '+' + value;
            } else {
                return value || 'NA';
            }
        },
        formatImpactChangeColor: function() {
            var valueLabels = $('.mod-modification-impact .impact-change');
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