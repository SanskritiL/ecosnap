const express = require('express');
const fs = require('fs');
const path = require('path');
const passport = require('passport');
const SnapchatStrategy = require('passport-snapchat').Strategy;

let config = {};
let items = [
  {activity: "Bought second hand Jeans", value: "50", category: "Reuse"},
  {activity: "Used own coffee cup/straw", value: "10", category: "Reuse"},
  {activity: "Walked to CVS", value: "15", category: "Carbon"},
  {activity: "Flight to TX", value: "-100", category: "Carbon"},
  {activity: "Planted a tree", value: "80", category: "Carbon"},
  {activity: "Took public transportation", value: "30", category: "Carbon"},
  {activity: "Voted on Ocean Issues", value: "15", category: "Ocean"},
  {activity: "Didn't buy trending tiktok pants", value: "20", category: "Reduce"},
  {activity: "Avoided plastic packaged Produce", value: "12", category: "Ocean"},
]
let totalKarma = 0;

for(let i =0 ;i <items.length;i++){
  totalKarma += parseInt(items[i].value);
}
console.log(totalKarma)


try {
  fs.statSync(path.join(__dirname, './config'))
  config = require('./config');
} catch (e) {}

// Configure the Snapchat strategy for use by Passport.
//
// OAuth 2.0-based strategies require a `verify` function which receives the
// credential (`accessToken`) for accessing the Snapchat API on the user's
// behalf, along with the user's profile.  The function must invoke `cb`
// with a user object, which will be set at `req.user` in route handlers after
// authorization.
passport.use(new SnapchatStrategy({
    clientID: config.CLIENT_ID || process.env.CLIENT_ID,
    clientSecret: config.CLIENT_SECRET || process.env.CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/login/snapchat/callback',
    profileFields: ['id', 'displayName', 'bitmoji'],
    scope: ['user.display_name', 'user.bitmoji.avatar'],
    pkce: true,
    state: true
  },
  function(accessToken, refreshToken, profile, cb) {
    // In this example, the user's Snapchat profile is supplied as the user
    // record.  In a production-quality application, the Snapchat profile should
    // be associated with a user record in the application's database, which
    // allows for account linking and authorization with other identity
    // providers.
    return cb(null, profile);
  }));


// Configure Passport authenticated session persistence.
//
// In order to restore authorization state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  In a
// production-quality application, this would typically be as simple as
// supplying the user ID when serializing, and querying the user record by ID
// from the database when deserializing.  However, due to the fact that this
// example does not have a database, the complete Snapchat profile is serialized
// and deserialized.
passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});


// Create a new Express application.
var app = express();
app.use(express.static('public')); 

// Configure view engine to render EJS templates.
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');



// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({
  secret: config.SESSION_SECRET || process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
}));


// Initialize Passport and restore authorization state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());


// Define routes.
app.get('/',
  function(req, res) {
    res.render('home', { user: req.user,activity: items, totalItems: totalKarma });
  });

app.get('/login',
  function(req, res){
    res.render('login');
  });

app.get('/login/snapchat',
  passport.authenticate('snapchat'));



app.get('/login/snapchat/callback',
  passport.authenticate('snapchat', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/profile',
  require('connect-ensure-login').ensureLoggedIn(),

  function(req, res){
    res.render('profile', { user: req.user, activity: items, totalItems: totalKarma });
    console.log(totalKarma)
  });


  app.get('/wizard',
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
    res.render('wizard');
  });

  app.post('/wizard', require('connect-ensure-login').ensureLoggedIn(),function(request, response){

    console.log(request.body.log);
    console.log(request.body.val);
    items.push({activity: request.body.log,value: request.body.val , category:"Carbon"})
    totalKarma+= request.body.val
    response.redirect('/profile')
    
    });
    


app.listen(3000, () => {
  console.log('App listening on port 3000...');
});





