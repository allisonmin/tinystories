$(document).ready(function(){
	var username = null,
		query = null,
		cover = null,
		largeCover = null,
		title = null,
		players = [],
		lines = [],
		maxLines = 5; // 5 lines per player

	var socket = io.connect('/');

	// submit username and adds player on server side
	socket.on('connect', function() {
		$("#username-form")
			.slideDown()
			.submit(function() {
				username = $("#username-form [name=username]").val();
				console.log("ClIENT sending username: "+username);
	    		$('#user').slideUp();
				$('#welcome-user').text("Welcome, " + username).slideDown();
				socket.emit('addPlayer', { username: username });
				return false;
			});
	});

	// emit waiting for another player
	socket.on('waiting', function (data) {
		console.log('CLIENT: waiting for another player');
		setTimeout(function(){
	      $('#waiting').fadeIn()
	      },1000);
	});

	// emit flickr form when quorum reached
	socket.on('flickrForm', function (data) {
		$('#waiting').fadeOut();
	    setTimeout(function(){
	    	$('#flickr').fadeIn()
	    },500);
	});

	// submit query, call flickr ajax request
	$("#flickr-form").submit(function() {
		query = $("#flickr-form input[name=search]").val();
		console.log("CLIENT submitting tag: "+query);
		getImages(query);
		// socket.emit('sendFlickrQuery', { query: query });
		return false;
	});

	function getImages(query) {
		$("#gallery ul").fadeOut('slow').empty();
		var key = "0021bb748b9d7a9088b17356d94f6ded";
		$.ajax({
			url: "https://api.flickr.com/services/rest/",
			data: {
				method: "flickr.photos.search",
				api_key: key,
				tag_mode: "all",
				text: "illustration "+query,
				sort: "relevance",
				format: "json",
				per_page: 20,
				pages: 1,
				nojsoncallback: 1
			},
			crossDomain: true,
			success: function(response) {
				var photos = response.photos.photo;
				console.log('CLIENT getting photos from flickr');
				for (var i = 0; i < photos.length; i++) {
					var p = photos[i];
					var farm = p.farm;
					var server = p.server;
					var id = p.id;
					var secret = p.secret;
					var picture = "http://farm"+farm+".static.flickr.com/"+server+"/"+id+"_"+secret+"_q.jpg";
					$("#gallery ul").append("<li><a><img src='"+picture+"'/><p class='caption'>I choose you!</p></a></li>").fadeIn('slow');
					// $('#gallery li').addClass('choose-cover');
					$('#gallery a').addClass('flickr-image');
					$('#gallery img').addClass('flickr');
				}
			}
		});
		$("#flickr-form input[name=search]").val('');
		return false;
	}

	// waiting for image to be chosen
	socket.on('waitingChosen', function () {
		console.log("CLIENT waiting for partner to choose cover");
		$('#waiting')
			.fadeOut()
			.text("You've got a partner. Let's wait for them to choose a cover.")
			.fadeIn('slow');
	});

	// choose the cover for your story
	$(document).on( "click", "img.flickr", function() {
		cover = $(this).attr('src');
		largeCover = cover.replace(/_q/, "_z"); // get the larger image
		$("#flickr").fadeOut('slow').empty();
		$(this)
			.clone()
			.attr('src', largeCover)
			.removeClass('flickr')
			.appendTo('#story-cover');
		socket.emit('coverChosen', { chosen: largeCover });
	});

	// show title form with image chosen
	socket.on('nameCover', function (data) {
		$("#waiting").fadeOut();
		$("#story-cover").empty();
		$("#story-cover").append("<img src='"+data.cover+"'>");
		$("#story-title").fadeIn();
		console.log('CLIENT received image partner chose');
	});

	// waiting for parter to submit story title
	socket.on('waitingTitle', function (data) {
		$("#waiting").text(data.message).fadeIn('slow');
		console.log("CLIENT waiting for title from partner");
	});

	// after submitting title, send title to server
	$("#title-form").submit(function() {
		title = $("#story-title [name=title]").val();
		console.log("CLIENT submitting title: "+title);
		$("#story-title [name=title]").val('');
		$("#title-form").fadeOut('slow');
		$("#story-title").fadeOut().html(title).fadeIn('slow');
		socket.emit('submitTitle', { title: title });
		return false;
	});

	// show story title and begin story
	socket.on('startStory', function (data) {
		$("#waiting").fadeOut('slow');
		$("#story-title").text(data.title).fadeIn();
		console.log('CLIENT received title from partner');
		$("#story").fadeIn('slow');
	});

	// after submitting line, send to server
	$("#line-form").submit(function() {
		lines.push($("#line-form [name=line]").val());
		// console.log('CLIENT there are now '+lines.length+' lines');
		console.log('CLIENT added this line: '+lines[lines.length - 1]);
		$("#line-form [name=line]").val('');
		socket.emit('sendLine', { line: lines[lines.length - 1 ], storyLength: lines.length });
		// if (lines.length >= maxLines) {
		// 	$("#max").text("All done!").fadeIn();
		// }
		return false;
	});

	// show line to current player, transfer turn
	socket.on('addLineCurrent', function (data) {
		if (data.storyLength === maxLines) {
			$("#story-lines").append("<li>"+data.line+"</li>");
			$("#line-form").fadeOut('slow');
			console.log('CLIENT has reached the max!');
		} else if (data.storyLength >= maxLines) {
			$("#max").text('All done!').fadeIn();
			$("#line-form").fadeOut('slow');
		} else {
			$("#story-lines").append("<li>"+data.line+"</li>");
			$("#line-form").fadeOut();
		}
	});

	// show line to other player, transfer turn
	socket.on('addLineOther', function (data) {
		// if (data.storyLength === maxLines) {
		// 	$("#story-lines").append("<li>"+data.line+"</li>");
		// 	$("#line-form").fadeIn('slow');
		// 	console.log('CLIENT has reached the max!');
		// } else if (data.storyLength > maxLines) {
		// 	$("#max").text('All done!').fadeIn();
		// 	$("#line-form").fadeOut('slow');
		// } else {
			$("#story").fadeIn('slow');
			$("#story-lines").append("<li>"+data.line+"</li>");
			if (lines.length >= maxLines) {
				$("#line-form").fadeOut();
				$("#max").text("All done!").fadeIn();
			} else {
				$("#line-form").fadeIn();
			}
		// }
	});

	// socket.on('storyDone', function() {
	// 	$("#line-form").fadeOut('slow');
	// 	$("#max").text('All done!').fadeIn();
	// 	console.log('CLIENT has reached the max!');	
	// });

	socket.on('message', function (data) {
		$("#username-title").text(data.message);
	});

	socket.on('players', function (data) {
		console.log(data);
		$("#numPlayers").text(data.number);
		$("#playerID").text(data.id);
	});
});