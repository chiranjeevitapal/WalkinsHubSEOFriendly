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
var multer = require('multer');
var path = require('path');
var storage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, '../resumes');
    },
    filename: function(req, file, callback) {
        callback(null, req.user.facebook.id + '.docx');
    }
});
var upload = multer({
    storage: storage,
    fileFilter: function(req, file, callback) {
        var ext = path.extname(file.originalname);
        if (ext !== '.doc' && ext !== '.docx') {
            return callback(new Error('Only doc/docx files are allowed.'))
        }
        callback(null, true)
    },
    limits: {
        fileSize: 50 * 1024, //50Kb
        files: 1
    }
}).single('resume');



// configuration ===============================================================
mongoose.connect('mongodb://localhost:27017/jobu'); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

// load up the user model
//var User       = require('../app/models/user');
var db

var walkins = require('./routes/walkins');
//Prod
var domainName = 'walkinshub.com';
//Dev
//var domainName = 'localhost:8080';

MongoClient.connect('mongodb://localhost:27017/jobu', (err, database) => {
    if (err) return console.log(err)
    db = database
    /*app.listen(process.env.PORT || 8080, () => {
        console.log('listening on 8080')
    })*/
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

app.get('/', cache(10), (req, res) => {
//app.get('/', (req, res) => {
    var host = req.headers.host;

    if (host.toLowerCase().indexOf(domainName) != -1) {
        db.collection('walkins').find({}).sort({
            "date": -1
        }).limit(200).toArray((err, result) => {
            if (err) return console.log(err)
            res.render('home.ejs', {
                walkins: result,
                jobsType: 'Walk-in Interviews',
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
app.get('/walkin/:id', cache(10), (req, res) => {
//app.get('/walkin/:id', function(req, res) {
    var host = req.headers.host;

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
        res.writeHead(301, {
            Location: 'http://www.walkinshub.com/'
        });
        res.end();
    }
});

app.post('/api/resume', function(req, res) {
    upload(req, res, function(err) {
        if (err) {
            return res.end('' + err);
        } {
            db.collection('users').update({
                _id: ObjectId(req.user.id)
            }, {
                $set: {
                    resume: req.user.facebook.id + '.docx'
                }
            }, function(err, result) {
                if (err)
                    return res.end('' + err);
                res.end("File is uploaded");
            });
        }

    });
});

app.get('/download/:id', function(req, res) {
    var file = '../resumes/' + req.params.id;
    res.download(file); // Set disposition and send it.
});

//app.get('/jobs/fresher', cache(10), (req, res) => {
app.get('/jobs/fresher', (req, res) => {
    var host = req.headers.host;
    if (host.toLowerCase().indexOf(domainName) != -1) {
        db.collection('walkins').find({
            $or: [{
                "experience": /0 -/
            }, {
                "experience": /Fresher/
            }]
        }).sort({
            "date": -1
        }).limit(200).toArray((err, result) => {
            if (err) return console.log(err)
            res.render('home.ejs', {
                walkins: result,
                jobsType: 'Fresher Jobs',
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

//app.get('/jobs/experienced', cache(10), (req, res) => {
app.get('/jobs/experienced', (req, res) => {
    var host = req.headers.host;
    if (host.toLowerCase().indexOf(domainName) != -1) {
        db.collection('walkins').find({
            $and: [{
                "experience": {
                    $not: /0 -/
                }
            }, {
                "experience": {
                    $not: /Fresher/
                }
            }]
        }).sort({
            "date": -1
        }).limit(200).toArray((err, result) => {
            if (err) return console.log(err)
            res.render('home.ejs', {
                walkins: result,
                jobsType: 'Experienced Jobs',
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
app.get('/jobs/:location', cache(10), (req, res) => {
//app.get('/jobs/:location', function(req, res) {
    var host = req.headers.host;

    //var id = req.params.id.substring(req.params.id.lastIndexOf('-') + 1);
    if (host.toLowerCase().indexOf(domainName) != -1) {
        var location = req.params.location.toLowerCase();
        db.collection('walkins').find({
            location: new RegExp('^' +location + '$', 'i')
        }).sort({
            "date": -1
        }).limit(200).toArray((err, result) => {
            if (err) return console.log(err)
            res.render('home.ejs', {
                walkins: result,
                jobsType: location + ' Jobs',
                user: req.user
            })
        })
    } else {
        res.writeHead(301, {
            Location: 'http://www.walkinshub.com/'
        });
        res.end();
    }
});

app.get('/contact', (req, res) => {
    var host = req.headers.host;

    if (host.toLowerCase().indexOf(domainName) != -1) {
        res.render('contact.ejs', {
            user: req.user
        })
    } else {
        res.writeHead(301, {
            Location: 'http://www.walkinshub.com/'
        });
        res.end();
    }
})

app.get('/about', cache(10), (req, res) => {
//app.get('/about', (req, res) => {
    var host = req.headers.host;

    if (host.toLowerCase().indexOf(domainName) != -1) {
        res.render('about.ejs', {
            user: req.user
        })
    } else {
        res.writeHead(301, {
            Location: 'http://www.walkinshub.com/'
        });
        res.end();
    }
})

app.get('/feedback', (req, res) => {
    var host = req.headers.host;

    if (host.toLowerCase().indexOf(domainName) != -1) {
        res.render('feedback.ejs', {
            user: req.user
        })
    } else {
        res.writeHead(301, {
            Location: 'http://www.walkinshub.com/'
        });
        res.end();
    }
})

app.get('/profile', (req, res) => {
    var host = req.headers.host;


    if (host.toLowerCase().indexOf(domainName) != -1) {
        if (req.user != undefined) {
            res.render('profile.ejs', {
                user: req.user
            })
        } else {
            res.redirect('/');
        }
    } else {
        res.writeHead(301, {
            Location: 'http://www.walkinshub.com/'
        });
        res.end();
    }
})

app.get('/uploadChethan', (req, res) => {
    var host = req.headers.host;

    if (host.toLowerCase().indexOf(domainName) != -1) {
        res.render('uploadChethan.ejs');
    } else {
        res.writeHead(301, {
            Location: 'http://www.walkinshub.com/'
        });
        res.end();
    }
})



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
        successRedirect: '/profile',
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
