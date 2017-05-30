var express = require('express')
var ObjectId = require('mongodb').ObjectID;
var MongoClient = require('mongodb').MongoClient
var path = require('path');
var walkins = require('./walkins');

//Prod
//var domainName = 'walkinshub.com';
//Dev
var domainName = 'localhost:8080';

//DB configuration
var dburl = require('../config/database.js');
var db;

MongoClient.connect(dburl.url, (err, database) => {
    if (err) return console.log(err)
    db = database
})

module.exports = function(app) {
    app.use(express.static('public'));
    app.use(express.static('logos'));
    app.use(express.static('node_modules'));

    //REST API
    app.use('/api/', walkins);

    app.get('/', (req, res) => {
        var host = req.headers.host;
        if (host.toLowerCase().indexOf(domainName) != -1) {
            db.collection('walkins').find({}).sort({
                "date": -1
            }).limit(300).toArray((err, result) => {
                if (err) return console.log(err)
                res.render('home.ejs', {
                    walkins: result,
                    jobsType: 'Walk-ins',
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
    app.get('/walkin/:id', function(req, res) {
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
            }).limit(300).toArray((err, result) => {
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

    app.get('/jobs/:location', function(req, res) {
        var host = req.headers.host;

        //var id = req.params.id.substring(req.params.id.lastIndexOf('-') + 1);
        if (host.toLowerCase().indexOf(domainName) != -1) {
            var location = req.params.location.toLowerCase();
            db.collection('walkins').find({
                location: new RegExp('^' + location + '$', 'i')
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

    app.get('/about', (req, res) => {
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

    app.get('/logos/:img', function(req, res) {
        var host = req.headers.host;
        if (host.toLowerCase().indexOf(domainName) != -1) {
            res.sendFile(path.join(__dirname, '../logos', req.params.img));
        } else {
            res.writeHead(301, {
                Location: 'http://www.walkinshub.com/'
            });
            res.end();
        }
    });

    app.get('/**', (req, res) => {
        res.redirect('/')
    })
}
