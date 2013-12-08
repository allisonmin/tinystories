$(document).ready(function(){
	var sessionID = null,
		status = null,
		username = null,
		query = null,
		cover = null,
		largeCover = null,
		title = null,
		lines = [],
		totalLines = 0;

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
		$('#message').html('<h1>'+data.message+', '+data.username+'</h1><br>').css('padding-top', '100px').fadeIn('slow');
	});

	// On user form submit, send username and sessionID to server
	$('#username-form').submit(function(){
		username = $("#username-form input[name=username]").val();
		$('#username-title').slideUp('slow');
		$('#username-form').slideUp('slow');
		$('#message').fadeOut('slow');
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
		$("#title-form").fadeOut('slow');
		$("#story-cover").fadeOut('slow');
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
		$("<h4>This is where you'll add lines to your story. Remember, you each get five lines so make it count :)</h4>")
			.insertBefore("#line-form").fadeIn('slow');
		setTimeout(function(){
			$("h4").fadeOut('slow')
		},8000);
		$("#turn-message").html("<h2>"+data.currentUser+" will go first</h2>").fadeIn('slow');
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
		$("<h4>This is where you'll add lines to your story. Remember, you each get five lines so make it count :)</h4>")
			.insertBefore("#line-form").fadeIn('slow');
		setTimeout(function(){
			$("h4").fadeOut('slow')
		},8000);
		$("#turn-message").html("<h2>"+data.currentUser+" will go first</h2>").fadeIn('slow');
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
		if (totalLines < 8) {
			$("#turn-message").html("<h2>Think about your next line</h2>").fadeIn('slow');
		} else if (totalLines === 8) {
			$("#turn-message").html("<h2>Almost done.</h2>").fadeIn('slow');
		}
		socket.emit('sendLine', { line: $('#line-form [name=line]').val(), user: username, id: sessionID });
		console.log(username+' sent this line to the server: '+ $('#line-form [name=line]').val());
		$("#line-form [name=line]").val('');
		return false;
	});

	// Add new line to story
	socket.on('showLine', function (data) {
		totalLines = data.totalLines;
		console.log("Total lines on client side: "+totalLines);
		$("#story-lines").append("<li>"+data.line+"</li>").slideDown('slow');
		$("#line-form").fadeOut('slow');
	});

	// Add last line and story is finished
	socket.on('storyFinished', function (data) {
		$("#line-form").fadeOut('slow');
		$("#story-lines").append("<li>"+data.line+"</li>").slideDown('slow');
		$("#turn-message").html("<h2>"+data.message+"</h2>").fadeIn('slow');
	});

	// If someone leaves the room
	socket.on('error', function (data) {
		$("#turn-message").html("<h1>"+data.message+"</h1>").fadeIn('slow');
	});
});