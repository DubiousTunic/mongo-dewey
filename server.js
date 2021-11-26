//TODO: SORT RESULTS IN DECIMAL ORDER

const serverPort = 3000,
    express = require("express"),
    app = express(),
    { check, validationResult } = require('express-validator'),
    he = require('he'),
    path = require('path'),
    bodyParser= require('body-parser'),
    neo4j = require('neo4j-driver'),
    driver = neo4j.driver("neo4j+s://5088dd94.databases.neo4j.io", neo4j.auth.basic("neo4j", "Ke9m0K0sXoX44BBDh79khii4fQL0C3ESPzTokeGjKuE"))
    class_module = require("./js/class_module");

const ObjectId = require('mongodb').ObjectID;

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }))

// Express Middleware for serving static files
app.use(express.static(path.join(__dirname, 'public')));

app.get("/index", function(req,res){

})

app.get("/torrents", function(req,res){
    
})

app.post("/add_class", [check("parent").trim().escape().isLength({max:256}), check("class").toLowerCase().trim().escape().isLength({max : 256}).not().isEmpty(), check("decimal").trim().escape().isLength({max:333}).not().isEmpty()],
    function(req, res){
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }    
        
        class_module.add_class(req.body.parent, req.body.decimal, req.body.class);
})

app.get("/realtime_class/:str", [check("str").toLowerCase().trim().escape().isLength({max:256}).not().isEmpty()], function(req,res){
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    class_module.realtime_class(req.params.str, function(err, result){
        res.json(result);
    });
})

app.get("/expand_class/:parent", [check("parent").trim().escape().isLength({max:256}).not().isEmpty()], function(req,res){
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    } 

    class_module.expand_class(req.params.parent, function(err, result){
        res.json(result);
    });
    
})

//did i write this?

app.post("/upload", [check("gazelle_id").trim().escape().isLength({max :256}), check("gazelle").trim().escape().isLength({max: 256}), check("scribes").not().isEmpty().trim().escape().isLength({max : 256}),check("class").trim().escape(), check("institution").trim().escape().isLength({max:256}), check("volume").trim().escape().isLength({max:256}), check("pages").trim().escape().isLength({max:256})], function(req,res){
    
    var gazelle_id;
    try{
        gazelle_id = ObjectId(gazelle_id);
    }
    catch{
        gazelle_id = null;
    }

    var institution_id;
    try{
        institution_id = ObjectId(institution_id);
    }
    catch{
        institution_id = null;
    }   

    var scribes = [];
    parseJSON(req.body.scribes).forEach(function(scribe){
        
        if(scribe.id){ 
            try{
                scribes.push(ObjectId(scribe.id))
            }
            catch{
                res.end();
            }    
        }
    })

    var params = {
        gazelle_id : gazelle_id,
        date : req.body.date,
        scribes : scribes,
        class : req.body.class,
        institution_id : institution_id,
    }

    upload_gazelle(req.params.gazelle_id, req.params.gazelle, req.params.scribes, req.params.claus, req.params.periodical, req.params.volume, req.params.pages, function(err, data){
        res.json(data)
    });
})

function upload_gazelle(gazelle_id, gazelle, date, scribes, claus, institution_id, institution, institution_date, volume, pages){

}

async function upload(primer_id, primer, scribes, classes, periodical, volume, pages, cb){
    const session = driver.session()

    var scribe_names = [];

    var queryLine = primer_id ? "MERGE (primer:Primer {_id: $primer_id}) " : "MERGE (primer:Primer {name : $primer_name}) "

    try{
     const result = await session.run(
     queryLine + 
     'WITH primer ' + 
     'FOREACH (name IN $scribes| ' + 
         'MERGE ({ name: name})-[:PENNED]->(primer)) ' +
     'WITH primer ' + 
     'FOREACH (class IN $classes| ' + 
        'MERGE ({name : class})-[:TAGS]->(primer) ' + 
     'WITH primer ' + 
     'MERGE (primer)<-[:PUBLISHES]-(periodical:Periodical) ' + 
     'RETURN primer ',
     {primer_id: primer_id, primer_name : primer, scribes : scribe_names, classes: classes, periodical: periodical, volume: volume, pages:pages})
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
        case "scribe":
            queryLine = "MATCH (p:scribe) WHERE p.name CONTAINS '" + text + "'}) "
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

    var scribe_names = [];

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
