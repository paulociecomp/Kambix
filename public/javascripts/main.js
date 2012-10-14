var socket = io.connect();

function sendAction(a, d)
{
	var message = { 
		action: a,
		data: d
	}
	
	socket.json.send ( message );
}

socket.on("connect", function(){
	
});

socket.on('message', function(message){
	switch(message.action){
		case "moveCard":
			moveCard($("#" + message.data.story.id), message.data.story.position);
		break;
	}
});


$(function(){
	$("#show-cad-story").click(function(){
		$("#cont-cad-story").slideDown();
	});

	$("#add-story").click(function(){
		createStory();
	});

	$(".story-backlog").draggable();

	$(".story-backlog").on("dragstop", function(event, ui) {
		story.id = this.id;
		story.position = ui.position;

		project.id = $("#project-id").val();
		project.story = story;

		sendAction("moveCard", project);
	});
});

var project = {};

var story = {};

var createStory = function(){
	project.id = $("#project-id").val();
	project.name = $("#project-name").val();
	story.description = $("#desc-story").val();
	story.position = { four: 5 };
	project.story = story;

	$.ajax({
		url : "/projects/update",
		data : { project : project },
		type : "PUT",
		dataType : "json",
		success : function(res){
			if(!res.success){ alert("Uma falha ocorreu!"); return }
			
			$("#storys-list").prepend("<div class='story-backlog'>" + $("#desc-story").val() + "</div>");
			$("#desc-story").val("");
		}
	});
}

function moveCard(card, position) {
	card.animate({
		left: position.left + "px",
		top: position.top + "px" 
	}, 500);
}