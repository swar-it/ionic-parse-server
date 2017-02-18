var _ = require('underscore');

var twilio = require('twilio');
var twilioClient = new twilio.RestClient('AC61336ba077021a0538ecd22749bea275', '7cc20469f61a9ae5b36a3d08494a00cf');

var NodeRSA = require('node-rsa');
var key = new NodeRSA('-----BEGIN RSA PRIVATE KEY-----\n'+
'MIIEowIBAAKCAQEAtawBIyRd20ZIg2AJS8zqV3C3nND/kabRRPlnYUqycBFfbTZU\n'+
'M517EI59PmjpzaIzj2FhWAFqYS4b0/WYIPFud+DDd/S/2ETegJPFQ4sjiY7/DsS2\n'+
'o9Grjye0CSc8VQUV09zdYdH557ybngiQow9EWdJgM39NkDiNO2QKNXivAQVpuJeu\n'+
'oDeKwNGmwDkIsvxBn8u55QpOwvdaRBeLqllJ6xoF6OuwnD0IB4tVDL2MbMVj1U9G\n'+
'tEGLbMmslVAmtIKEHgB8FpPlo3+fmLE7lufismI3u9tT2HB/Vn4OYNooIWE9uuiy\n'+
'xm2MAGQ7AuOxIJYUghtKvC68cAy0cKdqJC/9xQIDAQABAoIBAG4s1y+5wVXW5OkP\n'+
'l/OpXUEUMbZfpW5ujaFX45NEWrzOPGIePahjzBt5Xok31PsJcF13ADMAAMTY0rWT\n'+
'zuPDp2v6GnEoNCRzd8DgXRSeUDn/R71sHRtyb6nMuUmHyvYAtIEdBAFr9zPL1VBc\n'+
'/2J0Qs56YC86+A4LzdMD05EkFHX4Db4SuQbGKA2IVFANCgR+qPiFhSLWO7xdbNjf\n'+
'GgOav3wnO+wdYcVLdIkoj63JDPAepJyAW83oMGNWrwvkd9fqfsFbOc/vkNX/tCjF\n'+
'TYkJIqocSYiC/cfm9793is3uGoKf78wTWvtpna9DehLZ1EBg/6+59Cnrs8PApVVY\n'+
'uvVkXkECgYEA3alkGG2/m0MpFpKKYiOyOXKQrrH9smdhj8dbVgMwj7e54NAr9GF2\n'+
'PrDfIoJkEFyWzBEbMOB42+Q86jJgZc/BwPVpS+IsulnniOXCG3MR7KDwTmR7AuOw\n'+
'uX2WlpVrDbdpO7sW/locmJecLnOXTnwVTOFd20Im+KBCR5YhcABPb7UCgYEA0dC1\n'+
'E8GJQ1laqn6CQ8uk3gMnitvkk2008r+X/6jQ49fA1m+ppkzD0x5bmfmnIICesDji\n'+
'LByUsq3/agfc8NuQ2xgxFwaKSy4TDCouURv0PHKy6RkMlJ6+RJQtGbuYlK4PkQXi\n'+
'umbjlLn59xH892QhJHpBx9lOsH+acffFlKQff9ECgYApz6vr17fOx6pWcancvTL/\n'+
'FxcnfLeIEWwbvNUDsnJUialsOJgx7rhpNt/AGKxbUbu4HnnsjEr/31uGKZ55VekM\n'+
'Rr5n6+/X7uF3ty8YEmqNIgZyIw35C43oT0I6gVDCM5iMBcxeigze06pIMNGXolw6\n'+
'NkCH/UBwoXofGriP8d8KCQKBgFWvMgPbab8DYq918qTVKYMxLpjarEI4uwLXk69o\n'+
'tcYWej4YY+PyPZaeMzJybfosDKJS2KrDEUbXIBOhGm2SfVm8S2/nz9pb+pNhNoER\n'+
'NXDqNn5TKHwZSAKhsLltjyZI3zqOeMU+93npaVepFPHDBnXrJ6oB6MzTj7MzSJEn\n'+
'ZWXBAoGBAIhBhhEq097jPtnxJASLtVEvadR0/d0Wg0sYYHjIdHUdKw7p1AEgKn7g\n'+
'Iytgcu1yDdu8nSVBtLbwUCERITddT7jI/GMlyQRLcgL2EQ15VtrE+ghZzG2P0aJU\n'+
'5jYAlhglbrH/teYExrmWKp+DnRi98BwSCRXBOtlwcSFwGKmQjaCi\n'+
'-----END RSA PRIVATE KEY-----');

key.setOptions({encryptionScheme: 'pkcs1'});

Parse.Cloud.define('hello', function(req, res) {
    res.success('Hi');
});

Parse.Cloud.define("sendPushNotificationForIOS", function(request, response) {

    var user = request.user;
    var params = request.params;
    var recipient = params.recipient
    var data = params.data

    var recipientUser = new Parse.User();
    recipientUser.id = recipient;

    var pushQuery = new Parse.Query(Parse.Installation);
    pushQuery.equalTo('deviceType', 'ios'); // targeting iOS devices only
    pushQuery.equalTo("user", recipientUser);

    Parse.Push.send({
        where: pushQuery, // Set our Installation query
        data: data
      }, { success: function() {
      }, error: function(error) {
      }, useMasterKey: true});
    
    response.success('success');
});

Parse.Cloud.define("checkPhoneNumberExists", function(request, response) {

    var phoneNumber = request.params.mobileNumber;

    checkTargetUserExists(phoneNumber).then(function(friend) {
        if(!friend) {
            response.error({status: 404, user: false, message: 'User not found'});
        }
        else {
            response.success({status: 200, user: true, message: 'User found'});
        }
    }, function(error) {
        response.error({status: 404, user: false, message: error.message});
    });
});

