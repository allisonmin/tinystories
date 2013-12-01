var story = require('../models/story.js');

var authors = [];
var lines = [];
var title = null;
var quorum = 2;
var maxLines = 5;

exports.init = function(io) {
	var currentPlayers = 0;

  // When a new connection is initiated
	io.sockets.on('connection', function (socket) {
		++currentPlayers;
		socket.emit('players', { number: currentPlayers });
		socket.emit('players', { id: currentPlayers });
		socket.emit('message', { message: "Enter your Nom de Plume" });

		// Add a player, send waiting signal or flickr form
		socket.on('addPlayer', function (data) {
			authors.push(data.username);
			for (var i=0; i<authors.length; i++) {
				console.log('SERVER stored users: '+authors[i]);
			}
			if (currentPlayers < quorum) {
				socket.emit('waiting');
			} else {
				console.log('SERVER sending flickr form');
				socket.emit('flickrForm');
				socket.broadcast.emit('waitingChosen');
			}
		});

		socket.on('coverChosen', function (data) {
			socket.broadcast.emit('nameCover', { cover: data.chosen });
			socket.emit('waitingTitle', { message: 'Wait for your partner to submit story title.'});
			console.log('SERVER: broadcasting image');
		});

		socket.on('submitTitle', function (data) {
			title = data.title;
			socket.broadcast.emit('startStory', { title: data.title });
			console.log('SERVER: got title');
		});

		socket.on('sendLine', function (data) {
			socket.emit('addLineCurrent', { line: data.line, storyLength: data.storyLength });
			socket.broadcast.emit('addLineOther', { line: data.line, storyLength: data.storyLength });
			console.log('SERVER: got the line');
		});

		socket.on('lastLine', function () {
			socket.emit('finish');
			socket.broadcast.emit('finish');
			console.log('SERVER story done');
		});

		// update api so that create a new story with
		// - title
		// - image
		function createStory() {
			$.ajax({
				url: "/stories",
				type: "PUT",
				data: {
					title: title,
					author: $("#author").val(),
					line: $("#line").val()
				},
				success: function(data) {
					$("#response").html(data);
					$("#title").val('');
					$("#author").val('');
					$("#line").val('');
				}
			});
			return false;
		}

		// update api so that updating story with
		// - line
		// - author
		function addLine() {

		}

		socket.broadcast.emit('players', { number: currentPlayers });

		socket.on('disconnect', function () {
			--currentPlayers;
			socket.broadcast.emit('players', { number: currentPlayers });
		});
	});
}