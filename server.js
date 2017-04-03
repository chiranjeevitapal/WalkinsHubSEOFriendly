var express = require('express')
var app = express()
var MongoClient = require('mongodb').MongoClient
var ObjectId = require('mongodb').ObjectID;
var bodyParser = require('body-parser');
var compression = require('compression');
var passport = require('passport');
var minify = require('express-minify');
var mongoose = require('mongoose');
var flash = require('connect-flash');
var mcache = require('memory-cache');

// configuration ===============================================================
mongoose.connect('mongodb://localhost:27017/jobu'); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

// load up the user model
//var User       = require('../app/models/user');
var db

var walkins = require('./routes/walkins');
var domainName = 'walkinshub.com';

MongoClient.connect('mongodb://localhost:27017/jobu', (err, database) => {
    if (err) return console.log(err)
    db = database
    app.listen(process.env.PORT || 80, () => {
        console.log('listening on 80')
    })
})

// compress all responses
app.use(compression());
app.use(minify());
app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(bodyParser.json())
app.use(express.static('public'))
app.use(express.static('node_modules'))
var session = require('express-session');
// required for passport
//app.use(express.session({ secret: 'ilovetocode' })); // session secret
app.use(session({
    secret: 'ilovetocode'
})); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

var cache = (duration) => {
    return (req, res, next) => {
        var key = '__express__' + req.originalUrl || req.url
        var cachedBody = mcache.get(key)
        if (cachedBody) {
            res.send(cachedBody)
            return
        } else {
            res.sendResponse = res.send
            res.send = (body) => {
                mcache.put(key, body, duration * 8000000);
                res.sendResponse(body)
            }
            next()
        }
    }
}

//app.get('/', cache(10), (req, res) => {
app.get('/', (req, res) => {
    var host = req.headers.host;
    console.log(host);
    if (host.toLowerCase().indexOf(domainName) != -1) {
        db.collection('walkins').find({
            $or: [{
                "experience": /0/
            }, {
                "experience": /Fresher/
            }],
        }).sort({
            "date": -1
        }).limit(100).toArray((err, result) => {
            if (err) return console.log(err)
            res.render('home.ejs', {
                walkins: result,
                user: req.user
            })
        })
    } else {
        res.writeHead(301, {
            Location: 'http://www.walkinshub.com/'
        });
        res.end();
    }
})

/* GET One Walkin with the provided ID */
app.get('/walkins/:location', function(req, res) {
    var host = req.headers.host;
    console.log(host);
    //var id = req.params.id.substring(req.params.id.lastIndexOf('-') + 1);
    if (host.toLowerCase().indexOf(domainName) != -1) {
        var location = req.params.location;
        db.collection('walkins').find({
            $or: [{
                "experience": /0/
            }, {
                "experience": /Fresher/
            }],
            $and: [{
                "location": {
                    $regex: location
                }
            }]
        }).sort({
            "date": -1
        }).limit(100).toArray((err, result) => {
            if (err) return console.log(err)
            res.render('home.ejs', {
                walkins: result,
                user: req.user
            })
        })
    } else {
        res.status(400);
        res.send(domainName);
    }
});

app.get('/contact', (req, res) => {
    var host = req.headers.host;
    console.log(host);
    if (host.toLowerCase().indexOf(domainName) != -1) {
        res.render('contact.ejs', {
            user: req.user
        })
    } else {
        res.status(400);
        res.send(domainName);
    }
})

app.get('/about', (req, res) => {
    var host = req.headers.host;
    console.log(host);
    if (host.toLowerCase().indexOf(domainName) != -1) {
        res.render('about.ejs', {
            user: req.user
        })
    } else {
        res.status(400);
        res.send(domainName);
    }
})

app.get('/feedback', (req, res) => {
    var host = req.headers.host;
    console.log(host);
    if (host.toLowerCase().indexOf(domainName) != -1) {
        res.render('feedback.ejs', {
            user: req.user
        })
    } else {
        res.status(400);
        res.send(domainName);
    }
})

app.get('/uploadChethan', (req, res) => {
    var host = req.headers.host;
    console.log(host);
    if (host.toLowerCase().indexOf(domainName) != -1) {
        res.render('uploadChethan.ejs');
    } else {
        res.status(400);
        res.send(domainName);
    }
})

/* GET One Walkin with the provided ID */
app.get('/walkin/:id', function(req, res) {
    var host = req.headers.host;
    console.log(host);
    if (host.toLowerCase().indexOf(domainName) != -1) {
        //var id = req.params.id.substring(req.params.id.lastIndexOf('-') + 1);
        var id = req.params.id;
        //console.log(id);
        if (id.indexOf('-') == -1) {
            db.collection('walkins').findOne({
                _id: ObjectId(id)
            }, function(err, result) {
                if (err) return console.log(err)
                if (result == null) {
                    res.redirect('/')
                } else {
                    res.render('details.ejs', {
                        walkin: result,
                        user: req.user
                    })
                }
            });
        } else {
            db.collection('walkins').findOne({
                _id: id
            }, function(err, result) {
                if (err) return console.log(err)
                if (result == null) {
                    res.redirect('/')
                } else {
                    res.render('details.ejs', {
                        walkin: result,
                        user: req.user
                    })
                }
            });
        }
    } else {
        res.status(400);
        res.send(domainName);
    }

});


// =====================================
// FACEBOOK ROUTES =====================
// =====================================
// route for facebook authentication and login
app.get('/auth/facebook', passport.authenticate('facebook', {
    authType: 'rerequest',
    scope: ['public_profile,email']
}));

// handle the callback after facebook has authenticated the user
app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
        successRedirect: '/',
        failureRedirect: '/'
    }));

// =====================================
// LOGOUT ==============================
// =====================================
app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}


app.use('/api/', walkins);
app.get('/**', (req, res) => {
    res.redirect('/')
})
