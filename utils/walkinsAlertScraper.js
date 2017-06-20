var request = require('request');
var cheerio = require('cheerio');
var download = require('image-downloader')
var recursiveCount = 1;
var urlsArray = [];

function scrapeUrls(res) {
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
        if (recursiveCount == 5) {
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
            var contentDiv = html.substring(html.indexOf('<div class="ctkw-links-block-before">') + 43, html.indexOf('<div class="ctkw-links-block-after">'));
            contentDiv = contentDiv.replace('<!-- Quick Adsense WordPress Plugin: http://quicksense.net/ -->', '');
            contentDiv = contentDiv.replace('<div style="float:none;margin:10px 0 10px 0;text-align:center;">', '');
            contentDiv = contentDiv.replace('<script async src="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>', '');
            contentDiv = contentDiv.replace('<!-- ImageAd-300X250 -->', '');
            contentDiv = contentDiv.replace('<ins class="adsbygoogle"', '');
            contentDiv = contentDiv.replace('style="display:inline-block;width:300px;height:250px"', '');
            contentDiv = contentDiv.replace('data-ad-client="ca-pub-1582069099626339"', '');
            contentDiv = contentDiv.replace('data-ad-slot="3309134729"></ins>', '');
            contentDiv = contentDiv.replace('<script>', '');
            contentDiv = contentDiv.replace('(adsbygoogle = window.adsbygoogle || []).push({});', '');
            contentDiv = contentDiv.replace('</script>', '');
            contentDiv = contentDiv.replace('</div>', '');
            contentDiv = contentDiv.replace(/<br \/>/g, '');
            contentDiv = contentDiv.replace(/<span style="color: #800000;">/g, '');
            contentDiv = contentDiv.replace(/<\/span>/g, '');
            //contentDiv = contentDiv.replace(/\s/g, '');
            contentDiv = contentDiv.replace(/<strong>/g, "");
            contentDiv = contentDiv.replace(/<\/strong>/g, '');
            contentDiv = contentDiv.replace(/<em>/g, "");
            contentDiv = contentDiv.replace(/<\/em>/g, '');
            //html = contentDiv;
            var $ = cheerio.load(html);
            var company = $('footer').find('a').eq(1).text();
            var education = "Any Graduate";
            if($('footer').find('a').eq(2).text() != undefined){
                education = $('footer').find('a').eq(2).text();
            }
            var title = $("meta[property='og:title']").attr("content");
            html = contentDiv;
            $ = cheerio.load(html);
            var walkin = {
                title: "",
                logo: "logos\\walkinshub.png",
                company: "",
                website: "",
                position: "",
                eligibility: "",
                experience: "",
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
            var today = new Date();
            walkin.title = title;
            walkin.company = company;
            walkin.eligibility = education;
            walkin.date = today;
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
            $('p').each(function () {
                var textDetail = $(this).text();
                if (textDetail.startsWith('Job Description')) {
                    walkin.jobDescription = textDetail.substring(textDetail.indexOf('Job Description') + 16).trim();
                }
                if (textDetail.startsWith('Industry') || textDetail.startsWith('Salary') || 
                textDetail.startsWith('Functional Area') || textDetail.startsWith('Role Category') 
                || textDetail.startsWith('Role') || textDetail.startsWith('Experience')) {
                    var lines = textDetail.split('\n');
                    console.log(lines);
                    lines.forEach(function (line) {
                        if (line.startsWith('Salary:')) {
                            walkin.salary = line.substring(line.indexOf('Salary:') + 7).trim();
                        }
                        if (line.startsWith('Industry:')) {
                            walkin.industry = line.substring(line.indexOf('Industry:') + 9).trim();
                        }
                        if (line.startsWith('Functional Area')) {
                            walkin.functionalArea = line.substring(line.indexOf('Functional Area:') + 16).trim();
                        }
                        if (line.startsWith('Role Category')) {
                            walkin.jobRequirements = line.substring(line.indexOf('Role Category:') + 14).trim();
                        }
                        if (line.startsWith('Role:')) {
                            walkin.position = line.substring(line.indexOf('Role:') + 5).trim();
                        }
                        if (line.startsWith('Experience:')) {
                            walkin.experience = line.substring(line.indexOf('Experience:') + 11).trim();
                        }
                        if (line.startsWith('Location:')) {
                            walkin.location = line.substring(line.indexOf('Location:') + 9).trim();
                        }
                        if (line.startsWith('Openings:')) {
                            walkin.openings = line.substring(line.indexOf('Openings:') + 9).trim();
                        }
                    })
                }
                if (textDetail.startsWith('Interested candidates')) {
                    walkin.howToApply = textDetail.trim();
                }
                if (textDetail.startsWith('Venue:')) {
                    walkin.howToApply = walkin.howToApply + ' ' + textDetail.trim();
                }
                if (textDetail.startsWith('Candidate Profile:')) {
                    walkin.candidateProfile = textDetail.substring(textDetail.indexOf('Candidate Profile:') + 18).trim();
                }
                if (textDetail.startsWith('Company Profile:')) {
                    walkin.companyProfile = textDetail.substring(textDetail.indexOf('Company Profile:') + 16).trim();
                }
                if (textDetail.startsWith('Contact Details:')) {
                    walkin.contactDetails = textDetail.substring(textDetail.indexOf('Contact Details:') + 16).trim();
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