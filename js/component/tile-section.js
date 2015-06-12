(function() {
    app['tile-section'] = {
        settings: {
            target: 'mod-tile-section'
        },
        init: function(context) {
            //dummy handlebar
            var template = App.Template['tile-opportunity'];

            //move to separate global wrapper
            $.ajax({
                url: 'http://localhost:3001/api/getData',
                success: function(data) {
                    app['tile-section'].bindTemplate(data, template);
                },
                error: function(err) {
                    console.log('err');
                }
            })
        },
        bindTemplate: function(data, template) {
        	var response = $.parseJSON(data);

            $('.section-opportunity').html(template({
                'tile-name': 'Data count',
                'tile-percent': response.length,
                'tile-percent-change': '',
                'tile-period-param': 'Count of rows'
            }));
        }
    }
})(app);
