var express = require('express')
var ObjectId = require('mongodb').ObjectID;
var MongoClient = require('mongodb').MongoClient
var path = require('path');
var walkins = require('./walkins');

//DB configuration
var dburl = require('../config/database.js');
var db;

MongoClient.connect(dburl.url, (err, database) => {
    if (err) return console.log(err)
    db = database
})

module.exports = function (app) {
    app.use(express.static('public'));
    app.use(express.static('logos'));
    app.use(express.static('node_modules'));

    //REST API
    app.use('/api/', walkins);
    app.get('/', (req, res) => {
        var host = req.headers.host;
        db.collection('walkins').find({}).sort({
            "date": -1
        }).limit(300).toArray((err, result) => {
            if (err) return console.log(err)
            result.forEach(function (walkin) {
                walkin.date = formatDate(new Date(walkin.date));
            })
            res.setHeader("Cache-Control", "public, max-age=21600, no-cache");
            res.setHeader("Expires", new Date(Date.now() + 21600000).toUTCString());
            res.render('home.ejs', {
                walkins: result,
                jobsType: 'Walkin Interviews',
                user: req.user
            })
        })
    })

    /* GET One Walkin with the provided ID */
    app.get('/walkin/:id/', function (req, res) {
        var host = req.headers.host;
        var id = req.params.id;
        if (id.indexOf('-') == -1) {
            db.collection('walkins').findOne({
                _id: ObjectId(id)
            }, function (err, result) {
                if (err) return console.log(err)
                if (result == null) {
                    res.redirect('/')
                } else {
                    result.date = formatDate(new Date(result.date));
                    res.setHeader("Cache-Control", "public, max-age=21600, no-cache");
                    res.setHeader("Expires", new Date(Date.now() + 21600000).toUTCString());
                    res.render('details.ejs', {
                        walkin: result,
                        user: req.user
                    })
                }
            });
        } else {
            db.collection('walkins').findOne({
                _id: id
            }, function (err, result) {
                if (err) return console.log(err)
                if (result == null) {
                    res.redirect('/')
                } else {
                    result.date = formatDate(new Date(result.date));
                    res.setHeader("Cache-Control", "public, max-age=21600, no-cache");
                    res.setHeader("Expires", new Date(Date.now() + 21600000).toUTCString());
                    res.render('details.ejs', {
                        walkin: result,
                        user: req.user
                    })
                }
            });
        }
    });

    app.get('/jobs/fresher/', (req, res) => {
        var host = req.headers.host;
        db.collection('walkins').find({
            $or: [{
                "experience": /^0/
            }, {
                "experience": /Fresher/
            }, {
                "experience": /Any/
            }]
        }).sort({
            "date": -1
        }).limit(300).toArray((err, result) => {
            if (err) return console.log(err)
            result.forEach(function (walkin) {
                walkin.date = formatDate(new Date(walkin.date));
            })
            res.setHeader("Cache-Control", "public, max-age=21600, no-cache");
            res.setHeader("Expires", new Date(Date.now() + 21600000).toUTCString());
            res.render('home.ejs', {
                walkins: result,
                jobsType: 'Walkins for freshers',
                user: req.user
            })
        })
    })

    app.get('/jobs/:location/', function (req, res) {
        var host = req.headers.host;

        //var id = req.params.id.substring(req.params.id.lastIndexOf('-') + 1);
        var location = req.params.location.toLowerCase();
        db.collection('walkins').find({
            location: new RegExp('.*' + location + '.*', 'i')
        }).sort({
            "date": -1
        }).limit(200).toArray((err, result) => {
            if (err) return console.log(err)
            result.forEach(function (walkin) {
                walkin.date = formatDate(new Date(walkin.date));
            })
            res.setHeader("Cache-Control", "public, max-age=21600, no-cache");
            res.setHeader("Expires", new Date(Date.now() + 21600000).toUTCString());
            res.render('home.ejs', {
                walkins: result,
                jobsType: 'Walkins in '+location,
                user: req.user
            })
        })
    });

    app.get('/fresherjobs/:location/', (req, res) => {
        var host = req.headers.host;
        var location = req.params.location.toLowerCase();
        db.collection('walkins').find({
            $and: [{
                $or: [{
                    "experience": /^0/
                }, {
                    "experience": /Fresher/
                }, {
                    "experience": /Any/
                }]
        }, {
            location: new RegExp('.*' + location + '.*', 'i')
        }]
        }).sort({
            "date": -1
        }).limit(300).toArray((err, result) => {
            if (err) return console.log(err)
            result.forEach(function (walkin) {
                walkin.date = formatDate(new Date(walkin.date));
            })
            res.setHeader("Cache-Control", "public, max-age=21600, no-cache");
            res.setHeader("Expires", new Date(Date.now() + 21600000).toUTCString());
            res.render('home.ejs', {
                walkins: result,
                user: req.user
            })
        })
    })

    

    app.get('/contact/', (req, res) => {
        var host = req.headers.host;
        res.render('contact.ejs', {
            user: req.user
        })
    })

    app.get('/about/', (req, res) => {
        var host = req.headers.host;
        res.render('about.ejs', {
            user: req.user
        })
    })

    app.get('/uploadChethan/', (req, res) => {
        var host = req.headers.host;
        res.render('uploadChethan.ejs');
    })

    app.get('/logos/:img/', function (req, res) {
        var host = req.headers.host;
        res.setHeader("Cache-Control", "public, max-age=21600, no-cache");
        res.setHeader("Expires", new Date(Date.now() + 21600000).toUTCString());
        res.sendFile(path.join(__dirname, '../logos', req.params.img));
    });

    app.get('/sitemap.xml', function (req, res) {
        var xml = '<?xml version="1.0" encoding="UTF-8"?>' +
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" ' +
            'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
            'xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">' +
            '<url>' +
            '<loc>http://www.walkinshub.com/</loc>' +
            '<changefreq>daily</changefreq>' +
            '</url>' +
            '<url>' +
            '<loc>http://www.walkinshub.com/contact</loc>' +
            '<changefreq>daily</changefreq>' +
            '</url>' +
            '<url>' +
            '<loc>http://www.walkinshub.com/about</loc>' +
            '<changefreq>daily</changefreq>' +
            '</url>' +
            '<url>' +
            '<loc>http://www.walkinshub.com/feedback</loc>' +
            '<changefreq>daily</changefreq>' +
            '</url>' +
            '<url>' +
            '<loc>http://www.walkinshub.com/jobs/hyderabad</loc>' +
            '<changefreq>daily</changefreq>' +
            '</url>' +
            '<url>' +
            '<loc>http://www.walkinshub.com/jobs/ahmedabad</loc>' +
            '<changefreq>daily</changefreq>' +
            '</url>' +
            '<url>' +
            '<loc>http://www.walkinshub.com/jobs/bangalore</loc>' +
            '<changefreq>daily</changefreq>' +
            '</url>' +
            '<url>' +
            '<loc>http://www.walkinshub.com/jobs/chandigarh</loc>' +
            '<changefreq>daily</changefreq>' +
            '</url>' +
            '<url>' +
            '<loc>http://www.walkinshub.com/jobs/chennai</loc>' +
            '<changefreq>daily</changefreq>' +
            '</url>' +
            '<url>' +
            '<loc>http://www.walkinshub.com/jobs/coimbatore</loc>' +
            '<changefreq>daily</changefreq>' +
            '</url>' +
            '<url>' +
            '<loc>http://www.walkinshub.com/jobs/delhi</loc>' +
            '<changefreq>daily</changefreq>' +
            '</url>' +
            '<url>' +
            '<loc>http://www.walkinshub.com/jobs/gurgaon</loc>' +
            '<changefreq>daily</changefreq>' +
            '</url>' +
            '<url>' +
            '<loc>http://www.walkinshub.com/jobs/jaipur</loc>' +
            '<changefreq>daily</changefreq>' +
            '</url>' +
            '<url>' +
            '<loc>http://www.walkinshub.com/jobs/kochi</loc>' +
            '<changefreq>daily</changefreq>' +
            '</url>' +
            '<url>' +
            '<loc>http://www.walkinshub.com/jobs/mumbai</loc>' +
            '<changefreq>daily</changefreq>' +
            '</url>' +
            '<url>' +
            '<loc>http://www.walkinshub.com/jobs/noida</loc>' +
            '<changefreq>daily</changefreq>' +
            '</url>' +
            '<url>' +
            '<loc>http://www.walkinshub.com/jobs/pune</loc>' +
            '<changefreq>daily</changefreq>' +
            '</url>' +
            '<url>' +
            '<loc>http://www.walkinshub.com/jobs/trichy</loc>' +
            '<changefreq>daily</changefreq>' +
            '</url>' +
            '<url>' +
            '<loc>http://www.walkinshub.com/jobs/trivandrum</loc>' +
            '<changefreq>daily</changefreq>' +
            '</url>' +
            '<url>' +
            '<loc>http://www.walkinshub.com/jobs/visakhapatnam</loc>' +
            '<changefreq>daily</changefreq>' +
            '</url>' +
            '<url>' +
            '<loc>http://www.walkinshub.com/jobs/fresher</loc>' +
            '<changefreq>daily</changefreq>' +
            '</url>' ;


        db.collection('walkins').find({}).toArray(function (err, walkins) {
            if (err) {
                res.send(err);
            } else {
                //res.json(walkins);
                walkins.forEach(function (walkin) {
                    //var companyName = walkin.company.replace(/[^a-zA-Z0-9_-]/g,'-');
                    xml += '<url><loc>http://www.walkinshub.com/walkin/' + walkin._id + '</loc><changefreq>daily</changefreq></url>';
                });
                xml += '</urlset>'
                setTimeout(function () {
                    res.header('Content-Type', 'application/xml');
                    res.send(xml);
                }, 2000);
            }
        });
    });

    app.get('/**', (req, res) => {
        res.redirect('/')
    })

    function formatDate(date) {
        var monthNames = [
          "Jan", "Feb", "Mar",
          "Apr", "May", "Jun", "Jul",
          "Aug", "Sep", "Oct",
          "Nov", "Dec"
        ];
        var day = date.getDate();
        var monthIndex = date.getMonth();
        var year = date.getFullYear();
        return day + '-' + monthNames[monthIndex] + '-' + year;
      }
}