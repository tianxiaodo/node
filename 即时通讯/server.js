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

//io����socket�¼�
io.on('connection', function (connection) {
	
    console.log((new Date()) + ' Connection from origin ' + connection.id + '.');
    var json = { logicId:"conn_success",users: users };
    connection.json.send(json);
    var userName = false;

    console.log((new Date()) + ' Connection accepted.');

    connection.on('message', function (message) {
        console.log(message);
        if (message.logicId == "login") {
            clients[message.username] = connection; //���û��������Ӷ�Ӧ
            connection.username = message.username;
        }else if(message.logicId == "chat") {//�û�����Ự
            //1�����Ҹ��û��Ƿ�����ʷ��Ϣ
            var toUser = message.to;//�ỰĿ��
            var from = message.username;//�Ự������
            if(history[toUser]&&history[toUser][from]){
                var historyMsgs = [];
                for (var i = 0; i < history[toUser][from].length; i++) {
                    historyMsgs.push(history[toUser][from][i]);
                };
                connection.json.send({logicId:"history",historyMsgs:historyMsgs});
            }
            //2�����Ŀ���û��Ƿ����ߣ������ߣ�ת���û�����,���򣬴�Ϊ��ʷ�Ự��
            var objConnect = clients[toUser];
            var chatJson = {logicId:"chat", from: from, time: message.time, msg: message.msg };
                connection.json.send(chatJson);
            if (objConnect) {
                objConnect.json.send(chatJson);
            } else {//�洢����ʷ�Ự��
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
        console.log("�ر�����:" + socket);
        delete clients[connection.username];//ɾ���û�������
        

    });

});