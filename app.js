/*
Conway's Game of Life
Clone by Drake Luce
https://github.com/ihatecsv
Server
*/

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var chalk = require('chalk');

function zero2D(rows, cols){
  var array = [], row = [];
  while (cols--) row.push(0);
  while (rows--) array.push(row.slice());
  return array;
}

var grid = zero2D(200,200);
var otherGrid = zero2D(200,200);

var tickSpeed = 300;

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

function countNeighbours(x, y, type){
	count = 0;
	for(var i = -1; i <= 1; i++){
		for(var j = -1; j <= 1; j++){
			if(x+i >= 0 && x+i < 200 && y+j >= 0 && y+j < 200){
				if(!(i == 0 && j == 0)){
					if(grid[x+i][y+j] == type){
						count++;
					}
				}
			}
		}
	}
	return count;
}

io.on('connection', function(socket){
	var d = new Date();
	console.log(chalk.green('User connected with ' + socket.request.connection.remoteAddress) + " at " + d.toUTCString());
	
	io.emit('grid', grid);
	
	io.emit('tickSpeed', tickSpeed);
	
	socket.on('clientGrid', function(clientGrid){
		for(var i = 0; i < clientGrid.length; i++){
			for(var j = 0; j < clientGrid.length; j++){
				if(clientGrid[i][j] == 1){
					grid[i][j] = 1;
				}
			}
		}
		var d = new Date();
		console.log(chalk.blue('Creation pushed by ' + socket.request.connection.remoteAddress) + " at " + d.toUTCString());
	});
	
	socket.on('clear', function(e){
		grid = zero2D(200,200);
		io.emit('grid', grid);
		var d = new Date();
		console.log(chalk.yellow('Board cleared by ' + socket.request.connection.remoteAddress) + " at " + d.toUTCString());
	});
	
	socket.on('disconnect', function (e){
		var d = new Date();
		console.log(chalk.red('User disconnected: ' + socket.request.connection.remoteAddress) + " at " + d.toUTCString());
	});
});

http.listen(3000, function(){
	console.log('listening on *:3000');
});

setInterval(function(){
	for(var i = 0; i < 200; i++){
		for(var j = 0; j < 200; j++){
			if(grid[i][j] == 1){
				var count = countNeighbours(i, j, 1);
				//console.log("alive " + count);
				if(count < 2 || count > 3){
					otherGrid[i][j] = 0;
				}else{
					otherGrid[i][j] = 1;
				}
			}else if(grid[i][j] == 0){
				var count = countNeighbours(i, j, 1);
				if(count == 3){
					otherGrid[i][j] = 1;
				}
			}
		}
	}
	grid = otherGrid;
	otherGrid = zero2D(200,200);
	io.emit('grid', grid);
}, 300);