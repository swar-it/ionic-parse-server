var _ = require('underscore');

var twilio = require('twilio');
var twilioClient = new twilio.RestClient('AC6999b0dc0b56d874b843de86885e2c02', '811be44e4b1725676dc4af6633528bf6');

Parse.Cloud.define('hello', function(req, res) {
    res.success('Hi');
});

Parse.Cloud.define("sendPushNotification", function(request, response) {

    var user = request.user;
    var params = request.params;
    var recipient = params.recipient
    var data = params.data

    var recipientUser = new Parse.User();
    recipientUser.id = recipient;

    var pushQuery = new Parse.Query(Parse.Installation);
    pushQuery.equalTo("user", recipientUser);

    Parse.Push.send({
        where: pushQuery, // Set our Installation query
        data: data
      }, { success: function() {
      }, error: function(error) {
      }, useMasterKey: true});
    
    response.success('success');
});