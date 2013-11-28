var username = null,
	cover = null,
	players = {},
	lines = {};

// $(function() {});

var socket = io.connect('/');

// enter username and adds player on server side
socket.on('connect', function() {
	$("#username-form")
		.slideDown()
		.submit(function() {
			username = $("#username-form [name=username]").val();
			console.log("sending username");
    		$('#user').slideUp();
			$('#welcome-user').text("Welcome, " + username).slideDown();
			socket.emit('addPlayer', { username: username });
			return false;
		});
});

// emit waiting for another player
socket.on('waiting', function (data) {
	console.log('We\'re waiting for another player...');
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

socket.on('message', function (data) {
	$("#username-title").text(data.message);
});

socket.on('players', function (data) {
	console.log(data);
	$("#numPlayers").text(data.number);
	$("#playerID").text(data.id);
});