Parse.Cloud.define("sendFriendRequest", function(request, response) {

    var user = request.user,
        sessionToken = user.getSessionToken(),
        phoneNumber = request.params.mobileNumber,
        gfriendUserObj,
        gfriend;

    checkCurrentUserExists(user, sessionToken).then(function(friendUserObj) {

        gfriendUserObj = friendUserObj;

        if(!friendUserObj) {

            return Parse.Promise.error({error: 404, message: 'Current user could not be found.'});
        }
        else {

            return checkTargetUserExists(phoneNumber);
        }
    }).then(function(friend) {

        gfriend = friend;

        if(!friend) {

            return Parse.Promise.error({error: 404, message: 'Please check the phone number and try again.'});
        }
        else {
            return checkFriendshipExists(gfriendUserObj.get("user"), gfriend.get("user"));
        }
    }).then(function(return_value) {

        if(return_value) {
            return Parse.Promise.error({code: 404, message: 'You are already friends with this user.'});
        }
        else {
            return checkFriendshipExists(gfriend.get("user"), gfriendUserObj.get("user"));
        }
    }).then(function(return_value) {

        if(return_value) {
            return Parse.Promise.error({code: 404, message: 'You are already friends with this user.'});
        }
        else {
            return checkFriendRequestExists(gfriendUserObj, gfriend, sessionToken);
        }
    }).then(function(return_status) {

        if(return_status.code == 702 || return_status.code == 704) {
            return Parse.Promise.error(return_status);
        }
        else {
            return creatependingFriendRequest(user, gfriendUserObj, gfriend);
        }
    }).then(function() {
        response.success({code: 200, message: 'Success'});
    }, function(error) {
        response.error(error);
    });
});

Parse.Cloud.define("cancelFriendRequest", function(request, response) {

    var user = request.user,
        sessionToken = user.getSessionToken(),
        objectId = request.params.pending_friend_request_id;

    checkCurrentUserExists(user, sessionToken).then(function(friendUserObj) {

        Parse.Cloud.useMasterKey();
        var PendingRequest_Friend = Parse.Object.extend("PendingRequest_Friend");
        var pendingReqQuery  = new Parse.Query(PendingRequest_Friend);
        pendingReqQuery.equalTo("from", friendUserObj);
        return pendingReqQuery.get(objectId, {sessionToken: sessionToken});
    }).then(function(pendingReqObj) {
        return pendingReqObj.destroy();
    }).then(function(updatedObj) {
        response.success({code: 200, message: 'Success'});
    }, function(error) {
        response.error(error);
    });
});

Parse.Cloud.define("acceptFriendRequest", function(request, response) {

    var user = request.user,
        sessionToken = user.getSessionToken(),
        objectId = request.params.pending_friend_request_id,
        gpendingReqObj;

    checkCurrentUserExists(user, sessionToken).then(function(friendUserObj) {

        Parse.Cloud.useMasterKey();
        var PendingRequest_Friend = Parse.Object.extend("PendingRequest_Friend");
        var pendingReqQuery  = new Parse.Query(PendingRequest_Friend);
        pendingReqQuery.include("from");
        pendingReqQuery.include("to");
        pendingReqQuery.equalTo("to", friendUserObj);
        return pendingReqQuery.get(objectId, {sessionToken: sessionToken});
    }).then(function(pendingReqObj) {

        gpendingReqObj = pendingReqObj;

        return addUserToRole(gpendingReqObj.get("from").get("user"), user, "friendsOf_");
    }).then(function() {
        return addUserToRole(user, gpendingReqObj.get("from").get("user"), "friendsOf_");
    }).then(function() {
        return gpendingReqObj.destroy();
    }).then(function() {
        response.success({code: 200, message: 'Success'});
    }, function(error) {
        response.error(error);
    });
});

Parse.Cloud.define("declineFriendRequest", function(request, response) {

    var user = request.user,
        sessionToken = user.getSessionToken(),
        objectId = request.params.pending_friend_request_id;

    checkCurrentUserExists(user, sessionToken).then(function(friendUserObj) {

        Parse.Cloud.useMasterKey();
        var PendingRequest_Friend = Parse.Object.extend("PendingRequest_Friend");
        var pendingReqQuery  = new Parse.Query(PendingRequest_Friend);
        pendingReqQuery.equalTo("to", friendUserObj);
        return pendingReqQuery.get(objectId, {sessionToken: sessionToken});
    }).then(function(pendingReqObj) {
        return pendingReqObj.destroy();
    }).then(function(updatedObj) {
        response.success({code: 200, message: 'Success'});
    }, function(error) {
        response.error(error);
    });
});

