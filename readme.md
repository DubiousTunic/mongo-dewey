<h2>clientside</h2>
make a div with id "dewey_classes". attach script classController to it.
<br>
<h2>serverside</h2>
class_module = require("./class_module");
bodyParser= require('body-parser'),
run the nodejs module on an express server with three routes, e.g.:

app.post("/add_class", [check("parent").trim().escape().isLength({max:256}), check("class").trim().escape().isLength({max : 256}).not().isEmpty(), check("decimal").trim().escape().isLength({max:333}).not().isEmpty()],
    function(req, res){
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }    
        
        class_module.add_class(req.body.parent, req.body.class, req.body.decimal);
})

app.get("/realtime_class/:str", [check("str").trim().escape().isLength({max:256}).not().isEmpty()], function(req,res){
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

