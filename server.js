var express = require('express')
var app = express()
var MongoClient = require('mongodb').MongoClient
var ObjectId = require('mongodb').ObjectID;
var bodyParser = require('body-parser');
var compression = require('compression');
var passport = require('passport');
var minify = require('express-minify');
var mongoose = require('mongoose');
var flash    = require('connect-flash');

// configuration ===============================================================
mongoose.connect('mongodb://localhost:27017/jobu'); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

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

// required for passport
	//app.use(express.session({ secret: 'ilovetocode' })); // session secret
	app.use(passport.initialize());
	app.use(passport.session()); // persistent login sessions
	app.use(flash()); // use connect-flash for flash messages stored in session

app.get('/', (req, res) => {
    db.collection('walkins').find().sort({
        "date": -1
    }).limit(100).toArray((err, result) => {
        if (err) return console.log(err)
        res.render('home.ejs', {
            walkins: result
        })
    })
})

app.get('/home', (req, res) => {
    db.collection('walkins').find().sort({
        "date": -1
    }).limit(100).toArray((err, result) => {
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
    }).limit(100).toArray((err, result) => {
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
    }).limit(100).toArray((err, result) => {
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
    }).limit(100).toArray((err, result) => {
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
    }).limit(100).toArray((err, result) => {
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
    }).limit(100).toArray((err, result) => {
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


// =====================================
	// FACEBOOK ROUTES =====================
	// =====================================
	// route for facebook authentication and login
	app.get('/auth/facebook', passport.authenticate('facebook', { authType: 'rerequest', scope: ['public_profile,email'] }));

	// handle the callback after facebook has authenticated the user
	app.get('/auth/facebook/callback',
		passport.authenticate('facebook', {
			successRedirect : '/',
			failureRedirect : '/'
		}));

	// =====================================
	// LOGOUT ==============================
	// =====================================
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

  // route middleware to make sure
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
