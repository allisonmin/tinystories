var express = require('express'),
	mongoose = require('mongoose'),
	routes = require('./routes'),
	api = require('./routes/api'),
	sio = require('socket.io'),
	http = require('http'),
	gameSockets = require('./routes/serverSide.js');

var app = express();

// Connect to Mongo
// mongoose.connect('mongodb://localhost/tinystories');
mongoose.connect('mongodb://nodejitsu_allisonmin:29a9t4hil1spl9b8aojtmqhdep@ds045998.mongolab.com:45998/nodejitsu_allisonmin_nodejitsudb1068747777');

// Configuration
app.configure(function(){
	app.set('views', __dirname + '/views');
	app.set('view engine', 'ejs');
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(__dirname + '/public'));
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

// Routes
app.get('/', routes.index);
app.get('/form', routes.form); //get rid of this eventually
app.get('/stories/new', routes.newcover);
app.get('/stories/new/story', routes.newstory);
app.get('/bookshelf', routes.bookshelf);
app.get('/stories/all', api.listStories);
app.get('/login', routes.login);
app.get('/test', api.test); // remove before submitting

// Basic CRUD for Story
app.put('/stories', api.createStory);
app.get('/stories/:title', api.findStory);
app.post('/stories/:title', api.updateStory);
app.delete('/stories/:title', api.deleteStory);

// Basic CRUD for Author
app.put('/authors', api.createAuthor);
app.get('/authors', api.listAuthors);

var server = http.createServer(app);
var io = sio.listen(server);
server.listen(3000, function(){
	console.log("Express server listening on port 3000");
});

gameSockets.init(io);
// app.listen(3000);
// console.log('Express server listening on 3000');