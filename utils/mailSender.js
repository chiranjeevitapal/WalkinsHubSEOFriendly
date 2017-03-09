var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport('smtps://walkinshubindia%40gmail.com:Chinna@*27@smtp.gmail.com');

function sendMail(fromEmail, toEmail, subject, text, html) {
  var mailOptions = {
    from: fromEmail, // sender address
    to: toEmail, // list of receivers
    subject: subject, // Subject line
    text: text, // plaintext body
    html: html // html body
};

  transporter.sendMail(mailOptions, function(error, info){
      if(error){
          return console.log(error);
      }
      console.log('Message sent: ' + info.response);
  });
}

module.exports.sendMail = sendMail;
