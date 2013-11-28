exports.index = function(req,res) {
	res.render('index', {title: 'tinystories'});
};

exports.form = function(req,res) {
	res.render('form', {title: 'tinystories'});
};

exports.newcover = function(req,res) {
	res.render('new', {title: 'tinystories'});
};

exports.newstory = function(req,res) {
	res.render('newstory', {title: 'tinystories'});
};

exports.bookshelf = function(req,res) {
	res.render('bookshelf', {title: 'tinystories'});
};

exports.login = function(req,res) {
	res.render('login', {title: 'tinystories'});
};