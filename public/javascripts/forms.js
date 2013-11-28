$(function() {
	$("#f1").submit(doPut);
	$("#f2").submit(doGet);
	$("#f3").submit(doPost);
	$("#f4").submit(doDelete);
	$("#f5").submit(addAuthor);
});

function addAuthor() {
	$.ajax({
			url: "/authors",
			type: "PUT",
			data: {
				username: $("#username").val(),
				password: $("#password").val()
			},
			success: function(data) {
				$("#response").html(data);
				$("#username").val('');
				$("#password").val('');
			}
	});
	return false;
}

function doPut() {
	$.ajax({
			url: "/stories",
			type: "PUT",
			data: {
				title: $("#title").val(),
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

function doGet() {
	var title = $("#f2 input").val();
	$.ajax({
			url: "/stories/" + title,
			type: "GET",
			data: {
				title: title
			},
			success: function(data) {
				$("#response").html(data);
				$("#f2 input[name=title]").val('');
			}
	});
	return false;
}

function doPost() {
	var title = $("#f3 input[name=title]").val();
	var author = $("#f3 input[name=author]").val();
	var line = $("#f3 textarea").val();
	$.ajax({
			url: "/stories/" + title,
			type: "POST",
			data: {
				title: title,
				author: author,
				line: line
			},
			success: function(data) {
				$("#response").html(data);
				$("#f3 input[name=title]").val('');
				$("#f3 input[name=author]").val('');
				$("#f3 textarea").val('');
			}
	});
	return false;
}

function doDelete() {
	var title = $("#f4 input[name=title]").val();
	$.ajax({
			url: "/stories/" + title,
			type: "DELETE",
			data: {
				title: title
			},
			success: function(data) {
				$("#response").html(data);
				$("#f4 input[name=title]").val('');
			}
	});
	return false;
}