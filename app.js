
var express = require('express')
  , expressLayouts = require('express-ejs-layouts')
  , mongoose = require('mongoose')
  , index = require('./controllers')
  , user = require('./controllers/user')
  , project = require('./controllers/project')
  , http = require('http')
  , path = require('path');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 8000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(expressLayouts);
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  app.set('db-uri', 'mongodb://localhost/kambix_development');
});

app.configure('production', function() {
  app.use(express.errorHandler());
  app.set('db-uri', 'mongodb://localhost/kamix_production');
});

app.db = mongoose.createConnection(app.set('db-uri'));

index(app);
project(app);

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

var io = require('socket.io').listen(server);
io.configure(function () {
  io.set('transports', [
      'websocket'
    , 'flashsocket'
    , 'htmlfile'
//    , 'xhr-polling'
    , 'jsonp-polling'
  ]);
}); 

io.sockets.on("connection", function(client){

  client.on('message', function (message) {
    switch(message.action){
      case 'moveCard':
        Project.findById(message.data.id, function(err, project){

          if(message.data.story.id){
            project.stories.forEach(function(story){
              if(story.id === message.data.story.id){
                story.position = message.data.story.position;
              }
            });

            project.save(function(err) {
              if(err){
                console.log(err);
                return false;
              };

                io.sockets.json.send(message);
            });
              return;
          }

          story = new Story(message.data.story);
          story.position = message.data.story.position;
          
          project.stories.push(story);

          project.save(function(err) {
            if(err){ 
              console.log(err) 
              return false;
            };

              io.sockets.json.send(message);
        });
      })

      break;

      case "init":
        console.log(message);
        Project.findById(message.data.id, function(err, project){
          
          message = {
            action : "init",
            data : project
          }

          io.sockets.json.send(message);
        });
      break;
    }
  });
});