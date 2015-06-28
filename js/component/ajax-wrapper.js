(function() {
    app['ajax-wrapper'] = {
        sendAjax: function(api, data, successCallback, errorCallback) {
            $.ajax({
                url: hostUrl + api,
                data: data || {},
                success: function(res) {
                    successCallback(res);
                },
                error: function(err) {
                    errorCallback(err);
                }
            })
        }
    }
})(app);