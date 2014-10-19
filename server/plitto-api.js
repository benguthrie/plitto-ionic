var loopback = require('loopback');
var boot = require('loopback-boot');
var bodyParser = require('body-parser');
var loopbackPassport = require('loopback-component-passport');
var passport = require('passport');

// Get a handle to `app` and Passport configurators
var app = module.exports = loopback();
var PassportConfigurator = loopbackPassport.PassportConfigurator;
var passportConfigurator = new PassportConfigurator(app);

// Attempt to build the providers/passport config
var providers = {};
try {
  providers = require('../providers.json');
} catch (err) {
  console.trace(err);
  process.exit(1); // fatal
}

// Set up the /favicon.ico
app.use(loopback.favicon());

// request pre-processing middleware
app.use(loopback.compress());

// -- Add your pre-processing middleware here --

// boot scripts mount components like REST API
boot(app, __dirname);

// support JSON-encoded bodies
app.use(bodyParser.json());

// support URL-encoded bodies
app.use(bodyParser.urlencoded({
  extended: true,
}));

// Configure Passport with no sessions
passportConfigurator.init(true);
passportConfigurator.setupModels({
  userModel: app.models.user,
  userIdentityModel: app.models.userIdentity,
  userCredentialModel: app.models.userCredential
});

Object.keys(providers).forEach(function(strategy) {
  var options = providers[strategy];
  options.session = false;

  options.customCallback = function (req, res, next) {
    // http://passportjs.org/guide/authenticate/
    passport.authenticate(
      strategy,
      { session: false },
      function(err, user, info) {
        if (err) { return next(err); }
        if (!user) {
          return res.redirect(options.failureRedirect);
        }
        var redirect = options.successRedirect
          + '?access_token=' + info.accessToken.id
          + '&userId=' + user.id.toString();
        return res.redirect(redirect);
      }
    )(req, res, next);
  };

  passportConfigurator.configureProvider(strategy, options);
});

// -- Mount static files here--
// All static middleware should be registered at the end, as all requests
// passing the static middleware are hitting the file system
// Example:
var path = require('path');
app.use(loopback.static(path.resolve(__dirname, '../client/app')));

// Requests that get this far won't be handled
// by any middleware. Convert them into a 404 error
// that will be handled later down the chain.
app.use(loopback.urlNotFound());

// The ultimate error handler.
app.use(loopback.errorHandler());

app.start = function() {
  // start the web server
  return app.listen(function() {
    app.emit('started');
    console.log('Web server listening at: %s', app.get('url'));
  });
};

// start the server if `$ node server.js`
if (require.main === module) {
  app.start();
}
