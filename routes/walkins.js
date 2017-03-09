var express = require('express');
var router = express.Router();
var ObjectId = require('mongodb').ObjectID;
var cheerio = require('cheerio');
var request = require('request');
var fs = require('fs');
var todaywalkinsScraper = require('../utils/todaywalkinsScraper.js');
var mailSender = require('../utils/mailSender.js');
var capture = require('../utils/capture.js');
var passport = require('passport');
var MongoClient = require('mongodb').MongoClient

var db
MongoClient.connect('mongodb://localhost:27017/jobu', (err, database) => {
    if (err) return console.log(err)
    db = database
})

router.get('/sitemap.xml', function(req, res) {
    var xml = '<?xml version="1.0" encoding="UTF-8"?>' +
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" ' +
        'xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" ' +
        'xmlns:xhtml="http://www.w3.org/1999/xhtml" ' +
        'xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0" ' +
        'xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" ' +
        'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
        'xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">';


    db.collection('walkins').find({}).toArray(function(err, walkins) {
        if (err) {
            res.send(err);
        } else {
            //res.json(walkins);
            walkins.forEach(function(walkin) {
                //var companyName = walkin.company.replace(/[^a-zA-Z0-9_-]/g,'-');
                xml += '<url><loc>http://www.walkinshub.com/walkin/' + walkin._id + '</loc><changefreq>daily</changefreq></url>';
            });
            xml += '<url><loc>http://www.walkinshub.com/contact/</loc><changefreq>daily</changefreq></url>' +
                '<url><loc>http://www.walkinshub.com/</loc><changefreq>daily</changefreq></url></urlset>'
            setTimeout(function() {
                res.header('Content-Type', 'application/xml');
                res.send(xml);
            }, 2000);
        }
    });
});

/* Push notifications to registered fb subscribers */
router.get('/notifyfbsubscribers', function(req, res,
    next) {

    var html = '<html> <head></head><body><table style="border: 1px solid black;">' +
        '<thead>' +
        '<tr><th style="border: 1px solid black;">Company</th>' +
        '<th style="border: 1px solid black;">Role</th>' +
        '<th style="border: 1px solid black;">Experience</th>' +
        '<th style="border: 1px solid black;">Location</th>' +
        '<th style="border: 1px solid black;">Details</th>' +
        '</tr>' +
        '</thead>' +
        '<tbody>';

    collection.find({}).toArray(function(err, walkins) {
        var obj = [];
        var today = new Date();
        var todayDateString = today.yyyymmdd();
        if (err) {
            res.send(err);
        } else {
            walkins.forEach(function(walkin) {
                if (todayDateString == walkin.date.substring(0, walkin.date.indexOf('T'))) {
                    //obj.push(walkin);
                    //var companyName = walkin.company.replace(/[^a-zA-Z0-9_-]/g,'-');
                    html = html + '<tr><td style="border: 1px solid black;">' + walkin.company + '</td>' +
                        '<td style="border: 1px solid black;">' + walkin.title + '</td>' +
                        '<td style="border: 1px solid black;">' + walkin.experience + '</td>' +
                        '<td style="border: 1px solid black;">' + walkin.location + '</td>' +
                        '<td style="border: 1px solid black;"><a href="www.walkinshub.com/walkin/' + walkin._id + '"> Details </a></td></tr>';
                }
            })
            html = html + '</tbody></table></body></html>'
            db.collection('fbusers').find({}).toArray(function(err, fbsubscribers) {
                if (err) {
                    res.send(err);
                } else {
                    fbsubscribers.forEach(function(subscriber, i) {
                        setTimeout(function() {
                            if (subscriber.fb_email != '' && subscriber.fb_email != undefined && subscriber.fb_email != null) {
                                mailSender.sendMail('"www.walkinshub.com" <walkinshubindia@gmail.com>', subscriber.fb_email, 'Today Walkin Interviews', 'Here is th list of interviews that are posted on walkinshub.com today', html);
                            }
                        }, (i + 1) * 5000);
                    })
                }
            })
            res.json("Emails triggered.");
        }
    });
});

//send a buld email toall subscribers
router.post('/bulkmailer', function(req, res, next) {
    var message = req.body.message;
    var html = '';
    db.collection('fbusers').find({}).toArray(function(err, fbsubscribers) {
        if (err) {
            res.send("failed");
        } else {
            fbsubscribers.forEach(function(subscriber, i) {
                html = '';
                html = html + '<p>' + message + '</p>'
                setTimeout(function() {
                    if (subscriber.fb_email != '' && subscriber.fb_email != undefined && subscriber.fb_email != null) {
                        mailSender.sendMail('"www.walkinshub.com" <walkinshubindia@gmail.com>', subscriber.fb_email, 'Message from Walkinshub', '', html);
                    }
                }, (i + 1) * 5000);
            })
            res.json("success");
        }
    })
});

/* Get registered fb subscribers */
router.get('/fbsubscribers', function(req, res,
    next) {
    db.collection('fbusers').find({}).toArray(function(err, fbsubscribers) {
        if (err) {
            res.send(err);
        } else {
            fbsubscribers.forEach(function(subscriber) {
                console.log(subscriber.fb_email);
            })
            res.json(fbsubscribers);
        }
    });
});


//get all the latest urls from today walkins
router.get('/scrapeTodayUrls', function(req, res) {
    todaywalkinsScraper.scrapeTodayUrls(res);
})

//scrape each url from today walkins
router.get('/scrape/:website/:link', function(req, res) {
    var website = req.params.website;
    var link = req.params.link;
    //console.log(website + " / "+ link );
    if (website == 'todaywalkins') {
        todaywalkinsScraper.scrape(res, link);
        //console.log("scraped : "+link);
    }
})

//upload each walkin to DB
/*router.post('/postWalkin', function(req, res, next) {
    var walkin = req.body.walkin;
    console.log(walkin);
    db.collection('walkins').insert(walkin,
        function(error, record) {
            if (error) {
                res.json(error);
            } else {
                res.json(record);
            }
        });
});*/

router.post('/postWalkin', (req, res) => {
    db.collection('walkins').save(req.body, (err, result) => {
        if (err) return console.log(err)
        console.log('saved to database')
        //res.redirect('/')
        res.json(result);
    })
})







module.exports = router;
