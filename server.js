var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://admin:parallel2020@cluster0-cegct.mongodb.net/test?retryWrites=true&w=majority";
const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});
var mongo = require('./mongo.js')
client.connect();

http.listen(3000, function(){
	console.log('Hello Parallel');
  	console.log('listening on *:3000');
});

app.get('/', function(req, res){
  //res.sendFile(__dirname + '/index.html');
  res.send('Project is running on port 3000');
});

app.get('/ChatRoom', async function(req, res) {
  const allGroups = await getAllGroups();
  res.send(allGroups);
});

io.on('connection', function(socket){

  socket.on('new-user', async function(username) {
    var user = {username:username};
    //if user not in db then create {
    await newUser(user);
    //}

    const allGroups = getAllGroups();
    socket.emit('all-group', allGroups);

    const userGroups = await getMembership(username);
    groups.forEach(groupId => {
      socket.join(groupId);
      socket.emit('join-group',groupId);
    });

    //get unread messages and emit

  });

  socket.on('new-group', async function(groupName) {
    var group = {name:groupName}
    var groupId = await newGroup(group);
    socket.join(groupId);
    var msg = {'groupId':groupId,'groupName':groupName};
    io.emit('new-group',msg);
    socket.emit('join-group',groupId);
  });

  socket.on('join-group', function(msg) {
    // msg : userId, groupId
    //if user not in group: 

    socket.join(msg.groupId);
    socket.broadcast.to(msg.groupId).emit('someone-join-group', msg.name);
  });

  socket.on('send-message', async function(msg){
    //msg มี text, groupId, username, timestamp
    //เก็บใส่db group ละก้เอา chatId มา ส่งไปให้ client
    //Insert chat in to group
    // var chat = {chatidจากdb,msg} ละก็ส่ง send-messageไปให้ทุกclientในgroup
    await insertChat(msg.groupId,msg.username,msg.text);
    socket.to(msg.groupId).broadcast.emit('deliver-message', msg);
  });

  socket.on('read-message', function(obj) {
    // obj ประกอบไปด้วย userId กับ chatId, groupId
    // ยัดใส่ว่า lastreadในgroup คือ chatไหน
    
  });

  socket.on('leave-group', async function(msg) {
    await leaveGroup(msg.username,msg.groupId);
  });

});