Parse.Cloud.define("sendFullAccessRequest", function(request, response) {

    var user = request.user,
        sessionToken = user.getSessionToken(),
        objectId = request.params.targetuser_friend_id,
        relationship = request.params.relationship,
        additional_note = request.params.additional_note,
        gfriendUserObj,
        gfriend,
        gprincipal_companion;

    checkCurrentUserExists(user, sessionToken).then(function(friendUserObj) {

        gfriendUserObj = friendUserObj;

        if(!friendUserObj) {

            return Parse.Promise.error({error: 404, message: 'Current user could not be found.'});
        }
        else {
            return getTargetUser(objectId);
        }
    }).then(function(friend) {

        gfriend = friend;

        if(!friend) {
            return Parse.Promise.error({error: 404, message: 'Please try again.'});
        }
        else {
            return checkFriendshipExists(gfriendUserObj.get("user"), gfriend.get("user"));
        }
    }).then(function(return_value) {
        if(!return_value) {
            return Parse.Promise.error({code: 404, message: 'You are not friends with this user.'});
        }
        else {
            return checkFriendshipExists(gfriend.get("user"), gfriendUserObj.get("user"));
        }
    }).then(function(return_value) {
        if(!return_value) {
            return Parse.Promise.error({code: 404, message: 'You are not friends with this user.'});
        }
        else {
            return getPrincipalCompanionTargetUser(gfriend);
        }
    }).then(function(principal_companion) {

        gprincipal_companion = principal_companion;

        if(!principal_companion) {
            return Parse.Promise.error({error: 404, message: 'Please try again.'});
        }
        else {
            return checkFullAccessRequestExists(gfriendUserObj, gfriend, sessionToken);
        }
    }).then(function(return_status) {

        if(return_status.code == 700) {
            return Parse.Promise.error(return_status);
        }
        else {
            return creatependingFullAccessRequest(user, gfriendUserObj, gfriend, gprincipal_companion, relationship, additional_note);
        }
    }).then(function(return_value) {
        response.success({code: 200, message: 'Success'});
    }, function(error) {
        response.error(error);
    });
});

Parse.Cloud.define("acceptFullAccessRequest", function(request, response) {

    var user = request.user,
        sessionToken = user.getSessionToken(),
        objectId = request.params.pending_fullaccess_request_id,
        gpendingReqObj;

    checkCurrentUserExists(user, sessionToken).then(function(friendUserObj) {

        Parse.Cloud.useMasterKey();
        var PendingRequest_FullAccess = Parse.Object.extend("PendingRequest_FullAccess");
        var pendingReqQuery  = new Parse.Query(PendingRequest_FullAccess);
        pendingReqQuery.include("from");
        pendingReqQuery.include("to");
        pendingReqQuery.equalTo("receiver", friendUserObj);
        return pendingReqQuery.get(objectId, {sessionToken: sessionToken});
    }).then(function(pendingReqObj) {

        gpendingReqObj = pendingReqObj;

        return addUserToRole(pendingReqObj.get("to").get("user"), pendingReqObj.get("from").get("user"), "fullAccessTo_");
    }).then(function() {
        return gpendingReqObj.destroy();
    }).then(function() {
        response.success({code: 200, message: 'Success'});
    }, function(error) {
        response.error(error);
    });
});

Parse.Cloud.define("declineFullAccessRequest", function(request, response) {

    var user = request.user,
        sessionToken = user.getSessionToken(),
        objectId = request.params.pending_fullaccess_request_id;

    checkCurrentUserExists(user, sessionToken).then(function(friendUserObj) {

        Parse.Cloud.useMasterKey();
        var PendingRequest_FullAccess = Parse.Object.extend("PendingRequest_FullAccess");
        var pendingReqQuery  = new Parse.Query(PendingRequest_FullAccess);
        pendingReqQuery.equalTo("receiver", friendUserObj);
        return pendingReqQuery.get(objectId, {sessionToken: sessionToken});
    }).then(function(pendingReqObj) {
        return pendingReqObj.destroy();
    }).then(function(updatedObj) {
        response.success({code: 200, message: 'Success'});
    }, function(error) {
        response.error(error);
    });
});

Parse.Cloud.define("sendVerificationSMS", function(request, response) {

    var user = request.user,
        sessionToken = user.getSessionToken(),
        type = request.params.type,
        token = Math.floor(Math.random()*9000 + 1000),
        message = "";

    checkCurrentUserExists(user, sessionToken).then(function(friendUserObj) {

        Parse.Cloud.useMasterKey();
        var userObj = friendUserObj.get("user");
        userObj.set("securityToken", token);
        return userObj.save();
    }).then(function(userObj) {
        if(type === "registration") {
            message = 'Welcome to ConnectedLife. Please enter the following 4 digit code ' + token + ' to verify your account.';
        }
        else if(type === "reset_pw") {
            message = 'You have requested to change the password associated with your ConnectedLife account. Please enter the following 4 digit verification code ' + token + ' to successfully change your password.';
        }
        var mobilenumber = userObj.get("phoneNumber");
        return sendSMS(mobilenumber, message);
    }).then(function(message) {
        response.success({code: 200, message: 'Success'});
    }, function(error) {
        response.error(error);
    });
});

Parse.Cloud.define("sendVerificationSMS_MN", function(request, response) {

    var user = request.user,
        sessionToken = user.getSessionToken(),
        phoneNumber = request.params.mobileNumber,
        token = Math.floor(Math.random()*9000 + 1000),
        message = 'You have requested to change the mobile number associated with your ConnectedLife account. Please enter the following 4 digit verification code ' + token + ' to successfully change your mobile number.';

    checkCurrentUserExists(user, sessionToken).then(function(friendUserObj) {

        Parse.Cloud.useMasterKey();
        var userObj = friendUserObj.get("user");
        userObj.set("securityToken", token);
        return userObj.save();
    }).then(function(userObj) {
        var mobilenumber = phoneNumber;
        return sendSMS(mobilenumber, message);
    }).then(function(message) {
        response.success({code: 200, message: 'Success'});
    }, function(error) {
        response.error(error);
    });
});

Parse.Cloud.define("verifyAccount", function(request, response) {

    var user = request.user,
        sessionToken = user.getSessionToken(),
        inputToken = request.params.token;

    checkCurrentUserExists(user, sessionToken).then(function(friendUserObj) {

        var userObj = friendUserObj.get("user");

        if(userObj.get("securityToken") !== parseInt(inputToken)) {
            response.error({status: 404, message: 'Wrong token'});
        }
        else {
            Parse.Cloud.useMasterKey();
            userObj.set("accountVerified", true);
            return userObj.save();
        }
    }).then(function(userObj) {
        response.success({status: 200, message: 'Account verified'});
    }, function(error) {
        response.error(error);
    });
});

