module.exports = function(app){
	Story = require('../models/story').Story(app.db);
	Project = require('../models/project').Project(app.db);

	app.get("/projects", function(req, res){
		Project.find({}, function(err, projects){
			res.render('project/index', { projects: projects });
		});
	});

	app.get("/projects/new", function(req, res){
		res.render('project/new', { project : new Project() });
	});

	app.post("/projects/create", function(req, res){
		var project = new Project(req.body.project);

		project.save(function(err) {
	      res.redirect('/projects');
	    });
	});

	app.get("/projects/:id", function(req, res){
		Project.findById(req.params.id, function(err, project){
			res.render('project/show', { project : project });
		});
	});

	app.put("/projects/update", function(req, res){
		Project.findById(req.body.project.id, function(err, project){

			if(req.body.project.story.id){
				project.stories.forEach(function(story){
					if(story.id === req.body.project.story.id){
						story.position = req.body.project.story.position;
					}
				});

				project.save(function(err) {
					if(err){
						console.log(err);
						return false;
					};

			    	res.json(200, { success : true });
		    	});
		    	return;
			}

			story = new Story(req.body.project.story);
			story.position = req.body.project.story.position;
			// story.markModified("position");
			project.stories.push(story);

			project.save(function(err) {
				if(err){ 
					console.log(err) 
					return false;
				};

		    	res.json(200, { success : true });
		    });
		})

	});
}
