var socket = io.connect();

socket.on("connect", function(){
	console.log("conectou");

	project.id = $("#project-id").val();
	sendAction("init", project);
});

socket.on('message', function(message){
	
	switch(message.action){
		case "moveCard":
			moveCard($("#" + message.data.story.id), message.data.story.position);
		break;

		case "init":
			if(!message.data)
				return ;

			initCards();

			for(var i in message.data.stories){
				$('#' + message.data.stories[i]._id + ' .card-content').editable('/card/update', {
					submitdata : {project_id : message.data._id, story_id : message.data.stories[i]._id},
			        type      : 'textarea',
			        tooltip   : 'Click to edit...',
			        placeholder   : 'Double Click to Edit.',
			        event: 'dblclick',
			        onblur: 'submit',
			        callback : onCardChange
		     	});

				moveCard($("#" + message.data.stories[i]._id), message.data.stories[i].position);
			}

		break;

		case "createCard":
	 		$("#storys-list")
	 			.prepend("<div id='"+ message.data.story.id +"' class='story-backlog draggable'>" +
	 				"<a href='' class='botao-remove'><i class='icon-remove'></i></a>" +
	 				"<div class='card-content'>" + message.data.story.description + "</div></div>");
	 		$("#desc-story").val("");

	 		$('#' + message.data.story.id + ' .card-content').editable('/card/update', {
				submitdata : {project_id : message.data.id, story_id : message.data.story.id},
		        type      : 'textarea',
		        tooltip   : 'Click to edit...',
		        placeholder   : 'Double Click to Edit.',
		        event: 'dblclick',
		        onblur: 'submit',
		        callback : onCardChange
	     	});
	 		
	 		initCards();
		break;

		case "editCard":
			$("#" + message.data.story.id + " .card-content").text(message.data.story.description);
		break;

		case "removeCard" :
			$("#" + message.data.story.id).remove();
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

	
});

var project = {};

var story = {};

function initCards(){
	project.id = $("#project-id").val();
	$(".story-backlog").draggable();

	$(".story-backlog").on("dragstop", function(event, ui) {
		story.id = this.id;
		story.position = ui.position;

		project.story = story;

		sendAction("moveCard", project);
	});

	$(".story-backlog a.botao-remove").click(function(e){
		e.preventDefault();
		story.id = $(this).parent().attr("id");
		project.story = story;

		sendAction("removeCard", project);
	});
}

var createStory = function(){
	project.id = $("#project-id").val();
	project.name = $("#project-name").val();
	story.description = "";
	story.position = { four: 5 };
	project.story = story;

	sendAction("createCard", project);
}

function sendAction(a, d)
{
	var message = { 
		action: a,
		data: d
	}

	socket.json.send ( message );
}

function moveCard(card, position) {
	card.animate({
		left: position.left + "px",
		top: position.top + "px" 
	}, 500);
}

function onCardChange( text, result ){
	var project = {}, story = {};

	project.id = result.submitdata.project_id;
	story.id = result.submitdata.story_id;
	story.description = text;
	project.story = story
	// console.log(result);
	sendAction('editCard', project);	
}