<h2>clientside</h2>
make a div with id "dewey_classes". attach script classController to it.
<br>
<h2>serverside</h2>
class_module = require("./class_module");
bodyParser= require('body-parser'),
run the nodejs module on an express server with three routes, each one itself calling
class_module.add_class(req.body.parent, req.body.class, req.body.decimal);
<br>
class_module.realtime_class(req.params.str, function(err, result){
    res.json(result);
});
<br>
class_module.expand_class(req.params.parent, function(err, result){
    res.json(result);
});
    