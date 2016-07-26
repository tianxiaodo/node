"use strict";



var http = require('http');

/**
 * Global variables
 */
var history = [];
// list of currently connected clients (users)
var users = ["user1","user2"];
var clients = [];



/**
 * HTTP server
 */
var server = http.createServer(function (request, response) {
    // Not important for us. We're writing socket.io server, not HTTP server
	console.log("http server is ok  ,writing socket.io server");
});
server.listen(1337);

/**
 * socketio server
 */
var io = require("socket.io").listen(server);

//io监听socket事件
io.on('connection', function (connection) {
	
    console.log((new Date()) + ' Connection from origin ' + connection.id + '.');
    var json = { logicId:"conn_success",users: users };
    connection.json.send(json);
    var userName = false;

    console.log((new Date()) + ' Connection accepted.');

    connection.on('message', function (message) {
        console.log(message);
        if (message.logicId == "login") {
            clients[message.username] = connection; //将用户名与连接对应
            connection.username = message.username;
        }else if(message.logicId == "chat") {//用户发起会话
            //1、查找该用户是否有历史消息
            var toUser = message.to;//会话目标
            var from = message.username;//会话发起人
            if(history[toUser]&&history[toUser][from]){
                var historyMsgs = [];
                for (var i = 0; i < history[toUser][from].length; i++) {
                    historyMsgs.push(history[toUser][from][i]);
                };
                connection.json.send({logicId:"history",historyMsgs:historyMsgs});
            }
            //2、检查目标用户是否在线，若在线，转发用户请求,否则，存为历史会话中
            var objConnect = clients[toUser];
            var chatJson = {logicId:"chat", from: from, time: message.time, msg: message.msg };
                connection.json.send(chatJson);
            if (objConnect) {
                objConnect.json.send(chatJson);
            } else {//存储于历史会话中
                if (!history[from]||!history[from][toUser]) {
                    if (!history[from]) {
                        history[from] = [];
                    }
                    history[from][toUser] = [];
                }
                history[from][toUser].push(chatJson);
            }
        }
    });

    // user disconnected
    connection.on('disconnect', function (socket) {
        console.log("关闭连接:" + socket);
        delete clients[connection.username];//删除用户的连接
        

    });

});