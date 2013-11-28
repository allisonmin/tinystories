var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	Author = require('./author.js');

var LineSchema = new Schema({
	text: String,
	_creator: {type: String, ref: 'Author'}
});

var StorySchema = new Schema({
	title: String,
	image: String,
	line: [LineSchema],
	updated: {type: Date, default: Date.now},
	finished: {type: Boolean, default: false}
});

module.exports = mongoose.model('Story', StorySchema);
