var express = require("express");
var app = express();
var http = require("http").createServer(app);
var io = require("socket.io")(http);
const MongoClient = require("mongodb").MongoClient;
const uri =
    "mongodb+srv://admin:parallel2020@cluster0-cegct.mongodb.net/test?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
var mongo = require("./mongo.js");
client.connect();

http.listen(8000, function () {
    console.log("Hello Parallel");
    console.log("listening on *:8000");
});

app.get("/", function (req, res) {
    //res.sendFile(__dirname + '/index.html');
    // res.send("Project is running on port 3000");
});

app.get("/ChatRoom", async function (req, res) {
    //lol
});

io.on("connection", function (socket) {
    socket.on("new-user", async function (username) {
        var user = {
            username: username,
        };

        if (!(await mongo.checkUserExist(username, client))) {
            console.log('new user');
            await mongo.newUser(user, client);
        }
        const allGroups = await mongo.getAllGroups(client);
        socket.emit("all-group", allGroups);

        const userGroups = await mongo.getMembership(username, client);
        socket.emit("join-group", userGroups);

        const allChats = await mongo.getAllChats(client);
        socket.emit("all-chat", allChats);
    });

    socket.on("new-group", async function (msg) {
        console.log(msg);
        var {
            username,
            groupname
        } = msg;
        var group = {
            groupName: groupname
        };
        console.log(group);
        const groupId = await mongo.newGroup(group, client);
        const allGroups = await mongo.getAllGroups(client);
        io.emit("all-group", allGroups);
        await mongo.joinGroup(groupId, username, client);
        const userGroups = await mongo.getMembership(username, client);
        socket.emit("join-group", userGroups);
    });

    socket.on("join-group", async function (msg) {
        var {
            groupId,
            username
        } = msg;
        await mongo.joinGroup(groupId, username, client);
        const userGroups = await mongo.getMembership(username, client);
        socket.emit("join-group", userGroups);
    });

    socket.on("leave-group", async function (msg) {
        var {
            username,
            groupId
        } = msg;
        await mongo.leaveGroup(groupId, username, client);
        const userGroups = await mongo.getMembership(username, client);
        socket.emit("join-group", userGroups);
    });

    socket.on("send-message", async function (msg) {
        console.log(msg);
        await mongo.insertChat(msg, client);
        const allChats = await mongo.getAllChats(client);
        io.emit("all-chat", allChats);
    });
});