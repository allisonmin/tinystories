$(function() {
	// getImages();
	// $(".preload").load(function(event) {
	// 	$(this).fadeIn(1000);
	// });
	$("#flickr-form").submit(getImages);
});

function getImages() {
	$("#gallery ul").empty();
	var q = $("#flickr-form input[name=search]").val();
	var key = "0021bb748b9d7a9088b17356d94f6ded";
	$.ajax({
		url: "https://api.flickr.com/services/rest/",
		data: {
			method: "flickr.photos.search",
			api_key: key,
			tag_mode: "all",
			text: "illustration "+q,
			sort: "relevance",
			format: "json",
			per_page: 20,
			pages: 1,
			jsoncallback: "displayImages"
		},
		jsonp: false,
		dataType: "jsonp",
		crossDomain: true
	});
	$("#flickr-form input[name=search]").val('');
	return false;
}

function displayImages(response) {
	var photos = response.photos.photo;
	for (var i = 0; i < photos.length; i++) {
		var p = photos[i];
		var farm = p.farm;
		var server = p.server;
		var id = p.id;
		var secret = p.secret;
		var picture = "http://farm"+farm+".static.flickr.com/"+server+"/"+id+"_"+secret+"_q.jpg";
		$("#gallery ul").append("<li><a class='flickr-image'><img class='preload' src="+picture+" onclick='newStory(this)'><p class='caption'>I choose you!</p></a></li>");
	}
}