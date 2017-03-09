var express = require('express')
var app = express()
var MongoClient = require('mongodb').MongoClient
var ObjectId = require('mongodb').ObjectID;
var bodyParser = require('body-parser');
var db

var walkins = require('./routes/walkins');

MongoClient.connect('mongodb://localhost:27017/jobu', (err, database) => {
    if (err) return console.log(err)
    db = database
    app.listen(process.env.PORT || 80, () => {
        console.log('listening on 80')
    })
})

app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(bodyParser.json())
app.use(express.static('public'))
app.use(express.static('node_modules'))

app.get('/', (req, res) => {
    db.collection('walkins').find().toArray((err, result) => {
        if (err) return console.log(err)
        res.render('home.ejs', {
            walkins: result
        })
    })
})

app.get('/tutorials', (req, res) => {
    db.collection('walkins').find().toArray((err, result) => {
        if (err) return console.log(err)
        res.render('tutorials.ejs', {
            walkins: result
        })
    })
})
app.get('/contact', (req, res) => {
    res.render('contact.ejs');
})

app.get('/uploadChethan', (req, res) => {
    res.render('uploadChethan.ejs');
})

/* GET One Walkin with the provided ID */
app.get('/walkin/:id', function(req, res) {
    //var id = req.params.id.substring(req.params.id.lastIndexOf('-') + 1);
    var id = req.params.id;
    db.collection('walkins').findOne({
        _id: ObjectId(id)
    }, function(err, result) {
        if (err) return console.log(err)
        res.render('details.ejs', {
            walkin: result
        })
    });

});

app.post('/quotes', (req, res) => {
    db.collection('quotes').save(req.body, (err, result) => {
        if (err) return console.log(err)
        console.log('saved to database')
        res.redirect('/')
    })
})

app.put('/quotes', (req, res) => {
    db.collection('quotes')
        .findOneAndUpdate({
            name: 'Yoda'
        }, {
            $set: {
                name: req.body.name,
                quote: req.body.quote
            }
        }, {
            sort: {
                _id: -1
            },
            upsert: true
        }, (err, result) => {
            if (err) return res.send(err)
            res.send(result)
        })
})

app.delete('/quotes', (req, res) => {
    db.collection('quotes').findOneAndDelete({
        name: req.body.name
    }, (err, result) => {
        if (err) return res.send(500, err)
        res.send('A darth vadar quote got deleted')
    })
})

app.use('/api/', walkins);
