/* The API contoller
   Exports 5 methods:
   		listStories - Returns a list of all stories
   		findStory - Finds a story by title
   		createStory - Creates a new story
   		updateStory - Updates a story
   		deleteStory - Deletes a story by title
*/

var Story = require('../models/story.js');

exports.createStory = function(req, res) {
	if (req.body.title === "" || req.body.author === "" || req.body.line === "") {
		res.send("You must have a title, author and line.");
	} else {
		new Story({ title: req.body.title,
					image: req.body.image, 
				    line: [{ text: req.body.line, _creator: req.body.author }]
				  }).save();
		res.send("Successfully added a new story.");
	}
}

exports.listStories = function(req, res) {
	Story.find(function(err, stories) {
		if (err) {
			res.send("There are no stories in the Story database.");
			return console.log(err);
		} else {
			res.send(stories);
		}
	});
}

exports.findStory = function(req, res) {
	Story.findOne({title: req.params.title})
		 .populate('_creator')
		 .exec(function(err,story) {
		if (err) {
			res.json(err);
		} else if (story == null) {
			res.send("No story exists with the title: " + req.params.title);
		} else {
			// var length = story.line.length;
			// res.send("The author of " + story.title + " is " + story.line[length-1]._creator);
			res.send(story);
			// res.render('index', {"story": story});
		}
	});
}

exports.updateStory = function(req, res) {
	Story.findOne({title: req.params.title}, function(err,story) {
		if (err) {
			res.json(err);
		} else if (story == null) {
			res.send("No story exists with the title: " + req.params.title);
		} else {
			story.line.push({text: req.body.line, _creator: req.body.author});
			story.save();
			res.send(story.line[story.line.length-1]._creator+" added '"+ req.body.line +"'");
		}
	});
}

exports.deleteStory = function(req, res) {
	Story.findOne({title: req.params.title}, function(err,story) {
		if (err) {
			res.json(err);
		} else if (story == null) {
			res.send("No story exists with the title: " + req.params.title);
		} else {
			story.remove();
			res.send(story.title + " has been deleted from the story database");
		}
	});
}

/* API Controller
   Author */

var Author = require('../models/author.js');

exports.createAuthor = function(req, res) {
	if (req.body.username === "" || req.body.password === "") {
		res.send("You must enter a username.");
	} else {
		new Author({ username: req.body.username, password: req.body.password }).save();
		res.send("Successfully added a new author.");
	}
}

exports.listAuthors = function(req, res) {
	Author.find(function(err, authors) {
		if (err) {
			res.send("There are no authors in the database.");
			return console.log(err);
		} else {
			res.send(authors);
		}
	});
}

exports.findAuthor = function(req, res) {
	Author.findOne({username: req.params.username}, function(err,author) {
		if (err) {
			res.json(err);
		} else if (author == null) {
			res.send("No author exists with the username: " + req.params.username);
		} else {
			res.send("The author's username is" + author.username);
		}
	});
}

// This is just a test
// Remove before sumbitting
exports.test = function(req,res) {
	Story.findOne({title: "Red Glasses"})
		 .populate('_creator')
		 .exec(function(err,story) {
		if (err) {
			res.json(err);
		} else if (story == null) {
			res.send("No story exists with the title: " + req.params.title);
		} else {
			res.render('test', {"story": story});
		}
	});
}
