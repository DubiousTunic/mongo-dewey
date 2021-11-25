const ObjectId = require('mongodb').ObjectID;
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://root:root@cluster0.k4kb4.mongodb.net/Cluster0?retryWrites=true&w=majority";

module.exports = {
	add_class : function(cb){
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
	},
	expand_class : function(parent_id, cb){
		const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
	    client.connect(err => {       
	        const col = client.db("Cluster0").collection("dewey")

	        var parent = ""
	        try{ 
	            parent = ObjectId(parent_id);
	        }
	        catch{
	            parent = "null";
	        }

	        col.find({parent: parent}).toArray(function(err, result){
	            cb(null, {result : result});            
	        });
	    })
	}
	,
	realtime_class : function(str, cb){
		const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
	    client.connect(err => {    
	        const col = client.db("Cluster0").collection("dewey")

	        col.find({decimalStr : req.params.str}).toArray(function(err, result){
	            cb(null, {result : result});            
	        });
	    })
	}
}