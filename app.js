//include plugins
var express = require('express');
var path = require('path');
var mongoose = require('mongoose');
var config = require('./config/database');
var bodyParser = require('body-parser');
var session = require('express-session');
var expressValidator = require('express-validator');

var fileUpload = require('express-fileupload');


//connect to MongoDB
mongoose.connect(config.database);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Connectioned to MongoDB!');
});

//init app
var app = express();

//view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//set public folder (satic files)
app.use(express.static(path.join(__dirname, '/public')));

//set global error var
app.locals.error = null;    //to avoid errorNotDefined error!

/* middleware for express file upload */
app.use(fileUpload());


//body parser middleware
//parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//express session middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
    //cookie: { secure: true }
  }));

//express validator middleware
app.use(expressValidator({
    errorFormatter: function(param, msg, value){
        var namespace = param.split('.')
        , root = namespace.shift()
        , formParam = root;

        while(namespace.length){
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param : formParam,
            msg : msg,
            value : value
        };
    },
    
    customValidators : {
        isImage: function(value, fileName){
            var extension = (path.extname(fileName)).toLowerCase();
            switch(extension){
                case '.jpg': return '.jpg';
                case '.jpeg': return '.jpeg';
                case '.png': return '.png';
                case '': return '.jpg';
                default: return false;
            }
        }
    }
}));



//express messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});




//set up routing
var pages = require('./routes/pages.js');
var adminPages = require('./routes/admin_pages.js');
var adminCategories = require('./routes/admin_categories.js');
var adminArticles = require('./routes/admin_articles.js');



app.use('/admin/pages', adminPages);    //check this first
app.use('/admin/categories', adminCategories);
app.use('/admin/articles', adminArticles);
app.use('/', pages);



//start server
var port = 3000;
app.listen(port, function(){
    console.log('Server started on port ' + port);
})