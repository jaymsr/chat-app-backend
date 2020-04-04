var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://admin:parallel2020@cluster0-cegct.mongodb.net/test?retryWrites=true&w=majority";
const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});
client.connect();

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
  user.currentGroup = []
  await client.db("Parallel").collection("Users").insertOne(user, function(err, res) {
    if (err) throw err;
    console.log("new user inserted");
  });
}

async function newGroup(group, username) {
  try{
    group._id = ObjectId()
    group.chats = []
    group.members = []
    group.seq = 0
    group.history = []
    //insert group to db
    await client.db("Parallel").collection("Groups").insertOne(group, function(err, res) {
      if (err) throw err;
      console.log("new group inserted");
    });
    //join the first user
    joinGroup(group._id, username)
  }catch(e){
    console.error(e)
  }

}
async function joinGroup(groupId, username){
  //add user to group
  try{
    user_history = {
      "username":username,
      "index":0
    }
    await client.db("Parallel").collection("Groups").updateOne({_id:groupId},{$push:{members:user}, $push:{history:user_history}}, function(err,res){
      if(err) throw err;
      console.log("Insert ", username, "to group", groupId)
    })
    //add group to user
    await client.db("Parallel").collection("User").updateOne({username:username},{$push:{currentGroup:groupId}}, function(err,res){
      if(err) throw err;
      console.log("Insert ", groupId, "to user", username)
    })
  }catch(e){
    console.error(e)
  } 
}
async function leaveGroup(groupId, username){
  //pull user from group
  try{
    await client.db("Parallel").collection("Groups").updateOne({_id:groupId},{$pull:{members:user}}, function(err,res){
      if(err) throw err;
      console.log("Pull ", username, "from group", groupId)
    })
    //pull group from user
    await client.db("Parallel").collection("User").updateOne({username:username},{$pull:{currentGroup:groupId}}, function(err,res){
      if(err) throw err;
      console.log("Pull ", groupId, "from user", username)
    })
  }catch(e){
    console.error(e)
  }
}

async function exitChat(groupId, username){
  try{
    //save user chat history
    find = await client.db("Parallel").collection("Groups").findOne({_id:groupId})
    indexnow = find.history.length-1
    await client.db("Parallel").collection("Groups").updateOne(
      {_id:groupId, "history.username":username},
      {$set:{"history.$.index":indexnow}}
    )
  }catch(e){
    console.error(e)
  }
}

async function getUnread(groupId, username){
  try{
    //get unread from history
    //find user history
    user = await client.db("Parallel").collection("Groups").findOne({_id:groupId}, function(err,res){
      if(err) throw err;
    })
    chat_index = -1
    history = user.history
    for(var i; i< history.length;i++){
      if(history[i].username == username){
        chat_index = history[i].index
      }
    }
    if(chat_index==-1){
      console.log('no history')
      return null
    }else{
      return chat_index
    }


  }catch(e){
    console.error(e)
  }
}

async function insertChat(groupId, username,msg){
  try{
    const find =await client.db("Parallel").collection("Groups").findOne({_id:groupId})
    
    chat = {
      "_id":ObjectId(),
      "user":username,
      "msg":msg,
    }
    await client.db("Parallel").collection("Groups").updateOne({_id:groupId},{$push:{chats:chat}}, function(err, res) {
      if (err) throw err;
      console.log("chat inserted",res);
    });
  }catch(e){
    console.error(e)
  }
}