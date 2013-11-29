var story = require('../models/story.js');

var playerList = {};
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
			socket.broadcast.emit('startStory', { title: data.title });
			console.log('SERVER: got title');
		});

		socket.on('sendLine', function (data) {
			// if (data.storyLength <= maxLines) {
				socket.emit('addLineCurrent', { line: data.line, storyLength: data.storyLength });
				socket.broadcast.emit('addLineOther', { line: data.line, storyLength: data.storyLength });
				console.log('SERVER: got the line');
			// } else {
			// 	socket.emit('storyDone');
			// 	socket.broadcast.emit('storyDone');
			// 	console.log('SERVER the story is done');
			// }
		});

		socket.on('lastLine', function () {
			socket.emit('finish');
			socket.broadcast.emit('finish');
			console.log('SERVER story done');
		});

		socket.broadcast.emit('players', { number: currentPlayers });

		socket.on('disconnect', function () {
			--currentPlayers;
			socket.broadcast.emit('players', { number: currentPlayers });
		});
	});
}