var express = require('express');
var http = require('http');
var app = express();
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

}
main().catch(console.error);
