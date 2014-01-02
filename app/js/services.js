'use strict';

/* Services */

var phonecatServices = angular.module('phonecatServices', ['ngResource']);

phonecatServices.factory('Phone', ['$resource',
  function($resource){
    return $resource('phones/:phoneId.json', {}, {
      query: {method:'GET', params:{phoneId:'phones'}, isArray:true}
    });
  }]);


angular.module('ChatXMPP', [], function($provide){
	$provide.service('chat', function(){
		var self = this;
		this.chat_status = null;
		this.connection = null;
		this.username = null;
		// init data server chat
		this.init = function(url){
			self.connection = new Strophe.Connection(url);
		};

		// connect to server XMPP
		this.connect = function(url,jid, password, callback){
			console.log('come connect' + jid + ' ,' + password);
			self.init(url);
			self.connection.connect(jid, password, callback);
			
		};

		this.setUsername = function(){
			self.username = self.connection.jid;
		}
		// disconnect from server XMPP
		this.disconnect = function(){
			self.connection.disconnect();
		};

		// add handle 
		this.addHandle = function(type, callback){
			console.log('come addHandle');
			self.connection.addHandler(callback, null, type, null, null, null);
		};

		this.addHandleCreateRoom = function(type, id, callback){
			console.log('come addHandle');
			self.connection.addHandler(callback, null, type, null, id, null);
		};
		// callback function after connect
		this.onConnect = function(status){
			console.log(status);
			return status;
		};

		// receive message
		this.onReceive = function(){
			// always return true 
			return true
		};

		// send message
		this.onSendSMS = function(to, message, callback){
			var reply = $msg({to: to, from: self.connection.jid, type: 'chat'}).c('body').t(message);
			self.connection.send(reply.tree());
			callback();
		};

		this.onSendImage = function(to, imageURL, callback){
			var reply = $msg({to: to, from: self.connection.jid, type: 'chat'}).c('body').t('send file test').up().c('file').t(imageURL);
			self.connection.send(reply.tree());
			callback(reply.tree());
		};	

		// send presence
		this.sendPre = function(){
			self.connection.send($pres().tree());
		};

		// send getUserName
		this.getUserName = function(){
			var a = self.username.split('@');
			return a[0];
		};
	});
});