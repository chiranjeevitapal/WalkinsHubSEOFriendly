var express = require('express');
var router = express.Router();
var ObjectId = require('mongodb').ObjectID;
var cheerio = require('cheerio');
var request = require('request');
var fs = require('fs');
var todaywalkinsScraper = require('../utils/todaywalkinsScraper.js');
var prepareinterviewScraper = require('../utils/prepareinterviewScraper.js');
var dburl = require('../config/database.js');
var MongoClient = require('mongodb').MongoClient

var db
MongoClient.connect(dburl.url, (err, database) => {
    if (err) return console.log(err)
    db = database
})

router.get('/sitemap.xml', function(req, res) {
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
        '</url>' +
        '<url>' +
        '<loc>http://www.walkinshub.com/jobs/experienced</loc>' +
        '<changefreq>daily</changefreq>' +
        '</url>';


    db.collection('walkins').find({}).toArray(function(err, walkins) {
        if (err) {
            res.send(err);
        } else {
            //res.json(walkins);
            walkins.forEach(function(walkin) {
                //var companyName = walkin.company.replace(/[^a-zA-Z0-9_-]/g,'-');
                xml += '<url><loc>http://www.walkinshub.com/walkin/' + walkin._id + '</loc><changefreq>daily</changefreq></url>';
            });
            xml += '</urlset>'
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
        "date": {
            $regex: todayDateString
        }
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
    }).sort({
        'date': -1
    }).limit(10).toArray(function(err, walkins) {
        var obj = [];
        if (err) {
            res.send(err);
        } else {
            res.json(walkins);
        }
    });
});


//get all the latest urls from today walkins
router.get('/scrapeTodayUrls', function(req, res) {
    todaywalkinsScraper.scrapeTodayUrls(res);
})

router.get('/scrapeTodayUrls2', function(req, res) {
    prepareinterviewScraper.scrapeTodayUrls(res);
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

    if (website == 'prepareinterview') {
        prepareinterviewScraper.scrape(res, link);
        //console.log("scraped : "+link);
    }
})

router.post('/postWalkin', (req, res) => {
    var companyName = req.body.company.replace(/[^a-zA-Z0-9_-]+/g, '-');
    var title = req.body.title.replace(/[^a-zA-Z0-9_-]+/g, '-');
    var location = req.body.location.replace(/[^a-zA-Z0-9_-]+/g, '-');
    var today = new Date();
    var milli = today.getMilliseconds();
    var todayDateString = today.yyyymmdd();
    req.body._id = title + '-in-' + location + '-' + req.body.date.substring(0,10);
    db.collection('walkins').save(req.body, (err, result) => {
        if (err) return console.log(err)
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
