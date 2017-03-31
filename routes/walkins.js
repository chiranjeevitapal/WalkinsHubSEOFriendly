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

router.get('/walkinstoday', function(req, res,
    next) {
      var today = new Date();
      var todayDateString = today.yyyymmdd();
      db.collection('walkins').find({
          "date": { $regex : todayDateString }
      }).toArray(function(err, walkins) {
          var obj = [];

          if (err) {
              res.send(err);
          } else {
            res.json(walkins);
          }
    });
  });

  router.get('/similarjobs/:location', function(req, res,
      next) {
        db.collection('walkins').find({
          $or: [{
              "experience": /0/
          }, {
              "experience": /Fresher/
          }],
          $and: [{
              "location": {
                  $regex: req.params.location
              }
          }]
        }).sort({'date':-1}).toArray(function(err, walkins) {
            var obj = [];
            if (err) {
                res.send(err);
            } else {
              res.json(walkins);
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

        var today = new Date();
        var todayDateString = today.yyyymmdd();

    db.collection('walkins').find({
        "date": { $regex : todayDateString }
    }).toArray(function(err, walkins) {
        var obj = [];

        if (err) {
            res.send(err);
        } else {
            walkins.forEach(function(walkin) {
              html = html + '<tr><td style="border: 1px solid black;">' + walkin.company + '</td>' +
                  '<td style="border: 1px solid black;">' + walkin.title + '</td>' +
                  '<td style="border: 1px solid black;">' + walkin.experience + '</td>' +
                  '<td style="border: 1px solid black;">' + walkin.location + '</td>' +
                  '<td style="border: 1px solid black;"><a href="www.walkinshub.com/walkin/' + walkin._id + '"> Details </a></td></tr>';
            })
            html = html + '</tbody></table></body></html>'
            db.collection('users').find({}).toArray(function(err, subscriber) {
                if (err) {
                    res.send(err);
                } else {
                    subscriber.forEach(function(subscriber, i) {
                        setTimeout(function() {
                            if (subscriber.facebook.email != '' && subscriber.facebook.email != undefined && subscriber.facebook.email != null) {
                                mailSender.sendMail('"www.walkinshub.com" <walkinshubindia@gmail.com>', subscriber.facebook.email, 'Today Walkin Interviews', 'Here is th list of interviews that are posted on walkinshub.com today', html);
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
    db.collection('users').find({}).toArray(function(err, subscriber) {
        if (err) {
            res.send("failed");
        } else {
            subscriber.forEach(function(subscriber, i) {
                html = '';
                html = html + '<p>' + message + '</p>'
                setTimeout(function() {
                    if (subscriber.email != '' && subscriber.email != undefined && subscriber.email != null) {
                        mailSender.sendMail('"www.walkinshub.com" <walkinshubindia@gmail.com>', subscriber.email, 'Message from Walkinshub', '', html);
                    }
                }, (i + 1) * 5000);
            })
            res.json("success");
        }
    })
});

/* Get registered fb subscribers */
router.get('/subscribers', function(req, res,
    next) {
    db.collection('users').find({}).toArray(function(err, subscriber) {
        if (err) {
            res.send(err);
        } else {
            subscriber.forEach(function(subscriber) {
                console.log(subscriber.email);
            })
            res.json(subscriber);
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

router.post('/postWalkin', (req, res) => {
    var companyName = req.body.company.replace(/[^a-zA-Z0-9_-]+/g, '-');
    var today = new Date();
    var milli = today.getMilliseconds();
    var todayDateString = today.yyyymmdd();
    req.body._id = companyName+'-'+todayDateString+'-'+milli
    db.collection('walkins').save(req.body, (err, result) => {
        if (err) return console.log(err)
        //console.log('saved to database')
        //res.redirect('/')
        res.json(result);
    })
})

router.post('/postfeedback', (req, res) => {
    db.collection('feedback').save(req.body, (err, result) => {
        if (err) return console.log(err)
        //console.log('saved to database')
        //res.redirect('/')
        res.json(result);
    })
})

Date.prototype.yyyymmdd = function() {
    var mm = this.getMonth() + 1; // getMonth() is zero-based
    var dd = this.getDate();

    return [this.getFullYear(),
        (mm > 9 ? '' : '0') + mm,
        (dd > 9 ? '' : '0') + dd
    ].join('-');
};




module.exports = router;
