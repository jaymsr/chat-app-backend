exports.newUser = async function(user) {
    user.currentGroup = []
    await client.db("Parallel").collection("Users").insertOne(user, function(err, res) {
      if (err) throw err;
      console.log("new user inserted");
    });
  }
  
exports.newGroup = async function(group, username) {
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
  exports.joinGroup = async function(groupId, username){
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
  exports.leaveGroup = async function(groupId, username){
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
  
  exports.exitChat = async function(groupId, username){
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
  
  exports.getUnread = async function(groupId, username){
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
  
  exports.insertChat = async function(groupId, username,msg){
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