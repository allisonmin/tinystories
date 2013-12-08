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
			// Add a new room to the list
			openRooms.push({ id: socket.id, status: 'CREATE' });
			// Send the username form
			socket.emit('enterUsername', { message: 'Enter your username', sessionID: socket.id, status: 'CREATE' });
		} else {
			console.log('There are ' + openRooms.length + ' open rooms');
			// Send the other player waiting message
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
					// Join the room
					socket.join(roomID);
					// Find the number of players in the room
					numPlayers = io.sockets.clients(roomID).length;
					console.log('User: ' + username + ' joined the room: ' + roomID);
					console.log('There are '+numPlayers+' in the room: '+roomID);
					// When there are 2 players, start the story
					if (numPlayers === 2) {
						io.sockets.in(roomID).emit('startStory', { title: roomTitle, players: roomUsers, image: roomImage, id: roomID });
						socket.broadcast.to(roomID).emit('userTurn', { id: roomID, currentUser: roomUsers[0] });
					}
				} else if (status === "WAITING" && room.status === "CREATE") {
					// Join the room
					socket.join(roomID);
					// Save user2's username
					room.user2 = username;
					console.log(room.user2);
					// Add the room back to the list
					openRooms.push(room);
					console.log('User: '+username+' has joined room while room is status CREATE: '+roomID);
					// Send user2 waiting message
					socket.emit('stillWaiting', { message: 'Just a few more moments', username: username });
				}
			}
		});

		// saved image into open rooms array by finding the id
		socket.on('imagePicked', function (data) {
			for (var i=0; i<openRooms.length; i++) {
				if (openRooms[i].id === data.sessionID) {
					// Set the small url and large url
					openRooms[i].smallURL = data.smallURL;
					openRooms[i].largeURL = data.largeURL;
					console.log(JSON.stringify(openRooms[i]));
					// Send user the title form event
					socket.emit('enterTitle', { sessionID: data.sessionID, largeURL: data.largeURL });
				}
			}
		});

		// saved title into open rooms array by finding the id
		// set status as READY to join
		socket.on('saveTitle', function (data) {
			username = data.username;
			for (var i=0; i<openRooms.length; i++) {
				if (openRooms[i].id === data.sessionID) {
					openRooms[i].title = data.title;
					openRooms[i].status = 'READY';
					console.log(JSON.stringify(openRooms[i]));
					// Join the room
					socket.join(openRooms[i].id);
					console.log('User: ' + username + ' joined the room in saveTitle event: ' + openRooms[i].id);
					if (io.sockets.clients(openRooms[i].id).length !== 2) {
						// Send user waiting message when not enough players
						socket.emit('waiting', { title: data.title, sessionID: data.sessionID, message: 'Waiting for another player' });
					} else if (io.sockets.clients(openRooms[i].id).length === 2) {
						// Start the story for this room
						roomUsers[0] = username;
						console.log('Users in the room are: '+roomUsers);
						io.sockets.in(openRooms[i].id).emit('startStory2', { title: openRooms[i].title, player1: openRooms[i].user, player2: openRooms[i].user2, image: openRooms[i].largeURL, id: openRooms[i].id, currentUser: roomUsers[1] });
						socket.broadcast.to(openRooms[i].id).emit('userTurn', { id: openRooms[i].id, currentUser: roomUsers[1] });
						// Remove the room from openRooms array
						openRooms.splice(i,1); 
					}
				}
			}
		});
		
		// Send added line to the room
		socket.on('sendLine', function (data) {
			var currentUser = data.user;
			lines.push(data.line);
			console.log('Server receievd line: '+data.line+' from '+data.user);
			console.log(lines);

			if (lines.length < 10) {
				io.sockets.in(data.id).emit('showLine', { line: data.line, id: data.id, currentUser: currentUser, totalLines: lines.length });
				// Switch current user to the other user
				for (var i=0; i<roomUsers.length; i++) {
					if (currentUser !== roomUsers[i]) {
						currentUser = roomUsers[i];
						socket.broadcast.to(data.id).emit('userTurn', { id: data.id, currentUser: currentUser });
					}
				}
			} else {
				// send the last line and story finished event
				io.sockets.in(data.id).emit('storyFinished', { line: data.line, id: data.id, currentUser: currentUser, message: "The End" });
				console.log('Server sending finished story event');
			}
		});

		// When a user disconnects, remove any rooms associated with user
		socket.on('disconnect', function () {
			sessionID = socket.id;
			console.log('There are ' + openRooms.length + ' open rooms');
			for (var i=0; i<openRooms.length; i++) {
				if (openRooms[i].id === sessionID) {
					openRooms.splice(i,1);
					console.log('There are now ' + openRooms.length + ' open rooms');
				}
			}
		});
	});
}