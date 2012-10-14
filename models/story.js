var mongoose = require("mongoose");

var Story = new mongoose.Schema({
	description : String,
	position : {}
});

mongoose.model("Story", Story);

exports.Story = function(db) {
  return db.model('Story');
};