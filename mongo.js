async function newUser(user) {
    user.currentGroup = []
    client.db("Parallel").collection("Users").insertOne(user, function(err, res) {
      if (err) throw err;
      console.log("new user inserted");
    });
  }
  
  async function newGroup(group, username) {
    group.chats = []
    group.members = [username]
    client.db("Parallel").collection("Groups").insertOne(group, function(err, res) {
      if (err) throw err;
      console.log("new group inserted");
    });
  }
  
  async function getMembership(username) {
    const groups = await client.db("Parallel").collection("Users").findOne({ username: username });
    return Object.keys(groups['groups']);
  }
  
  async function getAllGroups() {
    const groups = await client.db("Parallel").collection("Groups").find({}).toArray();
    return groups.map(value => value.groupId);
  }
  
  async function insertChat(groupId, username,msg){
    try{
      const find =await client.db("Parallel").collection("Groups").findOne({_id:groupId})
      
      chat = {
        "_id":ObjectId(),
        "user":username,
        "msg":msg,
      }
      client.db("Parallel").collection("Groups").updateOne({_id:groupId},{$push:{chats:chat}}, function(err, res) {
        if (err) throw err;
        console.log("chat inserted",res);
      });
    }catch(e){
      console.error(e)
    }
  }
  