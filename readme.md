<h2>clientside</h2>
make a div with id "dewey_classes". attach script classController to it.
<br>
<h2>serverside</h2>
```
class_module = require("./class_module");
bodyParser= require('body-parser'),
app.post("/add_class", function(req, res){        
        class_module.add_class(req.body.parent, req.body.class, req.body.decimal);
})

app.get("/realtime_class/:str", function(req,res){
    class_module.realtime_class(req.params.str, function(err, result){
        res.json(result);
    });
})

app.get("/expand_class/:parent", function(req,res){
    class_module.expand_class(req.params.parent, function(err, result){
        res.json(result);
    });
})
```

