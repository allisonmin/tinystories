$(function() {
	liststories();
	$('.class').on('click', 'img', function() {
		alert('You clicked me');
	});
});

function liststories() {
	$.ajax({
		url: "/stories/all",
		type: "GET",
		success: function(data) {
			var stories = data;
			for (var i = 0; i < stories.length; i++) {
				if (stories[i].image == undefined) {
					$("#bookshelf ul").append("<li><a><img class='image' id='"+stories[i].title+"' src='../tree_bark/tree_bark.png'></a></li>");
				} else {
					$("#bookshelf ul").append("<li><a><img class='image' id='"+stories[i].title+"' src='"+stories[i].image+"'></a></li>");
				}
			}
		}
	});
	return false;
}