module.exports = function(app){
	app.get("/", function(req, res){
	  res.render('index', { title: 'Kanbam' });
	});
}


/*
 * GET users listing.
 */

exports.list = function(req, res){
  res.send("respond with a resource");
};