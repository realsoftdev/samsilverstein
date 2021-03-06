/*
 Copyright (C) 2015  PencilBlue, LLC
 
 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.
 
 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.
 
 You should have received a copy of the GNU General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

module.exports = function (pb) {

  //pb dependencies
  var util = pb.util;

  /**
   * Creates a new user
   */
  function NewUser() {
  }
  util.inherits(NewUser, pb.BaseController);

  NewUser.prototype.render = function (cb) {
	var self = this;

	this.getJSONPostParams(function (err, post) {
	  var message = self.hasRequiredParams(post, self.getRequiredFields());
	  if (message) {
		cb({
		  code: 400,
		  content: pb.BaseController.apiResponse(pb.BaseController.API_ERROR, message)
		});
		return;
	  }

	  if (!pb.security.isAuthorized(self.session, {
		admin_level: post.admin
	  })) {
		cb({
		  code: 400,
		  content: pb.BaseController.apiResponse(pb.BaseController.API_ERROR, self.ls.get(
				  'INSUFFICIENT_CREDENTIALS'))
		});
		return;
	  }

	  var password = post.password;
	  var user = pb.DocumentCreator.create('user', post);


	  var UsersService = require('../../../services/UsersService')(pb);
	  if (!UsersService.usernameIsValid(user.username)) {
		cb({
		  code: 400,
		  content: pb.BaseController.apiResponse(pb.BaseController.API_ERROR, 'not correctly username')
		});
		return;
	  }

	  pb.users.isUserNameOrEmailTaken(user.username, user.email, post.id, function (err, isTaken) {
		if (util.isError(err) || isTaken || usernameIsValid(user.usernam)) {
		  cb({
			code: 400,
			content: pb.BaseController.apiResponse(pb.BaseController.API_ERROR, self.ls.get('EXISTING_USERNAME'))
		  });
		  return;
		}

		var dao = new pb.DAO();

		dao.save(user, function (err, result) {
		  if (util.isError(err)) {
			cb({
			  code: 500,
			  content: pb.BaseController.apiResponse(pb.BaseController.API_ERROR, self.ls.get('ERROR_SAVING'))
			});
			return;
		  }
		  var objToSend = {
			email: result.email,
			username: result.username,
			password: password
		  };

		  self.sendNotifications(objToSend, function (err, res) {
			if (err) {
			  cb({
				content: pb.BaseController.apiResponse(pb.BaseController.API_FAILURE, self.ls.get('USER_CREATED'), err)
			  });
			} else {
			  cb({
				content: pb.BaseController.apiResponse(pb.BaseController.API_SUCCESS, self.ls.get('USER_CREATED'), res)
			  });
			}
		  });
		});

	  });
	});
  };


  NewUser.prototype.sendNotifications = function (response, cb) {

	var NotificationService = require('./../../../services/NotificationService.js')(pb);
	var notificationService = new NotificationService();

	pb.settings.get('email_settings', function (err, options) {

	  var message = options.verification_content;

	  var encodedUsername = encodeURI("[[username]]");
	  var encodedPassword = encodeURI("[[password]]");
	  var usernamePattern = new RegExp(encodedUsername, "g");
	  var passwordPattern = new RegExp(encodedPassword, "g");

	  message = encodeURI(message).toString();
	  message = message.replace(usernamePattern, response.username);
	  message = message.replace(passwordPattern, response.password);

	  message = decodeURI(message);

	  iRes = {
		to: response.email,
		subject: options.verification_subject,
		layout: message
	  };

	  notificationService.sendEmail(iRes, function (err, data) {
		cb(err, data);
	  });
	});

  };

  NewUser.prototype.getRequiredFields = function () {
	return ['username', 'email', 'password', 'confirm_password', 'admin'];
  };

  NewUser.getRoutes = function (cb) {

	var routes = [{
		method: 'post',
		path: "/actions/admin/users",
		auth_required: true,
		access_level: pb.SecurityService.ACCESS_ADMINISTRATOR
	  }];

	cb(null, routes);
  };

  //exports
  return NewUser;
};
