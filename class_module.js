const ObjectId = require('mongodb').ObjectID;
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://root:root@cluster0.k4kb4.mongodb.net/Cluster0?retryWrites=true&w=majority";

module.exports = {
	add_class : function(parent_id, decimal, claus){
		const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        //gets 5 most recent doc

        console.log(decimal);

        var parent = "";
        try{
            parent = ObjectId(parent_id);
        }
        catch{
            parent = "null"
        }
        client.connect(err => {       
            const col = client.db("Cluster0").collection("dewey")

            col.insertOne({parent: parent, decimal : parseFloat(decimal), decimalStr : decimal.toString(), class : claus})
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

	        col.find({parent: parent}).sort({decimal : 1}).toArray(function(err, result){
	            cb(null, {result : result});            
	        });
	    })
	}
	,
	realtime_class : function(str, cb){
		const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
	    client.connect(err => {    
	        const col = client.db("Cluster0").collection("dewey")

	        if(isFloat(parseFloat(str)) || Number.isInteger(parseInt(str))){
	        	var param = { decimalStr : str};
	        }
	        else{
	        	var param = { $text : {$search : str} }
	        }

	        col.find(param).toArray(function(err, result){
	            cb(null, {result : result});            
	        });
	    })
	}
}

function isFloat(n){
    return Number(n) === n && n % 1 !== 0;
}