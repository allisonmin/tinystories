$(document).ready(function(){
	var sessionID = null,
		username = null,
		query = null,
		cover = null,
		largeCover = null,
		title = null,
		lines = [],
		maxLines = 5; // 5 lines per player

	var socket = io.connect('/');

	// show username form
	socket.on('enterUsername', function (data) {
		$('#username-title').text(data.message);
		setTimeout(function(){
			$('#user').fadeIn()
			}, 500);
		sessionID = data.sessionID;
		console.log('Session ID: ' + sessionID);
	});

	// on user form submit, send username and sessionID to server
	$('#username-form').submit(function(){
		username = $("#username-form input[name=username]").val();
		socket.emit('saveUsername', { username: username, sessionID: sessionID });
		return false;
	});

	// show flickr form and hide username form
	socket.on('chooseImage', function (data) {
		$('#username-title').slideUp();
		$('#username-form').slideUp();
		setTimeout(function(){
	    	$('#flickr').fadeIn()
	    },500);
	    setTimeout(function(){
	    	getImages('')
	    },500);
	});

	// on flickr form submit, call flickr ajax request
	$("#flickr-form").submit(function() {
		query = $("#flickr-form input[name=search]").val();
		console.log("CLIENT submitting tag: "+query);
		getImages(query);
		return false;
	});

	// flickr ajax request adds images to the gallery 
	function getImages(query) {
		$("#gallery li").fadeOut('slow').empty();
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
					$("#gallery ul").append("<li><a><img src='"+picture+"'/><p class='caption'>I choose you!</p></a></li>").fadeIn();
					// $('#gallery li').addClass('choose-cover');
					$('#gallery a').addClass('flickr-image');
					$('#gallery img').addClass('flickr');
				}
			}
		});
		$("#flickr-form input[name=search]").val('');
		return false;
	}

	// on click for an image, replace current image url with the large image url
	// then send to server
	$(document).on( "click", "img.flickr", function() {
		cover = $(this).attr('src');
		largeCover = cover.replace(/_q/, "_z"); // get the larger image
		// $("#flickr").fadeOut('slow');
		// $("#gallery ul").fadeOut('slow').empty();
		socket.emit('imagePicked', { smallURL: cover, largeURL: largeCover, sessionID: sessionID });
		console.log('Small url: ' + cover);
		console.log('Large url: ' + largeCover);
	});

	// show title form and image chosen
	socket.on('enterTitle', function (data) {
		// first hide everything from previous event
		$("#flickr").slideUp();
		$("#gallery ul").fadeOut('slow').empty();
		$("#story-cover img").remove();
		// center image and form because no player2
		// slide to left when player2 arrives
		$("#story-cover").removeClass('left');
	    $('#story-title').fadeIn('slow');
		$("#story-cover").append("<img src='"+data.largeURL+"'>").fadeIn('slow');
	});

	// on title form submit, send title to server
	$("#title-form").submit(function() {
		title = $("#title-form input[name=title]").val();
		console.log("CLIENT submitting title: "+title);
		socket.emit('saveTitle', { title: title, sessionID: sessionID })
		return false;
	});

	// show waiting for another player
	socket.on('waiting', function (data) {
		$("#title-form").fadeOut().hide();
		$("#story-cover").fadeOut('slow').hide();
		$("<h1>"+data.title+"</h1>").insertBefore("#story-cover img").hide();
		setTimeout(function(){
	    	$("#message").html("<h1>" + data.message + "</h1>").css('padding','100px').slideDown('slow')
	    },500);
	});














	// // submit username and adds player on server side
	// socket.on('connect', function() {
	// 	$("#username-form")
	// 		.slideDown()
	// 		.submit(function() {
	// 			username = $("#username-form [name=username]").val();
	// 			console.log("ClIENT sending username: "+username);
	//     		$('#user').slideUp();
	// 			$('#welcome-user').text("Welcome, " + username).slideDown();
	// 			socket.emit('addPlayer', { username: username });
	// 			return false;
	// 		});
	// });

	// // emit waiting for another player
	// socket.on('waiting', function (data) {
	// 	console.log('CLIENT: waiting for another player');
	// 	setTimeout(function(){
	//       $('#waiting').fadeIn()
	//       },1000);
	// });

	// // emit flickr form when quorum reached
	// socket.on('flickrForm', function (data) {
	// 	$('#waiting').fadeOut();
	//     setTimeout(function(){
	//     	$('#flickr').fadeIn()
	//     },500);
	// });

	// // submit query, call flickr ajax request
	// $("#flickr-form").submit(function() {
	// 	query = $("#flickr-form input[name=search]").val();
	// 	console.log("CLIENT submitting tag: "+query);
	// 	getImages(query);
	// 	// socket.emit('sendFlickrQuery', { query: query });
	// 	return false;
	// });

	// function getImages(query) {
	// 	$("#gallery ul").fadeOut('slow').empty();
	// 	var key = "0021bb748b9d7a9088b17356d94f6ded";
	// 	$.ajax({
	// 		url: "https://api.flickr.com/services/rest/",
	// 		data: {
	// 			method: "flickr.photos.search",
	// 			api_key: key,
	// 			tag_mode: "all",
	// 			text: "illustration "+query,
	// 			sort: "relevance",
	// 			format: "json",
	// 			per_page: 20,
	// 			pages: 1,
	// 			nojsoncallback: 1
	// 		},
	// 		crossDomain: true,
	// 		success: function(response) {
	// 			var photos = response.photos.photo;
	// 			console.log('CLIENT getting photos from flickr');
	// 			for (var i = 0; i < photos.length; i++) {
	// 				var p = photos[i];
	// 				var farm = p.farm;
	// 				var server = p.server;
	// 				var id = p.id;
	// 				var secret = p.secret;
	// 				var picture = "http://farm"+farm+".static.flickr.com/"+server+"/"+id+"_"+secret+"_q.jpg";
	// 				$("#gallery ul").append("<li><a><img src='"+picture+"'/><p class='caption'>I choose you!</p></a></li>").fadeIn('slow');
	// 				// $('#gallery li').addClass('choose-cover');
	// 				$('#gallery a').addClass('flickr-image');
	// 				$('#gallery img').addClass('flickr');
	// 			}
	// 		}
	// 	});
	// 	$("#flickr-form input[name=search]").val('');
	// 	return false;
	// }

	// // waiting for image to be chosen
	// socket.on('waitingChosen', function () {
	// 	console.log("CLIENT waiting for partner to choose cover");
	// 	$('#waiting')
	// 		.fadeOut()
	// 		.text("You've got a partner. Let's wait for them to choose a cover.")
	// 		.fadeIn('slow');
	// });

	// // choose the cover for your story
	// $(document).on( "click", "img.flickr", function() {
	// 	cover = $(this).attr('src');
	// 	largeCover = cover.replace(/_q/, "_z"); // get the larger image
	// 	$("#flickr").fadeOut('slow').empty();
	// 	$(this)
	// 		.clone()
	// 		.attr('src', largeCover)
	// 		.removeClass('flickr')
	// 		.appendTo('#story-cover');
	// 	socket.emit('coverChosen', { chosen: largeCover });
	// });

	// // show title form with image chosen
	// socket.on('nameCover', function (data) {
	// 	$("#waiting").fadeOut();
	// 	$("#story-cover").empty();
	// 	$("#story-cover").append("<img src='"+data.cover+"'>");
	// 	$("#story-title").fadeIn();
	// 	console.log('CLIENT received image partner chose');
	// });

	// // waiting for parter to submit story title
	// socket.on('waitingTitle', function (data) {
	// 	$("#waiting").text(data.message).fadeIn('slow');
	// 	console.log("CLIENT waiting for title from partner");
	// });

	// // after submitting title, send title to server
	// $("#title-form").submit(function() {
	// 	title = $("#story-title [name=title]").val();
	// 	console.log("CLIENT submitting title: "+title);
	// 	$("#story-title [name=title]").val('');
	// 	$("#title-form").fadeOut('slow');
	// 	$("#story-title").fadeOut().html(title).fadeIn('slow');
	// 	socket.emit('submitTitle', { title: title });
	// 	return false;
	// });

	// // show story title and begin story
	// socket.on('startStory', function (data) {
	// 	$("#waiting").fadeOut('slow');
	// 	$("#story-title").text(data.title).fadeIn();
	// 	console.log('CLIENT received title from partner');
	// 	// $("#story").fadeIn('slow');
	// 	$("#lineMessage").fadeIn('slow');
	// 	$("#line-form").fadeIn('slow');
	// });

	// // after submitting line, send to server
	// $("#line-form").submit(function() {
	// 	lines.push($("#line-form [name=line]").val());
	// 	// console.log('CLIENT there are now '+lines.length+' lines');
	// 	console.log('CLIENT added this line: '+lines[lines.length - 1]);
	// 	$("#line-form [name=line]").val('');
	// 	socket.emit('sendLine', { line: lines[lines.length - 1 ], 
	// 							  storyLength: lines.length, 
	// 							  user: $("#welcome-user").html().replace(/Welcome, /, "") 
	// 							});
	// 	return false;
	// });

	// // show line to current player, transfer turn
	// socket.on('addLineCurrent', function (data) {
	// 	if (data.storyLength === maxLines) {
	// 		$("#story-lines").append("<li>"+data.line+"</li>");
	// 		$("#line-form").fadeOut('slow');
	// 		console.log('CLIENT has reached the max!');
	// 	} else if (data.storyLength >= maxLines) {
	// 		$("#line-form").fadeOut('slow');
	// 	} else {
	// 		// $("#story-lines li:odd").css('background-color', '#fee5b9');
	// 		$("#story-lines").append("<li>"+data.line+"</li>");
	// 		$("#line-form").fadeOut();
	// 	}
	// });

	// // show line to other player, transfer turn
	// socket.on('addLineOther', function (data) {
	// 	$("#story").fadeIn('slow');
	// 	$("#story-lines").append("<li>"+data.line+"</li>");
	// 	if (lines.length >= maxLines) {
	// 		$("#line-form").fadeOut();
	// 		socket.emit('lastLine');
	// 	} else {
	// 		$("#line-form").fadeIn();
	// 	}
	// });

	// // show players that story is finished
	// socket.on('finish', function() {
	// 	$("#max").text('All Done!').fadeIn();
	// 	console.log('CLIENT story is done');
	// });

	// socket.on('message', function (data) {
	// 	$("#username-title").text(data.message);
	// });

	// socket.on('players', function (data) {
	// 	console.log(data);
	// 	$("#numPlayers").text(data.number);
	// 	$("#playerID").text(data.id);
	// });
});