// Step 1: Get story ID or title
// Step 2: Find the story
// Step 3: Show each line of story
$(function() {
	$("#addline").submit(addStory);
});

// function getStory() {
// 	var title = $("h2").text();
// 	$("#cover").html("you clicked getStory");
// 	$.ajax({
// 			url: "/stories/" + title,
// 			type: "GET",
// 			data: {
// 				title: title
// 			},
// 			success: function(data) {
// 				// $("#story-lines").append("<h2>"+data.title+"</h2>");
// 				for (var i=0; i < data.line.length; i++) {
// 					$("#story-lines").append("<p>"+data.line[i]._creator+": "+data.line[i].text+"</p>");	
// 				}
// 			}
// 	});
// 	return false;
// }

/* Sets up the form for adding a new story
   by clearing the flickr div and adding
   form elements and the choosen flickr image
   */
function newStory(item) {
	var url = item.src;
	$("#flickr").empty();
	$("#newstoryimage").html("<img src="+url+">");
	$("#addline").html("<input type=text name='title' placeholder='Story Title'><br>");
	$("#addline").append("<input type=text name='author' placeholder='Username'><br>");
	$("#addline").append("<textarea id='line' name='line' rows='4' cols='40' placeholder='Once upon a time...'></textarea><br>");
	$("#addline").append("<input type='submit' value='+Add Line'>");
}

function addStory() {
	var title = $("#addline input[name=title]").val();
	var author = $("#addline input[name=author]").val();
	var line = $("#addline textarea[name=line]").val();
	var image = $("#newstoryimage img").attr("src");
	$.ajax({
			url: "/stories",
			type: "PUT",
			data: {
				title: title,
				author: author,
				line: line,
				image: image
			},
			success: function(data) {
				$("#response").html(data);
				$("#addline input[name=title]").val('');
				$("#addline input[name=author]").val('');
				$("#addline textarea[name=line]").val('');
			}
	});
	return false;
}