Parse.Cloud.define("verifyTokenForPassword", function(request, response) {

    var inputToken = request.params.token,
        phoneNumber = request.params.mobileNumber;

    checkTargetUserExists(phoneNumber).then(function(friendUserObj) {

        if(!friendUserObj) {
            response.error({status: 404, message: 'User not found'});
        }
        else {

            var userObj = friendUserObj.get("user");

            if(userObj.get("securityToken") !== parseInt(inputToken)) {
                sendVerificationSMSBeforeLogin(phoneNumber, response);
            }
            else {
                response.success({status: 200, message: 'Correct token'});
            }
        }
    }, function(error) {
        response.error({status: 404, message: error.message});
    });
});

// After login
Parse.Cloud.define("changePassword", function(request, response) {

    var user = request.user,
        sessionToken = user.getSessionToken(),
        inputToken = request.params.token,
        password = request.params.password;

    checkCurrentUserExists(user, sessionToken).then(function(friendUserObj) {

        var userObj = friendUserObj.get("user");

        if(userObj.get("securityToken") !== parseInt(inputToken)) {
            response.error({status: 404, message: 'Wrong token'});
        }
        else {
            password = key.decrypt(password, 'utf8');

            Parse.Cloud.useMasterKey();
            userObj.set("password", password);
            return userObj.save();
        }
    }).then(function(userObj) {
        response.success({status: 200, message: 'Password changed'});
    }, function(error) {
        response.error(error);
    });
});

// After login
Parse.Cloud.define("updatePhoneNumber", function(request, response) {

    var user = request.user,
        sessionToken = user.getSessionToken(),
        inputToken = request.params.token,
        phoneNumber = request.params.mobileNumber;

    checkCurrentUserExists(user, sessionToken).then(function(friendUserObj) {

        var userObj = friendUserObj.get("user");

        if(userObj.get("securityToken") !== parseInt(inputToken)) {
            response.error({status: 404, message: 'Wrong token'});
        }
        else {
            Parse.Cloud.useMasterKey();
            userObj.set("phoneNumber", phoneNumber);
            return userObj.save();
        }
    }).then(function(userObj) {
        return updateFriendDataObject(userObj, sessionToken, phoneNumber);
    }).then(function(friendUserObj) {
        response.success({status: 200, message: 'Mobile number updated'});
    }, function(error) {
        response.error(error);
    });
});

Parse.Cloud.define("sendVerificationSMSBeforeLogin", function(request, response) {

    var phoneNumber = request.params.mobileNumber;

    sendVerificationSMSBeforeLogin(phoneNumber, response);
});

// Before login
Parse.Cloud.define("forgotPassword", function(request, response) {

    var inputToken = request.params.token,
        phoneNumber = request.params.mobileNumber,
        password = request.params.password;

    checkTargetUserExists(phoneNumber).then(function(friendUserObj) {

        if(!friendUserObj) {
            response.error({status: 404, message: 'User not found'});
        }
        else {

            var userObj = friendUserObj.get("user");

            if(userObj.get("securityToken") !== parseInt(inputToken)) {
                response.error({status: 404, message: 'Wrong token'});
            }
            else {
                password = key.decrypt(password, 'utf8');

                Parse.Cloud.useMasterKey();
                userObj.set("password", password);
                return userObj.save();
            }
        }
    }).then(function(userObj) {
        response.success({status: 200, message: 'Password changed'});
    }, function(error) {
        response.error({status: 404, message: error.message});
    });
});

Parse.Cloud.define("viewFriendList", function(request, response) {

    var user = request.user,
        sessionToken = user.getSessionToken(),
        objectId = request.params.friend_data_id, // object ID of the user whose friend list is being viewed
        roleName = request.params.role_name;

    checkCurrentUserExists(user, sessionToken).then(function(friendUserObj) {

        gfriendUserObj = friendUserObj;

        if(!friendUserObj) {

            return Parse.Promise.error({error: 404, message: 'Current user could not be found.'});
        }
        else {
            return getTargetUser(objectId);
        }
    }).then(function(friend) {

        gfriend = friend;

        if(!friend) {
            return Parse.Promise.error({error: 404, message: 'Please try again.'});
        }
        else if(gfriendUserObj.id === gfriend.id) {
            return true;
        }
        else {
            return checkFriendshipExists(gfriendUserObj.get("user"), gfriend.get("user"));
        }
    }).then(function(return_value) {

        if(!return_value) {
            return Parse.Promise.error({code: 404, message: 'You are not friends with this user.'});
        }
        else if(gfriendUserObj.id === gfriend.id) {
            return true;
        }
        else {
            return checkFriendshipExists(gfriend.get("user"), gfriendUserObj.get("user"));
        }
    }).then(function(return_value) {
        if(!return_value) {
            return Parse.Promise.error({code: 404, message: 'You are not friends with this user.'});
        }
        else {
            return checkIfPrincipalCompanion(gfriendUserObj, gfriend);
        }
    }).then(function(return_value) {
        if(!return_value) {
            return Parse.Promise.error({code: 404, message: 'You are not principal companion to this user.'}); 
        }
        else {
            return getFriendsforTargetUser(gfriendUserObj, gfriend.get("user").id, roleName);
        }
    }).then(function(friends) {
        console.log("friends");
        console.log(friends);
        response.success(friends);
    }, function(error) {
        response.error(error);
    });
});

