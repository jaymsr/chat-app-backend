var express = require('express');
var http = require('http');
var app = express();
http.createServer(app).listen(3000, function () {
     console.log('Hello Parallel');
})
app.get("*", function (req, res) {
    res.send("Hello World");
})
