const {
    ObjectId
} = require("mongodb");

exports.newUser = async function (user, client) {
    user.currentGroupList = [];
    await client
        .db("Parallel")
        .collection("Users")
        .insertOne(user);
    console.log("new user inserted");
};

exports.newGroup = async function (group, client) {
    try {
        group._id = new ObjectId();
        group.chats = [];
        //insert group to db
        await client
            .db("Parallel")
            .collection("Groups")
            .insertOne(group);
        console.log("new group inserted");
        return group._id;
    } catch (e) {
        console.error(e);
    }
};

exports.joinGroup = async function (groupId, username, client) {
    try {
        //add group to user
        await client
            .db("Parallel")
            .collection("Users")
            .updateOne({
                username: username
            }, {
                $push: {
                    currentGroupList: ObjectId(groupId)
                }
            });
        console.log("Insert ", groupId, "to user", username);
    } catch (e) {
        console.error(e);
    }
};

exports.leaveGroup = async function (groupId, username, client) {
    try {
        //pull group from user
        await client
            .db("Parallel")
            .collection("Users")
            .updateOne({
                username: username
            }, {
                $pull: {
                    currentGroupList: ObjectId(groupId)
                }
            });
        console.log("Pull ", groupId, "from user", username);
    } catch (e) {
        console.error(e);
    }
};

exports.insertChat = async function (msg, client) {
    try {
        chat = {
            username: msg.username,
            text: msg.text,
            timestamp: msg.timestamp,
        };
        await client
            .db("Parallel")
            .collection("Groups")
            .updateOne({
                _id: ObjectId(msg.groupId)
            }, {
                $push: {
                    chats: chat
                }
            });
        console.log('chat inserted');
    } catch (e) {
        console.error(e);
    }
};

exports.getMembership = async function (username, client) {
    const user = await client
        .db("Parallel")
        .collection("Users")
        .findOne({
            username: username
        });
    console.log(user);
    console.log('getMembership');
    return user.currentGroupList;
};

exports.getAllChats = async function (client) {
    const groups = await client
        .db("Parallel")
        .collection("Groups")
        .find({})
        .toArray();
    allChats = {};
    groups.forEach((value) => {
        allChats[value._id] = value.chats;
    });
    console.log('getAllChats');
    return allChats;
};

exports.getAllGroups = async function (client) {
    const groups = await client
        .db("Parallel")
        .collection("Groups")
        .find({})
        .toArray();
    allGroups = {};
    groups.forEach((value) => {
        allGroups[value._id] = value.groupName;
    });
    console.log(allGroups);
    console.log('getAllGroups');
    return allGroups;
};

exports.checkUserExist = async function (username, client) {
    const user = await client
        .db("Parallel")
        .collection("Users")
        .findOne({
            username: username
        });
    console.log(!user);
    if (!user) return false;
    return true;
};