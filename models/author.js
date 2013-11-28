var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var AuthorSchema = new Schema({
	username: String
});

module.exports = mongoose.model('Author', AuthorSchema);