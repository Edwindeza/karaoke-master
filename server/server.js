var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var clients = [];

app.use(express.static('public'));

io.on('connection', function(socket){
	console.log("Client connected: " + socket.id);

	socket.on('configure', function(data){
		console.log('configure');
		data.socket = socket.id;
		var index = -1;
		console.log(data);
		clients.push(data);
	});

	socket.on('disconnect', function (data){
		console.log('disconnect');
		for(var i = 0 ; i < clients.length ; ++i){
			if(clients[i].socket == socket.id){
				clients.splice(i, 1);
				break;
			}
		}
	});

	socket.on('play-tv', function(data){
		console.log('play-tv');
		var index = -1;
		var message = "Error: Could't initialize playlist ... ";
		console.log(data.id);
		for(var i = 0 ; i < clients.length ; ++i){
			if(clients[i].id == data.id){
				index = i;
				break;
			}
		}
		console.log(index);
		if(index != -1)io.to(clients[index].socket).emit("start-playlist");
		else socket.emit("show-error", message);
	});

	socket.on('pause-tv', function(data){
		console.log('stop-tv');
		var index = -1;
		var message = "Error: Could't stop playlist ... ";
		console.log(data.id);
		for(var i = 0 ; i < clients.length ; ++i){
			if(clients[i].id == data.id){
				index = i;
				break;
			}
		}

		if(index != -1){
			io.to(clients[index].socket).emit("stop-playlist");
		}
		else socket.emit("show-error", message);
	});

	socket.on('change-tv', function(data){
		console.log('change-tv');
		var index = -1;
		var message = "Error: Could't change playlist ... ";
		console.log(data.id);
		for(var i = 0 ; i < clients.length ; ++i){
			if(clients[i].id == data.id){
				index = i;
				break;
			}
		}

		if(index != -1){
			io.to(clients[index].socket).emit("change-playlist");
		}
		else socket.emit("show-error", message);
	});
	

	socket.on('add-song', function(data){
		console.log('add-song');
		var index = -1;
		var message = "Error: Could't add song to playlist ... ";
		console.log(data.id);
		for(var i = 0 ; i < clients.length ; ++i){
			if(clients[i].id == data.id){
				index = i;
				io.to(clients[index].socket).emit("add-song", data.song);
			}
		}

		if(index == -1) socket.emit("show-error", message);
	});

	socket.on('sync', function(data){
		console.log('sync');
		var index = -1;
		var message = "Error: Could't sync song ... ";
		for(var i = 0 ; i < clients.length ; ++i){
			if(clients[i].id == data.id && clients[i].socket != socket.id){
				index = i;
				io.to(clients[index].socket).emit("sync", data);
			}
		}

		if(index == -1) socket.emit("show-error", message);
	});

	socket.on('ask-time', function(data){
		console.log('ask-time');
		var index = -1;
		var message = "Error: Could't get current time";
		data['asker_id'] = socket.id;
		console.log(data);

		for(var i = 0 ; i < clients.length ; ++i){
			if(clients[i].id == data.id && clients[i].socket != socket.id && clients[i].type == 'master'){
				index = i;
				io.to(clients[index].socket).emit("ask-time", data);
				break;
			}
		}

		if(index == -1) socket.emit("show-error", message);
	});

	socket.on('response-time', function(data){
		console.log('response-time');
		var index = -1;
		var message = "Error: Could't set current time";

		for(var i = 0 ; i < clients.length ; ++i){
			if(clients[i].id == data.id && clients[i].socket != socket.id && clients[i].socket == data.asker_id && clients[i].type == 'slave'){
				index = i;
				io.to(clients[index].socket).emit("response-time", data);
				break;
			}
		}

		if(index == -1) socket.emit("show-error", message);
	});

	socket.on('debug-time', function(data){
		console.log("diff: "+data.diff);
		console.log("current: "+data.currentTime);
	});
});

server.listen(3100, function(){
	console.log("Server is running ...");
});