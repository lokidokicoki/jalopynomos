$(function(){
	$('#saveFillup').on('click', function (e){
		console.log('get form data');
		$.ajax({
			url: '/saveFillup',
			type: 'POST',
			data: {name:'bobo'},
			success: function(res){
				return console.log(res);
			},
			error: function (e){
				return console.error(e);
			}
		});
	});
});