Parse.Cloud.define("grantFullAccess", function(request, response) {

    var user = request.user,
        sessionToken = user.getSessionToken(),
        objectId = request.params.friend_data_id, // object ID of the user whose friend list is being viewed
        targetObjectId = request.params.target_friend_data_id; // object ID of the friend who needs to be granted full access

    checkCurrentUserExists(user, sessionToken).then(function(friendUserObj) {

        gfriendUserObj = friendUserObj;

        if(!friendUserObj) {

            return Parse.Promise.error({error: 404, message: 'Current user could not be found.'});
        }
        else {
            return getTargetUser(objectId);
        }
    }).then(function(friend1) {

        gfriend1 = friend1;

        if(!friend1) {
            return Parse.Promise.error({error: 404, message: 'Please try again.'});
        }
        else if(gfriendUserObj.id === gfriend1.id) {
            return true;
        }
        else {
            return checkFriendshipExists(gfriendUserObj.get("user"), gfriend1.get("user"));
        }
    }).then(function(return_value) {

        if(!return_value) {
            return Parse.Promise.error({code: 404, message: 'You are not friends with this user.'});
        }
        else {
            return checkIfPrincipalCompanion(gfriendUserObj, gfriend1);
        }
    }).then(function(return_value) {
        if(!return_value) {
            return Parse.Promise.error({code: 404, message: 'You are not principal companion to this user.'}); 
        }
        else {
            return getTargetUser(targetObjectId);
        }
    }).then(function(friend2) {
        gfriend2 = friend2;

        if(!friend2) {
            return Parse.Promise.error({error: 404, message: 'Please try again.'});
        }
        else {
            return checkFriendshipExists(gfriendUserObj.get("user"), gfriend2.get("user"));
        }
    }).then(function(return_value) {

        if(!return_value) {
            return Parse.Promise.error({code: 404, message: 'This user is not friends with ' + gfriend1.get("name") + '.'});
        }
        else {
            return addUserToRole(gfriend1.get("user"), gfriend2.get("user"), "fullAccessTo_");
        }
    }).then(function() {
        response.success({status: 200, message: 'Successfully granted full access to profile.'});
    }, function(error) {
        response.error(error);
    });
});

Parse.Cloud.define("revokeFullAccess", function(request, response) {

    var user = request.user,
        sessionToken = user.getSessionToken(),
        objectId = request.params.friend_data_id, // object ID of the user whose friend list is being viewed
        targetObjectId = request.params.target_friend_data_id; // object ID of the friend who needs to be granted full access

    checkCurrentUserExists(user, sessionToken).then(function(friendUserObj) {

        gfriendUserObj = friendUserObj;

        if(!friendUserObj) {

            return Parse.Promise.error({error: 404, message: 'Current user could not be found.'});
        }
        else {
            return getTargetUser(objectId);
        }
    }).then(function(friend1) {

        gfriend1 = friend1;

        if(!friend1) {
            return Parse.Promise.error({error: 404, message: 'Please try again.'});
        }
        else if(gfriendUserObj.id === gfriend1.id) {
            return true;
        }
        else {
            return checkFriendshipExists(gfriendUserObj.get("user"), gfriend1.get("user"));
        }
    }).then(function(return_value) {

        if(!return_value) {
            return Parse.Promise.error({code: 404, message: 'You are not friends with this user.'});
        }
        else {
            return checkIfPrincipalCompanion(gfriendUserObj, gfriend1);
        }
    }).then(function(return_value) {
        if(!return_value) {
            return Parse.Promise.error({code: 404, message: 'You are not principal companion to this user.'}); 
        }
        else {
            return getTargetUser(targetObjectId);
        }
    }).then(function(friend2) {
        gfriend2 = friend2;

        if(!friend2) {
            return Parse.Promise.error({error: 404, message: 'Please try again.'});
        }
        else {
            return checkFriendshipExists(gfriendUserObj.get("user"), gfriend2.get("user"));
        }
    }).then(function(return_value) {

        if(!return_value) {
            return Parse.Promise.error({code: 404, message: 'This user is not friends with ' + gfriend1.get("name") + '.'});
        }
        else {
            return removeUserFromRole(gfriend1.get("user"), gfriend2.get("user"), "fullAccessTo_");
        }
    }).then(function() {
        response.success({status: 200, message: 'Successfully revoked full access to profile.'});
    }, function(error) {
        response.error(error);
    });
});

Parse.Cloud.define("unfriendUser", function(request, response) {

    var user = request.user,
        sessionToken = user.getSessionToken(),
        objectId = request.params.friend_data_id, // object ID of the user who needs to be unfriended
        gfriendUserObj,
        gfriend;

    checkCurrentUserExists(user, sessionToken).then(function(friendUserObj) {

        gfriendUserObj = friendUserObj;

        if(!friendUserObj) {

            return Parse.Promise.error({error: 404, message: 'Current user could not be found.'});
        }
        else {

            return getTargetUser(objectId);
        }
    }).then(function(friend) {

        gfriend = friend;

        if(!friend) {
            return Parse.Promise.error({error: 404, message: 'Please try again.'});
        }
        else {
            return checkFriendshipExists(gfriendUserObj.get("user"), gfriend.get("user"));
        }
    }).then(function(return_value) {
        if(!return_value) {
            return Parse.Promise.error({code: 404, message: 'You are not friends with this user.'});
        }
        else {
            return checkFriendshipExists(gfriend.get("user"), gfriendUserObj.get("user"));
        }
    }).then(function(return_value) {
        if(!return_value) {
            return Parse.Promise.error({code: 404, message: 'You are not friends with this user.'});
        }
        else {
            return removeUserFromRole(gfriendUserObj.get("user"), gfriend.get("user"), "friendsOf_");
        }
    }).then(function() {
        return removeUserFromRole(gfriend.get("user"), gfriendUserObj.get("user"), "friendsOf_");
    }).then(function() {
        return deleteRelationships("Activity", "sender", "receiver", gfriendUserObj, gfriend);
    }).then(function() {
        return deleteRelationships("Alerts", "sender", "receiver", gfriendUserObj, gfriend);
    }).then(function() {
        return deleteRelationships("PendingEvent", "sender", "receiver", gfriendUserObj, gfriend);
    }).then(function() {
        return deleteRelationships("Room", "user1", "user2", gfriendUserObj, gfriend);
    }).then(function() {
        return deleteRelationships("Event", "sender", "owner", gfriendUserObj, gfriend);
    }).then(function() {
        response.success({code: 200, message: 'Success'});
    }, function(error) {
        response.error(error);
    });
});

