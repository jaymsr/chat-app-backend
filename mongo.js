exports.newUser = async function (user, client) {
    user.currentGroupList = [];
    await client
        .db("Parallel")
        .collection("Users")
        .insertOne(user, function (err, res) {
            if (err) throw err;
            console.log("new user inserted");
        });
};

exports.newGroup = async function (group, username, client) {
    try {
        group._id = ObjectId();
        group.chats = [];
        //insert group to db
        await client
            .db("Parallel")
            .collection("Groups")
            .insertOne(group, function (err, res) {
                if (err) throw err;
                console.log("new group inserted");
            });
        //join the first user
        await joinGroup(group._id, username, client);
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
            .updateOne(
                { username: username },
                { $push: { currentGroupList: groupId } },
                function (err, res) {
                    if (err) throw err;
                    console.log("Insert ", groupId, "to user", username);
                }
            );
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
            .updateOne(
                { username: username },
                { $pull: { currentGroupList: groupId } },
                function (err, res) {
                    if (err) throw err;
                    console.log("Pull ", groupId, "from user", username);
                }
            );
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
            .updateOne(
                { _id: msg.groupId },
                { $push: { chats: chat } },
                function (err, res) {
                    if (err) throw err;
                    console.log("chat inserted", res);
                }
            );
    } catch (e) {
        console.error(e);
    }
};

exports.getMembership = async function (username, client) {
    const user = await client
        .db("Parallel")
        .collection("Users")
        .findOne({ username: username });
    return user.currentGroupList;
};

exports.getAllChats = async function (client) {
    const groups = await client
        .db("Parallel")
        .collection("Groups")
        .find({})
        .toArray();
    console.log(groups);
    allChats = {};
    groups.forEach((value) => {
        allChats[value._id] = value.chats;
    });
    return allChats;
};

exports.getAllGroups = async function (client) {
    const groups = await client
        .db("Parallel")
        .collection("Groups")
        .find({})
        .toArray();
    return groups.map((value) => ({
        groupId: value._id,
        groupName: value.groupName,
    }));
};

exports.checkUserExist = async function (username, client) {
    const user = await client
        .db("Parallel")
        .collection("Users")
        .findOne({ username: username });
    if (!user) return false;
    return true;
};
