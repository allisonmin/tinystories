var story = require('../models/story.js');

var authors = [];
var lines = [];
var title = null;
var image = null;
var quorum = 2;
var maxLines = 5;

var sessionID = null,
	openRooms = [],
	username = null,
	status = null,
	room = null,
	roomID = null,
	numPlayers = 0,
	roomTitle = null,
	roomImage = null,
	roomUsers = [];

exports.init = function(io) {
	// var currentPlayers = 0;

  // When a new connection is initiated
	io.sockets.on('connection', function (socket) {
		// If there are no rooms to join then start the process of
		// creating a new room.
		if (openRooms.length === 0) {
			console.log('There are no available rooms');
			console.log('Session ID: ' + socket.id);
			openRooms.push({ id: socket.id, status: 'CREATE' });
			socket.emit('enterUsername', { message: 'Enter your username', sessionID: socket.id, status: 'CREATE' });
		} else {
			console.log('There are ' + openRooms.length + ' open rooms');
			socket.emit('waitingForRoom', { message: 'Waiting for an available room', sessionID: socket.id, status: 'WAITING' });
		}

		// saved username into open rooms array by finding the id
		socket.on('saveUsername', function (data) {
			status = data.status;
			username = data.username;
			console.log('User submited username: '+username+' with status: '+status);
			// if the status of a client is CREATE then save the username
			// and emit the chooseImage event
			if (status === "CREATE") {
				for (var i=0; i<openRooms.length; i++) {
					if (openRooms[i].id === data.sessionID) {
						openRooms[i].user = username;
						console.log(JSON.stringify(openRooms[i]));
						socket.emit('chooseImage', { sessionID: data.sessionID });
					}
				}
			// if the status of a client is WAITING, find a room in openRooms
			// check if the room is ready 
			} else {
				room = openRooms.pop();
				roomID = room.id;
				room.user2 = username;
				roomTitle = room.title;
				roomUsers = [];
				roomUsers.push(room.user);
				roomUsers.push(room.user2);
				console.log(roomUsers);
				roomImage = room.largeURL;
				if (status === "WAITING" && room.status === "READY") {
					socket.join(roomID);
					numPlayers = io.sockets.clients(roomID).length;
					console.log('User: ' + username + ' joined the room: ' + roomID);
					console.log('There are '+numPlayers+' in the room: '+roomID);
					if (numPlayers === 2) {
						io.sockets.in(roomID).emit('startStory', { title: roomTitle, players: roomUsers, image: roomImage });
					}
				} else if (status === "WAITING" && room.status === "CREATE") {
					socket.join(roomID);
					room.user2 = username;
					console.log(room.user2);
					openRooms.push(room); // put the room back
					// room.users.push(username);
					console.log('User: '+username+' has joined room while room is status CREATE: '+roomID);
					socket.emit('stillWaiting', { message: 'Just a few more seconds', username: username });
				}
				// if the status of that room is READY
				// if (room.status === "READY") {
				// 	socket.join(roomID);
				// 	numPlayers = io.sockets.clients(roomID).length;
				// 	console.log('User: ' + username + ' joined the room: ' + roomID);
				// 	console.log('There are '+numPlayers+' in the room: '+roomID);
				// 	if (numPlayers === 2) {
				// 		io.sockets.in(roomID).emit('startStory', { title: roomTitle, players: roomUsers, image: roomImage });
				// 	}
				// } else if (room.status === "CREATE") {
				// 	openRooms.push(room); // put the room back
				// 	console.log('User: '+username+' is still waiting for available room');
				// 	socket.emit('stillWaiting', { message: 'Just a few more seconds', username: username });
				// }
			}
		});

		// saved image into open rooms array by finding the id
		socket.on('imagePicked', function (data) {
			for (var i=0; i<openRooms.length; i++) {
				if (openRooms[i].id === data.sessionID) {
					openRooms[i].smallURL = data.smallURL;
					openRooms[i].largeURL = data.largeURL;
					console.log(JSON.stringify(openRooms[i]));
					socket.emit('enterTitle', { sessionID: data.sessionID, largeURL: data.largeURL });
				}
			}
		});

		// saved title into open rooms array by finding the id
		// set status as READY to join
		socket.on('saveTitle', function (data) {
			// set status of client who was creating the room to waiting
			// status = 'WAITING';
			for (var i=0; i<openRooms.length; i++) {
				if (openRooms[i].id === data.sessionID) {
					openRooms[i].title = data.title;
					openRooms[i].status = 'READY';
					console.log(JSON.stringify(openRooms[i]));
					socket.join(openRooms[i].id);
					console.log('User: ' + username + ' joined the room in saveTitle event: ' + openRooms[i].id);
					if (io.sockets.clients(openRooms[i].id).length !== 2) {
						socket.emit('waiting', { title: data.title, sessionID: data.sessionID, message: 'Waiting for another player' });
					} else if (io.sockets.clients(openRooms[i].id).length === 2) {
						io.sockets.in(openRooms[i].id).emit('startStory2', { title: openRooms[i].title, player1: openRooms[i].user, player2: openRooms[i].user2, image: openRooms[i].largeURL });
						openRooms.splice(i,1); // remove the open room from openRooms array
					}
				}
			}
		});

		// once the creator finishes creating a new room
		// let a waiting user join the room and send them
		// the username form
		// socket.on('creatorReady', function (data) {
		// 	if (status === "WAITING") {
		// 		room = openRooms.pop();
		// 		roomID = room.id;
		// 		roomTitle = room.title;
		// 		roomUsers.push(room.user);
		// 		roomUsers.push(username);
		// 		console.log(roomUsers);
		// 		roomImage = room.largeURL;

		// 		if (room.status === "READY") {
		// 			socket.join(roomID);
		// 			numPlayers = io.sockets.clients(roomID).length;
		// 			// console.log('User: ' + username + ' joined the room: ' + roomID);
		// 			// console.log('There are '+numPlayers+' in the room: '+roomID);
		// 			socket.broadcast.to(roomID).emit('roomReady');
		// 		}
		// 	}// socket.broadcast.emit('roomReady');
		// });






















		// var sessionid = socket.id;
		// console.log("This is the session ID: "+sessionid);
		// socket.emit('players', { number: currentPlayers });
		// socket.emit('players', { id: currentPlayers });
		// socket.emit('message', { message: "Enter your Nom de Plume" });

		// // Add a player, send waiting signal or flickr form
		// socket.on('addPlayer', function (data) {
		// 	++currentPlayers;
		// 	authors.push(data.username);
		// 	for (var i=0; i<authors.length; i++) {
		// 		console.log('SERVER stored users: '+authors[i]);
		// 	}
		// 	if (currentPlayers < quorum) {
		// 		socket.emit('waiting');
		// 	} else {
		// 		console.log('SERVER sending flickr form');
		// 		socket.emit('flickrForm');
		// 		socket.broadcast.emit('waitingChosen');
		// 	}
		// });

		// socket.on('coverChosen', function (data) {
		// 	socket.broadcast.emit('nameCover', { cover: data.chosen });
		// 	socket.emit('waitingTitle', { message: 'Wait for your partner to submit story title.'});
		// 	console.log('SERVER: broadcasting image');
		// });

		// socket.on('submitTitle', function (data) {
		// 	title = data.title;
		// 	socket.broadcast.emit('startStory', { title: data.title });
		// 	console.log('SERVER: got title');
		// });

		// socket.on('sendLine', function (data) {
		// 	socket.emit('addLineCurrent', { line: data.line, storyLength: data.storyLength });
		// 	socket.broadcast.emit('addLineOther', { line: data.line, storyLength: data.storyLength });
		// 	console.log('SERVER: got the line');
		// });

		// socket.on('lastLine', function () {
		// 	socket.emit('finish');
		// 	socket.broadcast.emit('finish');
		// 	console.log('SERVER story done');
		// });

		// // update api so that create a new story with
		// // - title
		// // - image
		// function createStory() {
		// 	$.ajax({
		// 		url: "/stories",
		// 		type: "PUT",
		// 		data: {
		// 			title: title,
		// 			author: $("#author").val(),
		// 			line: $("#line").val()
		// 		},
		// 		success: function(data) {
		// 			$("#response").html(data);
		// 			$("#title").val('');
		// 			$("#author").val('');
		// 			$("#line").val('');
		// 		}
		// 	});
		// 	return false;
		// }

		// // update api so that updating story with
		// // - line
		// // - author
		// // function addLine() {

		// // }

		// socket.broadcast.emit('players', { number: currentPlayers });

		socket.on('disconnect', function () {
			sessionID = socket.id;
			console.log('There are ' + openRooms.length + ' open rooms');
			for (var i=0; i<openRooms.length; i++) {
				if (openRooms[i].id === sessionID) {
					openRooms.splice(i,1);
					console.log('There are now ' + openRooms.length + ' open rooms');
					// openRooms[i].status = 'disconnected';
					// console.log(JSON.stringify(openRooms[i]));
				}
			}
			// --currentPlayers;
			// socket.broadcast.emit('players', { number: currentPlayers });

		});
	});
}