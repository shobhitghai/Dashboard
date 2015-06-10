(function(){
	app['tile-section'] = {
		settings: {
			target: 'mod-tile-section'
		},
		init: function(context) {
			//dummy
			$.ajax({
				url: 'http://localhost:3000/api/getallcities',
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