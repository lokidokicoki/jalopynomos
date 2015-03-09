$(function(){
	console.log('loaded public.js');

	$('#ajaxTest').on('click', function (e){
		$.ajax({
			url: '/ajaxTest',
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