var checkCurrentUserExists = function(user, sessionToken) {

    var FriendData = Parse.Object.extend("FriendData");
    var friendQuery  = new Parse.Query(FriendData);
    friendQuery.include("user");
    friendQuery.equalTo("user", user);
    return friendQuery.first({sessionToken: sessionToken}).then(function(friendUserObj) {
        if(friendUserObj) {
            return Parse.Promise.as(friendUserObj);
        }
        else {
            return Parse.Promise.as(undefined);
        }
    }, function(error) {
        return Parse.Promise.error(error);
    });
};

var checkTargetUserExists = function(phoneNumber) {

    Parse.Cloud.useMasterKey();
    var FriendData = Parse.Object.extend("FriendData");
    var friendQuery  = new Parse.Query(FriendData);
    friendQuery.include("user");
    friendQuery.equalTo("phoneNumber", phoneNumber);
    return friendQuery.first().then(function(friend) {
        if(friend) {
            return Parse.Promise.as(friend);
        }
        else {
            return Parse.Promise.as(undefined);
        }
    }, function(error) {
        return Parse.Promise.error(error);
    });
};

var checkFriendRequestExists = function(friendUserObj, friend, sessionToken) {

    var PendingRequest_Friend = Parse.Object.extend("PendingRequest_Friend");
    var pendingReqQuery1  = new Parse.Query(PendingRequest_Friend);
    pendingReqQuery1.equalTo("from", friendUserObj);
    pendingReqQuery1.equalTo("to", friend);
    return pendingReqQuery1.first({sessionToken: sessionToken}).then(function(pendingReqObj) {
        if(pendingReqObj) {
            return Parse.Promise.error({code: 702, message: 'You have already sent a friend request to this user.'});
        }
        else {
            return checkFriendRequestExistsfromTargetUser(friendUserObj, friend, sessionToken);
        }
    });
};

var checkFriendRequestExistsfromTargetUser = function(friendUserObj, friend, sessionToken) {

    var PendingRequest_Friend = Parse.Object.extend("PendingRequest_Friend");
    var pendingReqQuery2  = new Parse.Query(PendingRequest_Friend);
    pendingReqQuery2.equalTo("from", friend);
    pendingReqQuery2.equalTo("to", friendUserObj);
    return pendingReqQuery2.first({sessionToken: sessionToken}).then(function(pendingReqObj) {
        if(pendingReqObj) {
            return Parse.Promise.error({code: 704, message: 'You have a pending friend request from this user.'});
        }
        else {
            return Parse.Promise.as({code: 200, message: 'No error.'});
        }
    });
};

var creatependingFriendRequest = function(user1, user1friendObj, user2) {

    var PendingRequest_Friend = Parse.Object.extend("PendingRequest_Friend");
    var pendingRequest_Friend = new PendingRequest_Friend();
    assignACL(user1, user2.get("user"), [true, true, true, true]).then(function(acl) {
        pendingRequest_Friend.set("ACL", acl);
        pendingRequest_Friend.set("from", user1friendObj);
        pendingRequest_Friend.set("to", user2);
        pendingRequest_Friend.set("senderName", user1friendObj.get("name"));
        pendingRequest_Friend.set("senderProfilePicture", user1friendObj.get("profilePicture"));
        pendingRequest_Friend.set("senderPhoneNumber", user1friendObj.get("phoneNumber"));
        return pendingRequest_Friend.save();
    }).then(function(pendingRequest_Friend) {
        return Parse.Promise.as(pendingRequest_Friend);
    }, function(error) {
        return Parse.Promise.error(error);
    });
};

var addUserToRole = function(user1, user2, roleName) {

    var roleName = roleName + user1.id;
    var roleQuery = new Parse.Query("_Role");
    roleQuery.equalTo("name", roleName);
    roleQuery.first().then(function(role) {
        role.getUsers().add(user2);
        return role.save();
    }).then(function(role) {
        return Parse.Promise.as(role);
    }, function(error) {
        return Parse.Promise.error(error);
    });
};

var removeUserFromRole = function(user1, user2, roleName) {

    // Parse.Cloud.useMasterKey();

    var roleName = roleName + user1.id;
    var roleQuery = new Parse.Query("_Role");
    roleQuery.equalTo("name", roleName);
    roleQuery.first().then(function(role) {
        role.getUsers().remove(user2);
        return role.save();
    }).then(function(role) {
        return Parse.Promise.as(role);
    }, function(error) {
        return Parse.Promise.error(error);
    });
};

