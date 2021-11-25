const serverPort = 3000,
    express = require("express"),
    app = express(),
    { check, validationResult } = require('express-validator'),
    he = require('he'),
    path = require('path'),
    bodyParser= require('body-parser'),
    neo4j = require('neo4j-driver'),
    driver = neo4j.driver("neo4j+s://5088dd94.databases.neo4j.io", neo4j.auth.basic("neo4j", "Ke9m0K0sXoX44BBDh79khii4fQL0C3ESPzTokeGjKuE"))
    ObjectId = require('mongodb').ObjectID;

const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://root:root@cluster0.k4kb4.mongodb.net/Cluster0?retryWrites=true&w=majority";

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }))

// Express Middleware for serving static files
app.use(express.static(path.join(__dirname, 'public')));

app.get("/index", function(req,res){

})

app.get("/torrents", function(req,res){
    
})

app.get("/classes", function(req,res){
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    //gets 5 most recent doc
    client.connect(err => {       
        const col = client.db("Cluster0").collection("dewey");
        col.find().toArray(function(err, docs){
            res.json({"dewey" : docs});
        });
    })
})

app.post("/add_class", [check("parent").trim().escape().isLength({max:256}), check("class").trim().escape().isLength({max : 256}).not().isEmpty(), check("decimal").trim().escape().isLength({max:333}).not().isEmpty()],
    function(req, res){
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }    
        const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        //gets 5 most recent doc

        console.log(req.body.parent, req.body.class, req.body.decimal);

        var parent = "";
        try{
            parent = ObjectId(req.body.parent);
        }
        catch{
            parent = "null"
        }
        client.connect(err => {       
            const col = client.db("Cluster0").collection("dewey")

            col.insertOne({parent: parent, decimal : parseFloat(req.body.decimal), decimalStr : req.body.decimal.toString(), class : req.body.class})
        })
})

app.get("/realtime_class/:str", [check("str").trim().escape().isLength({max:256}).not().isEmpty()], function(req,res){
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    client.connect(err => {    
        const col = client.db("Cluster0").collection("dewey")

        col.find({decimalStr : req.params.str}).toArray(function(err, result){
            res.json({result : result});            
        });
    })

})

app.get("/drop_class/:parent", [check("parent").trim().escape().isLength({max:256}).not().isEmpty()], function(req,res){
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    } 

    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    client.connect(err => {       
        const col = client.db("Cluster0").collection("dewey")

        var parent = ""
        try{ 
            parent = ObjectId(req.params.parent);
        }
        catch{
            parent = "null";
        }

        col.find({parent: parent}).toArray(function(err, result){
            res.json({result : result});            
        });
    })

})

//did i write this?

app.post("/upload", [check("primer_id").trim().escape().isLength({max: 256}), check("primer").not().isEmpty().trim().escape().isLength({max : 256}),check("authors").trim().escape(), check("classes").trim().escape().isLength({max: 256}), check("periodical").trim().escape().isLength({max:256}), check("volume").trim().escape().isLength({max:256}), check("pages").trim().escape().isLength({max:256})], function(req,res){
    upload(req.params.primer_id, req.params.primer, req.params.authors, req.params.classes, req.params.periodical, req.params.volume, req.params.pages, function(err, data){
        res.json(data)
    });
})

async function upload(primer_id, primer, authors, classes, periodical, volume, pages, cb){
    const session = driver.session()

    var author_names = [];

    var queryLine = primer_id ? "MERGE (primer:Primer {_id: $primer_id}) " : "MERGE (primer:Primer {name : $primer_name}) "

    try{
     const result = await session.run(
     queryLine + 
     'WITH primer ' + 
     'FOREACH (name IN $authors| ' + 
         'MERGE ({ name: name})-[:PENNED]->(primer)) ' +
     'WITH primer ' + 
     'FOREACH (class IN $classes| ' + 
        'MERGE ({name : class})-[:TAGS]->(primer) ' + 
     'WITH primer ' + 
     'MERGE (primer)<-[:PUBLISHES]-(periodical:Periodical) ' + 
     'RETURN primer ',
     {primer_id: primer_id, primer_name : primer, authors : author_names, classes: classes, periodical: periodical, volume: volume, pages:pages})
    }
    finally{
        await session.close()
        cb(null, result)
    }
}

app.post("/realtime_search", function(req,res){
    realtime_search(function(err, result){
        res.json(result);
    })
})

async function realtime_search(text, label){
    const session = driver.session()

    var queryLine;
    switch(label){
        case "Primer": 
            queryLine = "MATCH (p:Primer) WHERE p.name CONTAINS '" + text + "'}) "
            break;
        case "Author":
            queryLine = "MATCH (p:Author) WHERE p.name CONTAINS '" + text + "'}) "
            break;
        case "Class":
            queryLine = "MATCH (p:Class) WHERE p.name CONTAINS '" + text + "'}) "
            break;
        case "Periodical" :
            queryLine = "MATCH (p:Periodical) WHERE p.name CONTAINS '" + text + "'}) "
            break;
        case "Dewey" :
            queryLine = "MATCH (p:Dewey) WHERE p.decimal CONTAINS '" + text + "'}) "
            break;
    }

    var author_names = [];

    try{
     const result = await session.run(
        queryLine +
        'RETURN p')
    }
    finally{
        await session.close()
        cb(null, result)
    }
}

app.all("*", function(req,res){    
    res.sendFile(__dirname + '/public/views/index.html')
})

app.listen(serverPort);
