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
            var panel_btn = target.find('.config-save, .config-cancel');

            edit_btn.on('click', function() {
                configure_panel.toggleClass('edit-active');
            });

            panel_btn.on('click', function() {
                configure_panel.toggleClass('edit-active');
            })


            $('.storefront-start-date').datepicker({});
            

        }
    }
})(app);
