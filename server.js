var express = require('express');
<<<<<<< HEAD
var http = require('http').createServer(app);
||||||| merged common ancestors
var http = require('http');
=======
>>>>>>> 535aba43d0da114be16970d3fa0c472464038162
var app = express();
<<<<<<< HEAD
var io = require('socket.io')(http)


http.listen(3000, function () {
     console.log('Hello Parallel');
})
app.get("*", function (req, res) {
    res.send("Hello World");
})
io.on('connection', function(socket){
    console.log('a user connected');
  });
async function main(){
    try{

        /*const MongoClient = require('mongodb').MongoClient;
        const uri = "mongodb+srv://admin:parallel2020@cluster0-cegct.mongodb.net/test?retryWrites=true&w=majority";
        const client = new MongoClient(uri, { 
            useNewUrlParser: true, 
            useUnifiedTopology: true
        });
        await client.connect();
        const find = await client.db("Parallel").collection("Users").findOne({ //test query
            _id : 5000
        });
        console.log(find)*/

    }catch(e){
        console.error(e)
    }
||||||| merged common ancestors
http.createServer(app).listen(3000, function () {
     console.log('Hello Parallel');
})
app.get("*", function (req, res) {
    res.send("Hello World");
})
async function main(){
    try{

        const MongoClient = require('mongodb').MongoClient;
        const uri = "mongodb+srv://admin:parallel2020@cluster0-cegct.mongodb.net/test?retryWrites=true&w=majority";
        const client = new MongoClient(uri, { 
            useNewUrlParser: true, 
            useUnifiedTopology: true
        });
        await client.connect();
        const find = await client.db("Parallel").collection("Users").findOne({ //test query
            _id : 5000
        });
        console.log(find)

    }catch(e){
        console.error(e)
    }
=======
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://admin:parallel2020@cluster0-cegct.mongodb.net/test?retryWrites=true&w=majority";
const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});
client.connect();
>>>>>>> 535aba43d0da114be16970d3fa0c472464038162

http.listen(3000, function(){
	console.log('Hello Parallel');
  	console.log('listening on *:3000');
});

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/:group', function(req, res) {
  //lol
});

io.on('connection', function(socket){

  socket.on('new-user', async function(name) {
    var user = {eiei:name};
    await newUser(user);
    socket.broadcast.emit('new-user', name + ' has joined the server');
  });

  socket.on('new-group', async function(groupName) {
    var group = {name:groupName}
    await newGroup(group);
    // ใส่มันjoin group ด้วย
  });

  socket.on('join-group', function(msg) {
    // msg : userId, groupId
    //if user not in group: 
    socket.join(msg.groupId);
    io.to(msg.groupId).emit('join-group', msg.name + 'has joined the group');
  });

  socket.on('send-message', function(msg){
    //เก็บใส่แชทdb ละก้เอา chatId มา ส่งไปให้ client
    //Insert chatdb
    // var chat = {chatidจากdb,msg} ละก็ส่ง send-messageไปให้ทุกclient
    socket.broadcast.emit('deliver-message', msg);
  });

  socket.on('read-message', function(obj) {
    // obj ประกอบไปด้วย userId กับ chatId, groupId
    // ยัดใส่ว่า lastreadในgroup คือ chatไหน
  });

});

async function newUser(user) {
  client.db("Parallel").collection("Users").insertOne(user, function(err, res) {
    if (err) throw err;
    console.log("new user inserted");
  });
}

async function newGroup(group) {
  client.db("Parallel").collection("Groups").insertOne(group, function(err, res) {
    if (err) throw err;
    console.log("new group inserted");
  });
}
