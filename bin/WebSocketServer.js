/*
*
* Simple Websocket Server to be imported as a library
* Automatically handles connection timeouts
* Easily Extendable
* No rights reserved
 */

const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const app = express();


/**
 * Initializes Websocket server
 * @param       {[type]} port              port to listen on
 * @param       {[type]} connectionTimeout time in ms to wait for pong
 * @constructor
 */
function WebSocketServer(port, connectionTimeout){
	this.port = port;
	this.connectionTimeout = connectionTimeout;
	this.server = http.createServer(app);
};

WebSocketServer.prototype.start = function(){
	this.instance = new WebSocket.Server({server : this.server});
	this.server.listen(this.port, ()=>{
		console.log('Listening on %d', this.server.address().port);
	});
	//once client connects, event handles are started for each event.
	//functions for each event should be extended as needed
	this.instance.on('connection', (ws, req, error)=>{
		this.keepAlive(ws);
		this.onconnection(ws, req);
		ws.on('message', (data)=>{
			this.onmessage(ws, data);
		});
		ws.on('close', (error)=>{
			this.onclose(error);
		});
		ws.on('pong', (data)=>{
			ws.isAlive = true;
		});
		ws.on('ping', (data)=>{
			ws.isAlive = true;
		});
	});
};

WebSocketServer.prototype.onconnection = function (ws, req) {};
WebSocketServer.prototype.onmessage = function (ws, data) {};
WebSocketServer.prototype.onclose = function (error) {};
/**
 * Make sure that connections stay alive, terminates
 * them if they do not respond to ping
 * @param  {[type]} ws requires ws connection
 * @return {[type]}    terminates connection
 */
WebSocketServer.prototype.keepAlive = function (ws){
	ws.isAlive = true;
	setInterval(function ping() {
		if(ws.isAlive === false) {
			//console.log("killing client");
			return ws.terminate();
		}
		ws.isAlive = false;
		if(ws.readyState === 1){
			//console.log("pinging client");
			ws.ping();
		}
		else return ws.terminate();
	}, 5000);
};

module.exports = WebSocketServer;