var deleteRelationships = function(className, pointer1, pointer2, user1, user2) {

    var promises = [],
        classObject = Parse.Object.extend(className);

    var query1  = new Parse.Query(classObject);
    query1.equalTo(pointer1, user1);
    query1.equalTo(pointer2, user2);

    var query2  = new Parse.Query(classObject);
    query2.equalTo(pointer1, user2);
    query2.equalTo(pointer2, user1);

    var mainQuery = Parse.Query.or(query1, query2);
    mainQuery.find().then(function(objects) {

        var promise = Parse.Promise.as();


        _.each(objects, function(object) {
            promise = promise.then(function() {
                object.destroy();
            });
            promises.push(promise);
        });
        return Parse.Promise.when(promises);
    }).then(function() {
        return Parse.Promise.as();
    }, function(error) {
        return Parse.Promise.error(error);
    });
};

var assignACL = function(userObj1, userObj2, booleanArray) {

    var acl = new Parse.ACL();
    acl.setReadAccess(userObj1, booleanArray[0]);
    acl.setWriteAccess(userObj1, booleanArray[1]);
    acl.setReadAccess(userObj2, booleanArray[2]);
    acl.setWriteAccess(userObj2, booleanArray[3]);
    return Parse.Promise.as(acl);
};

var sendSMS = function (phoneNumber, message, res) {

    var promise = new Parse.Promise();

    if(phoneNumber) {

        twilioClient.messages.create({
            to: phoneNumber,
            from:'+1 413-354-3515',
            body: message
        }).then(function(message) {
            if (res) res.success(message);
            promise.resolve(message);
        }, function(error) {
            if (res) res.error(error);
            promise.reject(error);
        });
        return promise;
    }
};

var getTargetUser = function(objectId) {

    Parse.Cloud.useMasterKey();

    var FriendData = Parse.Object.extend("FriendData");
    var friendQuery  = new Parse.Query(FriendData);
    friendQuery.include("user");
    return friendQuery.get(objectId).then(function(friend) {
        if(friend) {
            return Parse.Promise.as(friend);
        }
        else {
            return Parse.Promise.as(undefined);
        }
    }, function(error) {
        return Parse.Promise.error(error);
    });
};

var checkFriendshipExists = function(user1, user2, res) {

    var promise = new Parse.Promise();

    var roleName = "friendsOf_" + user1.id;

    var roleQuery = new Parse.Query("_Role");
    roleQuery.equalTo("name", roleName);
    roleQuery.first().then(function(role) {
        return role.relation("users").query().find();
    }).then(function(users) {
        var contained_in = _.contains(_.pluck(users, 'id'), user2.id);
        if (res) res.success(contained_in);
        promise.resolve(contained_in);
    }, function(error) {
        if (res) res.error(error);
        promise.reject(error);
    });

    return promise;
};

var getPrincipalCompanionTargetUser = function(friend) {

    Parse.Cloud.useMasterKey();

    var user_PrincipalCompanion = Parse.Object.extend("User_PrincipalCompanion");
    var query  = new Parse.Query(user_PrincipalCompanion);
    query.include("principal_companion");
    query.equalTo("user", friend);
    return query.first().then(function(user_PC_Object) {
        return Parse.Promise.as(user_PC_Object.get("principal_companion"));
    }, function(error) {
        return Parse.Promise.error(error);
    });
};

var checkFullAccessRequestExists = function(friendUserObj, friend, sessionToken) {

    var PendingRequest_FullAccess = Parse.Object.extend("PendingRequest_FullAccess");
    var pendingReqQuery  = new Parse.Query(PendingRequest_FullAccess);
    pendingReqQuery.equalTo("from", friendUserObj);
    pendingReqQuery.equalTo("to", friend);
    return pendingReqQuery.first({sessionToken: sessionToken}).then(function(pendingReqObj) {
        if(pendingReqObj) {
            return Parse.Promise.error({code: 700, message: 'You have already sent a request for full access to this user.'});
        }
        else {
            return Parse.Promise.as({code: 200, message: 'No error.'});
        }
    });
};

var creatependingFullAccessRequest = function(user1, user1friendObj, user2, principal_companion, relationship, additional_note) {

    var PendingRequest_FullAccess = Parse.Object.extend("PendingRequest_FullAccess");
    var pendingRequest_FullAccess = new PendingRequest_FullAccess();
    assignACL(user1, principal_companion.get("user"), [false, false, true, true]).then(function(acl) {
        pendingRequest_FullAccess.set("ACL", acl);
        pendingRequest_FullAccess.set("from", user1friendObj);
        pendingRequest_FullAccess.set("to", user2);
        pendingRequest_FullAccess.set("receiver", principal_companion);
        pendingRequest_FullAccess.set("relationship", relationship);
        pendingRequest_FullAccess.set("additionalNote", additional_note);
        pendingRequest_FullAccess.set("senderName", user1friendObj.get("name"));
        pendingRequest_FullAccess.set("senderProfilePicture", user1friendObj.get("profilePicture"));
        return pendingRequest_FullAccess.save();
    }).then(function(pendingRequest_FullAccess) {
        return Parse.Promise.as(pendingRequest_FullAccess);
    }, function(error) {
        return Parse.Promise.error(error);
    });
};

var updateFriendDataObject = function(user, sessionToken, phoneNumber) {

    var FriendData = Parse.Object.extend("FriendData");
    var friendQuery  = new Parse.Query(FriendData);
    friendQuery.include("user");
    friendQuery.equalTo("user", user);
    friendQuery.first({sessionToken: sessionToken}).then(function(friendUserObj) {
        friendUserObj.set("phoneNumber", phoneNumber);
        return friendUserObj.save();
    }).then(function(friendUserObj) {
        return updatependingFriendRequest(friendUserObj, sessionToken, phoneNumber);
    }).then(function(friendUserObj) {
        return Parse.Promise.as(friendUserObj);
    }, function(error) {
        return Parse.Promise.error(error);
    })
};

