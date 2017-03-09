var fs = require('fs');
var lineReader = require('line-reader');

//get user ip address
function captureDetails(req) {
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    var m_names = new Array("Jan", "Feb", "Mar",
        "Apr", "May", "Jun", "Jul", "Aug", "Sep",
        "Oct", "Nov", "Dec");
    var d = new Date();
    var curr_date = d.getDate();
    var curr_month = d.getMonth();
    var curr_year = d.getFullYear();
    var curr_hours = d.getHours();
    var curr_minutes = d.getMinutes();
    var curr_seconds = d.getSeconds();

    var outputString = (curr_date + "-" + m_names[curr_month] +
        "-" + curr_year + " / " + curr_hours + "h " + curr_minutes + "m " + curr_seconds + "s -- IP " + ip);
    fs.appendFile("logins.log", outputString + "\n", function(err) {
        if (err) {
            return console.log(err);
        }
    });
};

function readDetails(res) {
    Promise = require('bluebird');
    var eachLine = Promise.promisify(lineReader.eachLine);
    var lines = [];
    var jsonData = {};
    eachLine('logins.log', function(line) {
        jsonData = {};
        jsonData['date'] = line.substring(0, line.indexOf(' /'));
        jsonData['ip'] = line.substring(line.indexOf('IP '));
        lines.push(jsonData);
    }).then(function() {
        console.log('done');
        var count = 1;
        var dateCountObj = {};
        lines.forEach(function(lines) {
            if (dateCountObj[lines.date] == undefined) {
                count = 1;
                dateCountObj[lines.date] = count;
            } else {
                count = count + 1;
                dateCountObj[lines.date] = count;
            }
        });
        res.json(dateCountObj);
    }).catch(function(err) {
        console.error(err);
    });

}


module.exports.captureDetails = captureDetails;
module.exports.readDetails = readDetails;
