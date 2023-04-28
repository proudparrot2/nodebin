const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fs = require("fs")

const mongoose = require('mongoose');
mongoose.connect(process.env.DB_URI, {useNewUrlParser: true, useUnifiedTopology: true});

const pasteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'The paste title cannot be empty']
  },
  content: {
    type: String,
    required: [true, 'The paste content cannot be empty']
  },
  
  createdAt: { type: Date, default: Date.now }
});

const Paste = mongoose.model('Paste', pasteSchema);

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));


app.get('/', (req, res) => {
    res.render('new');
});

app.post('/create', (req, res) => {
    if (!req.body.content || !req.body.title) {
      var error = "Both paste title and content are required."
      res.status(400).render('error', { error })
    } else {
        
        const newPaste = new Paste({ title: req.body.title, content: req.body.content });
        newPaste.save((err, paste) => {
            if (err) {
                res.status(500).send('An error occurred while creating the paste');
            } else {
                res.redirect(`/bin/${paste._id}`);
            }
        });
    }
});


app.get('/bin/:id', (req, res) => {
    Paste.findById(req.params.id, (err, paste) => {
        if (err) {
            res.status(500).send('An error occurred while reading the paste');
        } else if (!paste) {
            res.status(404).send('Paste not found');
        } else {
          res.render('paste', { paste, id: req.params.id });
          console.log("Paste " + req.params.id + " was viewed")
        }
    });
});




app.get('/raw/:id', (req, res) => {
    Paste.findById(req.params.id, (err, paste) => {
        if (err) {
          console.error(err)
            res.status(500).send('An error occurred while reading the paste');
        } else if (!paste) {
            res.status(404).send('Paste not found');
        } else {
            res.set('Content-Type', 'text/plain');
            res.send(paste.content);
        }
    });
});



app.get('/duplicate/:id', (req, res) => {
    Paste.findById(req.params.id, (err, paste) => {
        if (err) {
            res.status(500).send('An error occurred while reading the paste');
        } else if (!paste) {
            res.status(404).send('Paste not found');
        } else {
            res.render('edit', { paste });
        }
    });
});




app.post('/save', (req, res) => {
    const newPaste = new Paste({ title: req.body.title, content: req.body.content });
    newPaste.save((err, newPaste) => {
        if (err) {
            res.status(500).send('An error occurred while creating the paste');
        } else {
            res.redirect(`/bin/${newPaste._id}`);
        }
    });
});





app.listen(3000)
