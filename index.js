var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var ParseDashboard = require('parse-dashboard');
var parseServerConfig = require('parse-server-azure-config');
var _ = require('underscore');
var url = require('url');
var validator   = require('express-validator');
var favicon = require('serve-favicon');
var cloudinary  = require('cloudinary');
var bodyParser  = require('body-parser');
var moment      = require('moment');

var config = parseServerConfig(__dirname);
var clconfig = require('./clconfig');
// Modify config as necessary before initializing parse server & dashboard

var app = express();
app.use('/public', express.static(__dirname + '/public'));
app.use(favicon(__dirname + '/public/images/SilverlineLogo.png'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/parse', new ParseServer(config.server));
app.use('/parse-dashboard', ParseDashboard(config.dashboard, true));

Parse.initialize(config.server.appId, config.server.masterKey);
Parse.serverURL = config.server.serverURL;

// Basic Route
app.get('/', function(req, res) {
    res.send('Hello! CoLife Parse Server');
});

// API ROUTES ------------------

// get an instance of the router for api routes
var apiRoutes = express.Router(); 

// validator 
apiRoutes.use(validator());

apiRoutes.use(validator({
    customValidators: {
        isName: function(param) {
            return (/[a-zA-Z](?:[a-zA-Z ]*[a-zA-Z])?$/g).test(param);
        },
        isEmail: function(param) {
            return (/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/).test(param);
        },
        isAddress: function(param) {
            return (/^[a-zA-Z0-9\\\-\r\n_+#,. ]+$/).test(param);
        },
        isMobileNumber: function(param) {
            return (/^[0-9+]+$/).test(param);
        },
        isStrongPassword: function(param) {
            return (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*([!-/:-@\[-`{-~])).{6,}$/g).test(param);
        }
    }
}));

//generate signature for uploading images cloudinary
apiRoutes.post('/generateCloudinarySignature', function(req, res){

	req.checkBody("public_id", "Invalid input").isAlphanumeric();
	var errors = req.validationErrors();

	if(errors && typeof errors != 'false' && errors != 'false') {

		var err_msg = "";
		_.each(errors, function(error) {
			err_msg += error.msg + " ";
		})
		err_msg = err_msg.trim();
		var resMessage = {code: 404, message: err_msg};
		res.status(404).send(resMessage);
	}

	else {

	    var public_id = req.body.public_id;
	    var timestamp = Math.floor(moment.utc().valueOf()/1000);
	    var signature = cloudinary.utils.api_sign_request({ "timestamp": timestamp ,"public_id": public_id}, clconfig.api_secret );
	    var result = {"signature": signature, "public_id": public_id, "timestamp": timestamp, "api_key": clconfig.api_key};
	    res.status(200).send({status: 200, result: result});
	}
});

// test parse query
apiRoutes.post('/testquery', function(req, res){
    var username = "fransiscus.angsori@newton-circus.com";
    var User = Parse.Object.extend("User");
    var query  = new Parse.Query(User);
    query.equalTo("username", username);
    query.first().then(function(usr) {
        if(usr) {
        	console.log(usr.id);
        	res.status(200).send(usr.id);
        } else {
        	res.status(404);
        }
    })
});

// apply the routes to application with the prefix /api
app.use('/api', apiRoutes);

// END OF API ROUTES -------------------






app.listen(process.env.PORT || url.parse(config.server.serverURL).port, function () {
  console.log(`Parse Server running at ${config.server.serverURL}`);
});