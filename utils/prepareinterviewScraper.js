var request = require('request');
var cheerio = require('cheerio');

function scrapeTodayUrls(res) {
    var urlsArray = [];
    url = 'http://www.prepareinterview.com/';
    request(url, function(error, response, html) {
        if (error) {
            res.send(error);
        } else {

            var today = new Date();
            var dd = today.getDate();
            var mm = today.getMonth() + 1; //January is 0!
            var yyyy = today.getFullYear();
            if (dd < 10) {
                dd = '0' + dd;
            }
            if (mm < 10) {
                mm = '0' + mm;
            }
            var today = yyyy + '-' + mm + '-' + dd;
            //console.log(today);

            var $ = cheerio.load(html);

            $('.date-posts').filter(function() {
                $(".post-outer").each(function() {
                    var url = $(this).find('.timestamp-link').attr('href')
                    var dateTime = $(this).find('.published').attr('title');
                    var date = dateTime.substring(0, dateTime.indexOf('T'));
                    if (today == date) {
                        url = url.substring(url.indexOf('.com/') + 5, url.indexOf('.html'));
                        url = url.substring(url.indexOf(mm) + 3);
                        urlsArray.push(url.trim());
                    }
                })
            });
            res.json(urlsArray);
        }
    });
}

function scrape(res, link) {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!
    var yyyy = today.getFullYear();
    if (dd < 10) {
        dd = '0' + dd;
    }
    if (mm < 10) {
        mm = '0' + mm;
    }
    var today = yyyy + '-' + mm + '-' + dd;
    url = 'http://www.prepareinterview.com/' + yyyy + '/' + mm + '/' + link + '.html';
    request(url, function(error, response, html) {
        if (error) {
            res.send(error);
        } else {
            var regex = /<br\s*[\/]?>/gi;
            html = html.replace(regex, "\n");
            var $ = cheerio.load(html);
            var walkin = {
                title: "",
                company: "",
                website: "",
                position: "",
                eligibility: "",
                experience: "",
                salary: "",
                location: "",
                walkinDate: "",
                walkinTime: "",
                date: "",
                skills: "",
                jobDescription: "",
                jobRequirements: "",
                candidateProfile: "",
                lastDate: "",
                companyProfile: "",
                howToApply: "",
                contactDetails: ""
            }
            var today = new Date();
            walkin.date = today;

            var $ = cheerio.load(html);

            $('.post-outer').filter(function() {
                var title = $(this).find('.post').find('.post-title ').text();
                walkin.title = title;
            });

            $(".post-body b").each(function() {
                var bold = $(this).text();

                if (bold.indexOf('About') != -1) {
                    walkin.company = bold.substring(bold.indexOf('About') + 6);
                    walkin.companyProfile = $(this)[0].nextSibling.nodeValue.trim();
                } else if (bold.indexOf('Job Detail') != -1 || bold.indexOf('Role') != -1) {
                    walkin.position = $(this)[0].nextSibling.nodeValue.trim();
                }
                if (bold.indexOf('Education') != -1) {
                    walkin.eligibility = $(this)[0].nextSibling.nodeValue.trim();
                }
                if (bold.indexOf('Experience') != -1) {
                    var experience = $(this)[0].nextSibling.nodeValue.trim();
                    experience = experience.substring(experience.indexOf('(') + 1, experience.indexOf(')'));
                    walkin.experience = experience.replace('to', '-');
                }
                if (bold.indexOf('Job Skills') != -1) {
                    walkin.skills = $(this)[0].nextSibling.nodeValue.trim();
                }
                if (bold.indexOf('Location') != -1) {
                    var location = $(this)[0].nextSibling.nodeValue.trim();
                    walkin.location = location.substring(0, location.indexOf('.'));
                }
                if (bold.indexOf('Date') != -1) {
                    walkin.walkinDate = $(this)[0].nextSibling.nodeValue.trim();
                }
                if (bold.indexOf('Venue') != -1) {
                    walkin.contactDetails = $(this)[0].nextSibling.nodeValue.trim();
                }
            });






            res.json(walkin);
        }
    });
}

module.exports.scrape = scrape;
module.exports.scrapeTodayUrls = scrapeTodayUrls;
