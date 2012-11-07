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

			initColumns(message.data);

			for(var i in message.data.stories){
				activeEditable(message.data.stories[i]._id);

				moveCard($("#" + message.data.stories[i]._id), message.data.stories[i].position);
			}

		break;

		case "createCard":
	 		$("#storys-list")
	 			.prepend("<div id='"+ message.data.story.id +"' class='story-backlog draggable'>" +
	 				"<a href='' class='botao-remove'><i class='icon-remove'></i></a>" +
	 				"<div class='card-content'>" + message.data.story.description + "</div></div>");
	 		$("#desc-story").val("");

	 		initCards();

	 		activeEditable(message.data.story.id);
		break;

		case "editCard":
			$("#" + message.data.story.id + " .card-content").text(message.data.story.description);
		break;

		case "removeCard" :
			// $("#" + message.data.story.id).remove();
		break;
	}
});

$(function(){
	collums_width = 0;
	project.id = $("#project-id").val();

	$("#show-cad-story").click(function(){
		$("#cont-cad-story").slideDown();
	});

	$("#add-story").click(function(){
		createStory();
	});

	$("#add-collum").click(function(){
		console.log(collums_width);
		if(collums_width >= 1400) return;

		$("#board").append('<div class="collum"><h2 class="t-collum">new</h2></div>');

		collums_width = $(".collum").width() + collums_width;
		
		if(collums_width >= $("#board").width()) $("#board").width(collums_width +10);

		$('.t-collum').editable( "/collum/",
			{
				style   : 'inherit',
				type      : 'textarea',
				placeholder   : 'New',
				onblur: 'submit',
				width: '',
				height: '',
				event: 'dblclick'
			}
		);

		columns.push("New");
		project.columns = columns;

		sendAction("updateColumn", project);

	});

	$("#remove-collum").click(function(){
		console.log(collums_width);
		if(collums_width === 0) return;

		$("#board .collum:last").remove();
		columns.pop();

		collums_width = collums_width - 200;	

		if(collums_width <= 800){
			$("#board").width(810);
		}
		else{
			$("#board").width(collums_width + 10);
		}

		project.columns = columns;

		sendAction("removeColumn", project);
		
	});

	
	
});

var project = {};

var story = {};

var columns = [];

function initColumns(project){
	columns = project.columns;

	for(var i in project.columns){
		$("#board").append('<div class="collum"><h2 class="t-collum">'+ project.columns[i] +'</h2></div>');
	}

	$(".t-collum").each(function(){
		// $("#board").width($("#board").width() + $(this).width());
		collums_width = collums_width + $(this).width();
	});

	if(collums_width <= 800){
		$("#board").width(810);
	}
	else{
		$("#board").width(collums_width + 10);
	}

	$('.t-collum').editable( "/collum/",
		{
			style   : 'inherit',
			type      : 'textarea',
			placeholder   : 'New',
			onblur: 'submit',
			width: '',
			height: '',
			event: 'dblclick',
			callback : editColumn
		}
	);
	
}

function editColumn(text, result){
	var names = [];
	$('.t-collum').each(function() {
		names.push($(this).text());
	});
	project.columns = names;

	sendAction("updateColumn", project);
}

function activeEditable(story_id){
	$('#' + story_id + ' .card-content').editable('/card/update', {
		submitdata : {project_id : project.id, story_id : story_id},
        type      : 'textarea',
        tooltip   : 'Click to edit...',
        placeholder   : 'Double Click to Edit.',
        event: 'dblclick',
        onblur: 'submit',
        callback : onCardChange
 	});
}

function initCards(){
	
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

		$(this).parent().remove();

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