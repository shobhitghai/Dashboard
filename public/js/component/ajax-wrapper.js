(function() {
    app['ajax-wrapper'] = {
        sendAjax: function(api, data, successCallback, errorCallback, showLoader) {
            window.hostUrl = hostUrl ? hostUrl : 'http://' + window.location.hostname + '/api/';;

            if (showLoader) {
                NProgress.start(true);
            }

            $.ajax({
                url: hostUrl + api,
                data: data || {},
                cache: true,
                success: function(res) {
                    successCallback(res);
                    if (showLoader) {
                        NProgress.done(true);
                    }
                },
                error: function(err) {
                    errorCallback(err);
                }
            })
        }
    }
})(app);