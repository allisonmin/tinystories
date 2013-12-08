$(document).ready(function(){
	var sessionID = null,
		status = null,
		username = null,
		query = null,
		cover = null,
		largeCover = null,
		title = null,
		lines = [],
		maxLines = 5; // 5 lines per player

	var socket = io.connect('/');

	// Show username form
	socket.on('enterUsername', function (data) {
		$('#username-title').text(data.message);
		setTimeout(function(){
			$('#user').fadeIn()
			}, 500);
		sessionID = data.sessionID;
		status = data.status;
		console.log('Session ID: ' + sessionID);
		console.log('Status: ' + status);
	});

	// Show waiting for open rooms and username form
	socket.on('waitingForRoom', function (data) {
		status = data.status;
		$('#message').html("<h1>" + data.message + "</h1><br>").css('padding-top','100px').slideDown('slow');
		$('#username-title').text('meanwhile, please enter your username');
		setTimeout(function(){
			$('#user').fadeIn()
		}, 500);
	});

	// Show waiting message after sending username
	socket.on('stillWaiting', function (data) {
		$('#message').fadeOut('slow').empty();
		$('#message').html('<h1>'+data.message+', '+data.username+'</h1><br>').css('padding-top', '100px').fadeIn();
	});

	// On user form submit, send username and sessionID to server
	$('#username-form').submit(function(){
		username = $("#username-form input[name=username]").val();
		$('#username-title').slideUp('slow');
		$('#username-form').slideUp('slow');
		socket.emit('saveUsername', { username: username, sessionID: sessionID, status: status });
		console.log('User submitted username: ' + username);
		$("#username-form input[name=username]").val('');
		return false;
	});

	// Show flickr form and hide username form
	socket.on('chooseImage', function (data) {
		$('#username-title').slideUp('slow');
		$('#username-form').slideUp('slow');
		setTimeout(function(){
	    	$('#flickr').fadeIn()
	    },500);
	    setTimeout(function(){
	    	getImages('')
	    },500);
	});

	// On flickr form submit, call flickr AJAX request
	$("#flickr-form").submit(function() {
		query = $("#flickr-form input[name=search]").val();
		console.log("CLIENT submitting tag: "+query);
		getImages(query);
		return false;
	});

	// Flickr AJAX request adds images to the gallery 
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

	// On click for an image, send smallURL and largeURL to server
	$(document).on( "click", "img.flickr", function() {
		cover = $(this).attr('src');
		largeCover = cover.replace(/_q/, "_z"); // get the larger image
		// $("#flickr").fadeOut('slow');
		// $("#gallery ul").fadeOut('slow').empty();
		socket.emit('imagePicked', { smallURL: cover, largeURL: largeCover, sessionID: sessionID });
		console.log('Small url: ' + cover);
		console.log('Large url: ' + largeCover);
	});

	// Show title form and image chosen
	socket.on('enterTitle', function (data) {
		$("#flickr").slideUp();
		$("#gallery ul").fadeOut('slow').empty();
		$("#story-cover img").remove();
		$("#story-cover").removeClass('left');
	    $('#story-title').fadeIn('slow');
		$("#story-cover").append("<img src='"+data.largeURL+"'>").fadeIn('slow');
	});

	// On title form submit, send title to server
	$("#title-form").submit(function() {
		title = $("#title-form input[name=title]").val();
		$("#title-form").fadeOut('slow').hide();
		$("#story-cover").fadeOut('slow').hide();
		console.log("CLIENT submitting title: "+title);
		socket.emit('saveTitle', { title: title, sessionID: sessionID, username: username })
		$("#title-form input[name=title]").val('');
		return false;
	});

	// Show waiting for another player message
	socket.on('waiting', function (data) {
		$("<h1>"+data.title+"</h1>").insertBefore("#story-cover img").hide();
		setTimeout(function(){
	    	$("#message").html("<h1>" + data.message + "</h1>").css('padding','100px').slideDown('slow')
	    },500);
	});

	// Start the story
	socket.on('startStory', function (data) {
		sessionID = data.id;
		$('#message').fadeOut('slow').empty();
		$('#story-cover').addClass('left');
		$('#story-cover img').remove();
		$('#story-title').html('<h1>'+data.title+'</h1>').fadeIn('slow');
		$('#story-title').append('<h3>Written by: '+data.players[0]+' and '+data.players[1]+'</h3>').fadeIn('slow');
		$('#story-cover').append('<img src="'+data.image+'">').fadeIn('slow');
		$('#story').fadeIn('slow');
		$("<h4>The world is made of tiny stories so let's add yours. This is where you'll add lines to your story. Remember, you each get five lines so make it count :)</h4>")
			.insertBefore("#line-form").fadeIn('slow');
		setTimeout(function(){
			$("h4").fadeOut('slow')
		},8000);
		$("#turn-message").html("<h2>"+data.currentUser+" is adding a line</h2>").fadeIn('slow');
	});

	// Start the story (merge this with the event above)
	socket.on('startStory2', function (data) {
		sessionID = data.id;
		$('#message').fadeOut('slow').empty();
		$('#story-cover').addClass('left');
		$('#story-cover img').remove();
		$('#story-title').html('<h1>'+data.title+'</h1>').fadeIn('slow');
		$('#story-title').append('<h3>Written by: '+data.player1+' and '+data.player2+'</h3>').fadeIn('slow');
		$('#story-cover').append('<img src="'+data.image+'">').fadeIn('slow');
		$('#story').fadeIn('slow');
		$("<h4>The world is made of tiny stories so let's add yours. This is where you'll add lines to your story. Remember, you each get five lines so make it count :)</h4>")
			.insertBefore("#line-form").fadeIn('slow');
		setTimeout(function(){
			$("h4").fadeOut('slow')
		},8000);
		$("#turn-message").html("<h2>"+data.currentUser+" is adding a line</h2>").fadeIn('slow');
	});

	// Notify user their turn
	socket.on('userTurn', function (data) {
		$("#turn-message").html("<h2>Your turn</h2>").fadeIn('slow');
		$("#line-form").fadeIn('slow');
	});

	// On line submit, send line to server
	$("#line-form").submit(function() {
		$("#turn-message").fadeOut('slow');
		$("#line-form").fadeOut('slow');
		socket.emit('sendLine', { line: $('#line-form [name=line]').val(), user: username, id: sessionID });
		console.log(username+' sent this line to the server: '+ $('#line-form [name=line]').val());
		$("#line-form [name=line]").val('');
		$("#turn-message").html("<h2>Think about your next line</h2>").fadeIn('slow');
		return false;
	});

	// Add new line to story
	socket.on('showLine', function (data) {
		$("#story-lines").append("<li>"+data.line+"</li>");
		$("#line-form").fadeOut('slow');
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