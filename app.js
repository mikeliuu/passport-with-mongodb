const express = require('express');
const expressLayout = require('express-ejs-layouts');
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');

const passport = require('passport');

const app = express();

const PORT = process.env.PORT || 8080;

//passport config
require('./config/passport')(passport);

//db config
const db = require('./config/keys').MongoURI;

//connect to mongo
mongoose.connect(db, {useNewUrlParser: true})
.then(function() {
    console.log('mongodb connected');
})
.catch(function(err) {
    console.log(err);
});

//ejs
app.use(expressLayout);
app.set('views', './views');
app.set('view engine', 'ejs');

//bodyparser
app.use(express.urlencoded({ extended: false}));

//express session
app.use(
    session({
        secret: 'secret',
        resave: false,
        saveUninitialized: true,
    })
);

//passport middleware
app.use(passport.initialize());
app.use(passport.session());

//connect flash
app.use(flash());

//global var
app.use(function(req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

//routes
app.use('/', indexRouter);
app.use('/users', usersRouter);


app.listen(PORT, function() {
    console.log(`server is listening on port ${PORT}`); 
});