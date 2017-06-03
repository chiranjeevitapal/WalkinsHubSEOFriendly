var express = require('express')
var app = express()
var bodyParser = require('body-parser');
var compression = require('compression');
var minify = require('express-minify');
var expressStaticGzip = require('express-static-gzip');
var MongoClient = require('mongodb').MongoClient

// compress all responses
app.use(compression());
app.use(minify());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(express.methodOverride());

//routes
require('./routes/url-router')(app);

/*app.listen(process.env.PORT || 8080, () => {
    console.log('listening on 8080')
})*/

app.listen(process.env.PORT || 80, () => {
    console.log('listening on 80')
})

exports = module.exports = app;
