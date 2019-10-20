const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const path = require('path');
const app = express();
const port = 3000;


const routes = require('./routes/index');
const books = require('./routes/books');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

app.use('/', routes);
app.use('/books', books);

// catch 404
app.use( (req, res, next) => {
  next(createError(404));
});

// error handler
app.use( (err, req, res, next) => {
  res.render('page-not-found');
});


app.listen(port, 'localhost', function(){
  console.log('Example app listening on port 3000.');
});

module.exports = router;
