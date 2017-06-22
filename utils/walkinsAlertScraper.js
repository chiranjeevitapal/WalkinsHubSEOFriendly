var request = require('request');
var cheerio = require('cheerio');
var download = require('image-downloader')
var recursiveCount = 1;
var urlsArray = [];

function scrapeUrls(res) {
    if (recursiveCount == 1) {
        urlsArray = [];
    }
    url = 'http://www.walkinsalert.com/page/' + recursiveCount + '/';
    request(url, function (error, response, html) {
        if (error) {
            res.send(error);
        } else {
            var today = new Date();
            var month = ["January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
            ][today.getMonth()];
            var todayDate = month + ' ' + today.getDate() + ', ' + today.getFullYear();
            var $ = cheerio.load(html);
            $('#content').filter(function () {
                $("article", this).each(function () {
                    var datePosted = $(this).find('.updated').text();
                    if (datePosted == todayDate) {
                        var details = {};
                        details.url = $(this).find('.updated').attr("href");
                        var image = $(this).find('.post-thumbnail img').attr("src");
                        if (image.indexOf('WalkinsAlert-Logo.png') != -1) {
                            image = image.replace('WalkinsAlert-Logo.png', 'walkinshub.png');
                        }
                        details.image = image;
                        //console.log($(this).find('.updated').attr("href"));
                        urlsArray.push(details);
                    }
                })
            });
        }
        console.log(recursiveCount);
        recursiveCount++;
        if (recursiveCount >= 7) {
            recursiveCount = 1;
            res.json(urlsArray);
        } else {
            scrapeUrls(res);
        }
    });
}


function scrapeContent(res, url, imageUrl) {
    request(url, function (error, response, html) {
        if (error) {
            res.send(error);
        } else {

            var $ = cheerio.load(html);

            var walkin = {
                title: "",
                logo: "logos\\walkinshub.png",
                company: "",
                website: "",
                position: "",
                eligibility: "",
                experience: "Any",
                salary: "Not Mentioned",
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
                contactDetails: "",
                functionalArea: "",
                industry: "",
                openings: ""
            }
            var company = "";
            var education = "Any Graduate";
            var tagLocation = "";
            $('footer a').each(function () {
                var hrefString = $(this).attr('href');
                if (hrefString.indexOf('/o/') != -1) {
                    tagLocation = $(this).text();
                }
                if (hrefString.indexOf('company') != -1) {
                    company = $(this).text();
                }
                if (hrefString.indexOf('edu') != -1) {
                    education = $(this).text();
                }
            })
            var options = {
                url: imageUrl,
                dest: './logos/' // Save to /path/to/dest/image.jpg
            }
            download.image(options)
                .then(({
                    filename,
                    image
                }) => {
                    walkin.logo = filename;
                }).catch((err) => {
                    throw err
                })
            walkin.title = $(".entry-title a").text();
            //walkin.title = $("meta[property='og:title']").attr("content");
            if (company == "") {
                company = walkin.title.substring(0, walkin.title.indexOf("Walkin"));
            }
            walkin.company = company;
            walkin.eligibility = education;
            walkin.date = new Date();
            $('p').each(function () {
                var textDetail = $(this).text();
                textDetail = textDetail.replace(/<strong>/g, "");
                textDetail = textDetail.replace(/<\/strong>/g, '');
                textDetail = textDetail.replace(/<em>/g, "");
                textDetail = textDetail.replace(/<\/em>/g, '');
                textDetail = textDetail.trim();
                if (textDetail.startsWith('Job Description')) {
                    walkin.jobDescription = textDetail.substring(textDetail.indexOf('Job Description') + 16).trim();
                }
                if (textDetail.startsWith('Industry') || textDetail.startsWith('Salary') ||
                    textDetail.startsWith('Functional Area') || textDetail.startsWith('Role Category') ||
                    textDetail.startsWith('Role') || textDetail.startsWith('Experience')) {
                    var lines = textDetail.split('\n');
                    lines.forEach(function (line) {
                        line = line.replace(":", "");
                        line = line.trim();
                        console.log(line);
                        if (line.indexOf('Salary') != -1) {
                            walkin.salary = line.substring(line.indexOf('Salary') + 6).trim();
                        }
                        if (line.indexOf('Industry') != -1) {
                            walkin.industry = line.substring(line.indexOf('Industry') + 8).trim();
                        }
                        if (line.indexOf('Functional Area') != -1) {
                            walkin.functionalArea = line.substring(line.indexOf('Functional Area') + 15).trim();
                        }
                        if (line.indexOf('Role Category') != -1) {
                            walkin.jobRequirements = line.substring(line.indexOf('Role Category') + 13).trim();
                        }
                        if (line.indexOf('Role') != -1) {
                            walkin.position = line.substring(line.indexOf('Role') + 4).trim();
                        }
                        if (line.indexOf('Experience') != -1) {
                            walkin.experience = line.substring(line.indexOf('Experience') + 10).trim();
                        }
                        if (line.indexOf('Location') != -1) {
                            walkin.location = line.substring(line.indexOf('Location') + 8).trim();
                        }
                        if (line.indexOf('Openings') != -1) {
                            walkin.openings = line.substring(line.indexOf('Openings') + 8).trim();
                        }
                        if (line.indexOf('Skills') != -1) {
                            walkin.jobRequirements = walkin.jobRequirements + "\n" + line.substring(line.indexOf('Skills') + 6).trim();
                        }
                    })
                }
                if (walkin.location == "") {
                    walkin.location = tagLocation;
                }
                if (textDetail.startsWith('Interested candidates')) {
                    walkin.howToApply = textDetail.trim();
                }
                if (textDetail.startsWith('Venue')) {
                    walkin.howToApply = walkin.howToApply + ' ' + textDetail.trim();
                }
                if (textDetail.startsWith('Documents')) {
                    walkin.howToApply = walkin.howToApply + "\n" + walkin.howToApply + ' ' + textDetail.trim();
                }
                if (textDetail.startsWith('Candidate Profile')) {
                    walkin.candidateProfile = textDetail.substring(textDetail.indexOf('Candidate Profile') + 17).trim();
                }
                if (textDetail.startsWith('Company Profile')) {
                    walkin.companyProfile = textDetail.substring(textDetail.indexOf('Company Profile') + 15).trim();
                }
                if (textDetail.startsWith('Contact Details')) {
                    walkin.contactDetails = textDetail.substring(textDetail.indexOf('Contact Details') + 15).trim();
                }
            });
            setTimeout(function () {
                res.json(walkin);
            }, 1000);
        }
    });
}

module.exports.scrapeUrls = scrapeUrls;
module.exports.scrapeContent = scrapeContent;