(function(){
	app['tile-section'] = {
		settings: {
			target: 'mod-tile-section'
		},
		init: function(context) {
			//dummy handlebar
			var template = App.Template['tile-opportunity'];

			$('.section-opportunity').html(template({
				'tile-name': 'test',
				'tile-percent': '+30%',
				'tile-percent-change': '100%',
				'tile-period-param': 'vs months'
			}));

			
			$.ajax({
				url: 'http://localhost:3000/api/getData',
				success: function(data){
					console.log(data);
				},
				error: function(err){
					console.log('err');
				}
			})
		}
	}
})(app);