var updatependingFriendRequest = function(friendUserObj, sessionToken, phoneNumber) {

    var promises = [];

    var PendingRequest_Friend = Parse.Object.extend("PendingRequest_Friend");
    var pendingReqQuery  = new Parse.Query(PendingRequest_Friend);
    pendingReqQuery.include("from");
    pendingReqQuery.equalTo("from", friendUserObj);
    pendingReqQuery.find().then(function(pendingRequest_Friends) {

        var promise = Parse.Promise.as();

        _.each(pendingRequest_Friends, function(pendingRequest_Friend) {

            promise = promise.then(function() {

                pendingRequest_Friend.set("senderPhoneNumber", phoneNumber);
                return pendingRequest_Friend.save();
            });
            promises.push(promise);
        });
        return Parse.Promise.when(promises);
    }).then(function() {
        return Parse.Promise.as();
    }, function(error) {
        return Parse.Promise.error(error);
    });
};

var checkIfPrincipalCompanion = function(friendUserObj, friend, sessionToken) {

    var User_PrincipalCompanion = Parse.Object.extend("User_PrincipalCompanion");
    var query  = new Parse.Query(User_PrincipalCompanion);
    query.equalTo("principal_companion", friendUserObj);
    query.equalTo("user", friend);
    return query.first({sessionToken: sessionToken}).then(function(object) {
        if(!object) {
            return Parse.Promise.as(false);
        }
        else {
            return Parse.Promise.as(true);
        }
    }, function(error) {
        return Parse.Promise.error(error);
    });
};

var getFriendsforTargetUser = function(principalCompanionId, objectId, roleName) {

    var friendlist = [],
        gfullaccesslist = [];
        promises = [],
        roleName = roleName + objectId;

    return getFullAccessList(objectId).then(function(fullaccesslist) {

        gfullaccesslist = fullaccesslist;

        var query = new Parse.Query(Parse.Role);
        return query.equalTo("name", roleName).first();
    }).then(function(role) {
        return role.relation("users").query().find();
    }).then(function(friends) {

        var promise = Parse.Promise.as();

        _.each(friends, function(friend) {

            promise = promise.then(function() {

                return getfriendObject(friend);

            }).then(function(friendUserObj) {
                if(principalCompanionId.id !== friendUserObj.id) { // don't show principal companion (PC) when PC is viewing full access list for a user
                    if((roleName.includes("friendsOf_")) && !_.contains(_.pluck(gfullaccesslist, 'friendId'), friendUserObj.id))
                        friendlist.push({friendId: friendUserObj.id, friendName: friendUserObj.get('name'), friendPicture: friendUserObj.get('profilePicture')});
                    else if(roleName.includes("fullAccessTo_"))
                        friendlist.push({friendId: friendUserObj.id, friendName: friendUserObj.get('name'), friendPicture: friendUserObj.get('profilePicture')});
                }
            });
            promises.push(promise);

        });

        return Parse.Promise.when(promises);
    }).then(function() {
        return Parse.Promise.as(friendlist);
    },  function(error) {
        return Parse.Promise.error(error);
    });
};

var getfriendObject = function(userObj) {

    Parse.Cloud.useMasterKey();

    var FriendData = Parse.Object.extend("FriendData");
    var friendQuery  = new Parse.Query(FriendData);
    friendQuery.equalTo("user", userObj);
    return friendQuery.first().then(function(friend) {
        if(friend) {
            return Parse.Promise.as(friend);
        }
        else {
            return Parse.Promise.as(undefined);
        }
    }, function(error) {
        return Parse.Promise.error(error);
    });
};

var getFullAccessList = function(objectId) {

    var fullaccesslist = [],
        promises = [];

    var query = new Parse.Query(Parse.Role);
    var roleName = "fullAccessTo_" + objectId;
    return query.equalTo("name", roleName).first().then(function(role) {
        return role.relation("users").query().find();
    }).then(function(friends) {

        var promise = Parse.Promise.as();

        _.each(friends, function(friend) {

            promise = promise.then(function() {

                return getfriendObject(friend);

            }).then(function(friendUserObj) {
                // if(principalCompanionId.id !== friendUserObj.id) // don't show principal companion (PC) when PC is viewing full access list for a user
                    fullaccesslist.push({friendId: friendUserObj.id, friendName: friendUserObj.get('name'), friendPicture: friendUserObj.get('profilePicture')});
            });
            promises.push(promise);

        });

        return Parse.Promise.when(promises);
    }).then(function() {
        return Parse.Promise.as(fullaccesslist);
    }, function(error) {
        return Parse.Promise.error(error);
    });
}

var sendVerificationSMSBeforeLogin = function(phoneNumber, response) {

    var token = Math.floor(Math.random()*9000 + 1000),
        message = 'You have requested to change the password associated with your ConnectedLife account. Please enter the following 4 digit verification code ' + token + ' to successfully change your password.';

    checkTargetUserExists(phoneNumber).then(function(friendUserObj) {

        if(!friendUserObj) {
            response.error({status: 404, message: 'User not found'});
        }
        else {

            Parse.Cloud.useMasterKey();
            var userObj = friendUserObj.get("user");
            userObj.set("securityToken", token);
            return userObj.save();
        }
    }).then(function(userObj) {
        var mobilenumber = userObj.get("phoneNumber");
        return sendSMS(mobilenumber, message);
    }).then(function(message) {
        response.success({code: 200, message: 'Success'});
    }, function(error) {
        response.error(error);
    });
};