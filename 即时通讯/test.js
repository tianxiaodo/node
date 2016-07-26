var http=require("http");
http.createServer(function(req,res){

	console.log("ok");
	res.end("oook");
}).listen(7777);