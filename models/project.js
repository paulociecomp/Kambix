var mongoose = require("mongoose");

var Story = new mongoose.Schema({
	description : String,
	position : {}
});

var Project = new mongoose.Schema({
	name : String,
	stories : [Story]
})

mongoose.model("Project", Project);

exports.Project = function(db) {
  return db.model('Project');
};