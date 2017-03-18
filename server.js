var express = require('express')
var app = express()
var MongoClient = require('mongodb').MongoClient
var ObjectId = require('mongodb').ObjectID;
var bodyParser = require('body-parser');
var compression = require('compression');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var minify = require('express-minify');


// load up the user model
//var User       = require('../app/models/user');
var db

var walkins = require('./routes/walkins');

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

app.get('/', (req, res) => {
    db.collection('walkins').find().sort({
        "date": -1
    }).toArray((err, result) => {
        if (err) return console.log(err)
        res.render('home.ejs', {
            walkins: result
        })
    })
})

app.get('/home', (req, res) => {
    db.collection('walkins').find().sort({
        "date": -1
    }).toArray((err, result) => {
        if (err) return console.log(err)
        res.render('home.ejs', {
            walkins: result
        })
    })
})

app.get('/fresherjobs', (req, res) => {
    db.collection('walkins').find({
        $or: [{
            "experience": /0/
        }, {
            "experience": /Fresher/
        }]
    }).sort({
        "date": -1
    }).toArray((err, result) => {
        if (err) return console.log(err)
        res.render('home.ejs', {
            walkins: result
        })
    })
})

app.get('/hyderabadjobs', (req, res) => {
    db.collection('walkins').find({
        $or: [{
            "location": /Hyderabad/
        }, {
            "location": /hyderabad/
        }]
    }).sort({
        "date": -1
    }).toArray((err, result) => {
        if (err) return console.log(err)
        res.render('home.ejs', {
            walkins: result
        })
    })
})

app.get('/bangalorejobs', (req, res) => {
    db.collection('walkins').find({
        $or: [{
            "location": /Bangalore/
        }, {
            "location": /bangalore/
        }]
    }).sort({
        "date": -1
    }).toArray((err, result) => {
        if (err) return console.log(err)
        res.render('home.ejs', {
            walkins: result
        })
    })
})

app.get('/chennaijobs', (req, res) => {
    db.collection('walkins').find({
        $or: [{
            "location": /Chennai/
        }, {
            "location": /chennai/
        }]
    }).sort({
        "date": -1
    }).toArray((err, result) => {
        if (err) return console.log(err)
        res.render('home.ejs', {
            walkins: result
        })
    })
})

app.get('/mumbaipunejobs', (req, res) => {
    db.collection('walkins').find({
        $or: [{
            "location": /Mumbai/
        }, {
            "location": /mumbai/
        }, {
            "location": /Pune/
        }, {
            "location": /pune/
        }]
    }).sort({
        "date": -1
    }).toArray((err, result) => {
        if (err) return console.log(err)
        res.render('home.ejs', {
            walkins: result
        })
    })
})

app.get('/tutorials', (req, res) => {
    db.collection('walkins').find().toArray((err, result) => {
        if (err) return console.log(err)
        res.render('tutorials.ejs', {
            walkins: result
        })
    })
})

app.get('/contact', (req, res) => {
    res.render('contact.ejs');
})

app.get('/about', (req, res) => {
    res.render('about.ejs');
})

app.get('/uploadChethan', (req, res) => {
    res.render('uploadChethan.ejs');
})

/* GET One Walkin with the provided ID */
app.get('/walkin/:id', function(req, res) {
    //var id = req.params.id.substring(req.params.id.lastIndexOf('-') + 1);
    var id = req.params.id;
    //console.log(id);
    db.collection('walkins').findOne({
        _id: ObjectId(id)
    }, function(err, result) {
        if (err) return console.log(err)
        if (result == null) {
          res.redirect('/')
        } else {
            res.render('details.ejs', {
                walkin: result
            })
        }
    });

});

app.post('/quotes', (req, res) => {
    db.collection('quotes').save(req.body, (err, result) => {
        if (err) return console.log(err)
        //console.log('saved to database')
        res.redirect('/')
    })
})

app.put('/quotes', (req, res) => {
    db.collection('quotes')
        .findOneAndUpdate({
            name: 'Yoda'
        }, {
            $set: {
                name: req.body.name,
                quote: req.body.quote
            }
        }, {
            sort: {
                _id: -1
            },
            upsert: true
        }, (err, result) => {
            if (err) return res.send(err)
            res.send(result)
        })
})

app.delete('/quotes', (req, res) => {
    db.collection('quotes').findOneAndDelete({
        name: req.body.name
    }, (err, result) => {
        if (err) return res.send(500, err)
        res.send('A darth vadar quote got deleted')
    })
})

// =====================================
// FACEBOOK ROUTES =====================
// =====================================
// route for facebook authentication and login
app.get('/auth/facebook', passport.authenticate('facebook', {
    scope: 'email'
}));

// handle the callback after facebook has authenticated the user
app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
        successRedirect: '/home',
        failureRedirect: '/'
    }));

// route for logging out
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

// used to serialize the user for the session
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

// used to deserialize the user
passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

// code for login (use('local-login', new LocalStategy))
// code for signup (use('local-signup', new LocalStategy))

// =========================================================================
// FACEBOOK ================================================================
// =========================================================================
passport.use(new FacebookStrategy({

        // pull in our app id and secret from our auth.js file
        clientID: '1646263562333117',
        clientSecret: '91de007328f4ccfd7807b2aa1ce11a56',
        callbackURL: 'http://localhost/auth/facebook/callback'

    },

    // facebook will send back the token and profile
    function(token, refreshToken, profile, done) {

        // asynchronous
        process.nextTick(function() {

            // find the user in the database based on their facebook id
            db.collection('fbusers').findOne({
                'facebook.id': profile.id
            }, function(err, user) {

                // if there is an error, stop everything and return that
                // ie an error connecting to the database
                if (err)
                    return done(err);

                // if the user is found, then log them in
                if (user) {
                    return done(null, user); // user found, return that user
                } else {
                    // if there is no user found with that facebook id, create them
                    var newUser = new User();

                    // set all of the facebook information in our user model
                    //newUser.facebook.id    = profile.id; // set the users facebook id
                    //newUser.facebook.token = token; // we will save the token that facebook provides to the user
                    //newUser.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName; // look at the passport user profile to see how names are returned
                    //newUser.facebook.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first

                    // save our user to the database
                    /*  newUser.save(function(err) {
                          if (err)
                              throw err;

                          // if successful, return the new user
                          return done(null, newUser);
                      });*/
                    //console.log(profile.id);
                }

            });
        });

    }));

app.use('/api/', walkins);
app.get('/**', (req, res) => {
    res.redirect('/')
})
