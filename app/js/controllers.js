'use strict';

/* Controllers */
//$routeParams

var phonecatControllers = angular.module('phonecatControllers', []);


phonecatControllers.controller('ChatCtrl', ['$scope', 'chat', '$http', '$location', 
  function($scope,chat, $http, $location){
      console.log(chat);
      $scope.title = 'Test chat Ejabberd';

      // test ng-options
        $scope.datas = [
          {"jid" : 'user2@192.168.2.110', 'text' : 'user2'},
          {"jid" : 'user1@192.168.2.110', 'text' : 'user1'},
          {"jid" : 'admin@192.168.2.110', 'text' : 'admin'},
          {"jid" : 'admin1@192.168.2.110', 'text' : 'admin1'},
        ]

        $scope.change = function(){
          if ($scope.selected != null) {
            $scope.isUser = false;
          }
        }

      // init variables
      if (chat.chat_status == 5) {
        $scope.username = chat.username;
        // if connected
        console.log('connected');
        $scope.msg = ''
        $scope.json = [];
        $scope.isUser = true;
        
        chat.addHandle('message',function(msg){

          var from = msg.getAttribute('from');
          var elems = msg.getElementsByTagName('body');
          var file = msg.getElementsByTagName('file');
          var x = msg.getElementsByTagName('x');
          // console.log(x[0].getAttribute('xmlns'));
          var type = msg.getAttribute('type');

          if (type == 'chat'){
            // message normal
            if (Strophe.getText(file[0]) == null || Strophe.getText(file[0]) == undefined){
              // var content = {"send" : from, "content" : Strophe.getText(elems[0]), "class" : "recv"};
              // $scope.json.push(content);
              $('#body_top').append('<div class="recv"><div class="send_content"><span>'+ from +'</span><span>'+ Strophe.getText(elems[0]) +'</span></div></div>');
              $('#body_top').animate({scrollTop: $("#body_top")[0].scrollHeight}, 1000);
              $scope.playSound('img/sound/facebook_chat_sound.mp3');
              setTimeout(function(){ $scope.$apply($scope.json);});
              $scope.isUser = false;
              // $scope.change_user(from);
              setTimeout(function(){ $scope.$apply();});
              
            }else{
              $('#body_top').append('<div class="recv"><div class="send_content"><span>'+ from +'</span><a href="'+ Strophe.getText(file[0]) +'" target="_tab"><img src="'+ Strophe.getText(file[0]) +'" style="width: 60px;height:60px;" class="thumbnail"></a></div></div>');
              $('#body_top').animate({scrollTop: $("#body_top")[0].scrollHeight}, 1000);
              $scope.playSound('img/sound/facebook_chat_sound.mp3');
            }
          }else if (type == 'normal'){

                // mediatedInvite
                var invite = x[0].getElementsByTagName('invite');
                var from = Strophe.getNodeFromJid(invite[0].getAttribute('from'));
                var rq = window.confirm(from + " would like to invite you to join a group chat ?");
                if (rq == true){
                // if user accept
                  var roomName = Strophe.getNodeFromJid(x[1].getAttribute('jid'));
                  location.href = window.location.origin + '#/room/' + roomName;
                }
          }else if (type == undefined || type == null){
            if (x[0].getAttribute('xmlns') == 'jabber:x:conference'){
                // directInvite
                // message invite to join group chat
               var rq = window.confirm(from + " would like to invite you to join a group chat ?");
               if (rq == true){
                // if user accept
                  var roomName = Strophe.getNodeFromJid(x[0].getAttribute('jid'));
                  location.href = window.location.origin + '#/room/' + roomName;
               }
            }
          }
          return true;
        });

        $scope.send_sms = function(){
          if ($scope.selected != null) {
               var send_to = $scope.selected.jid;
              // var send_to = 'admin@192.168.2.110/htk'
              console.log('vao send_sms');
              console.log(send_to);
              chat.onSendSMS(send_to, $scope.msg, function(){
                // var add = {"send": chat.connection.jid, "content" : $scope.msg, "class" : "send"}
                // $scope.json.push(add);
                $('#body_top').append('<div class="send"><div class="send_content"><span>'+ chat.connection.jid +'</span><span>'+ $scope.msg +'</span></div></div>');
                $('#body_top').animate({scrollTop: $("#body_top")[0].scrollHeight}, 1000);
              });
          }
        }  

        $scope.change_user = function(user){
             // console.log(user.match(/[^@]+/);
        }

        $scope.$watch('image', function(){
           if ($scope.image != null){
            var image = $scope.image;
            $scope.upload(image, function(data){
                if (data.status == 200){
                    // send data
                    var send_to = $scope.selected.jid;
                    chat.onSendImage(send_to, data.src, function(result){
                      $('#body_top').append('<div class="send"><div class="send_content"><span>'+ chat.connection.jid +'</span><a href="'+ data.src +'" target="_tab"><img src="'+ data.src +'" style="width: 60px;height:60px;" class="thumbnail"></a></div></div>');
                      $('#body_top').animate({scrollTop: $("#body_top")[0].scrollHeight}, 1000);

                    });
                }
            })
           }
         });

        $scope.upload = function(image, callback){
            console.log(image);
            console.log('vao up load');
          var formData = new FormData();
          if(image.file != null && image.file != undefined){
               formData.append('image', image.file, image.file.name);
               console.log(image.file);
              $http.post('/upload', formData, {
                  headers: { 'Content-Type': undefined },
                  transformRequest: angular.identity
              }).success(function(result) {
                   callback(result);
              }).error(function(error){
                  console.log(error);
              });
          }
        }


        var con = chat.connection;
        // init
        con.muc.init(con);

        $scope.createRoom = function(){
          if ($scope.rName != null || $scope.rName != undefined){
            var roomServer  = $scope.rName + '@conference.192.168.2.110';
            var d = $pres({"to":roomServer + '/' + chat.getUserName(), "from": chat.connection.jid}).c("x",{"xmlns":"http://jabber.org/protocol/muc"});
            con.send(d.tree());
            var id = $scope.rName.replace(/\s/g, '');
             // Ways 1 :
              // con.muc.createInstantRoom(roomServer);
              // location.href = window.location.origin + "/#/room/" + $scope.rName;

            $('#createRoom').modal('hide');
            var iq = $iq({'id': id, 'from': chat.connection.jid, 'to': roomServer, 'type':'get'}).c('query', {'xmlns':'http://jabber.org/protocol/muc#owner'});
            con.send(iq.tree());
            chat.addHandleCreateRoom('iq', id, function(msg){
              $(msg).find('instructions').remove();
              $(msg).find('title').remove();
              var from = $(msg).attr('from');
              var to = $(msg).attr('to');
              $(msg).attr('from', to);
              $(msg).attr('to', from);
              $(msg).attr('type', 'set');
              $(msg).find('x').attr('type', 'submit');
              $(msg).find("field[var='muc#roomconfig_roomname']").find('value').text($scope.rName);
              $(msg).find('field').each(function(){
                 $(this).removeAttr('type');
                 $(this).removeAttr('label');
                 $(this).find('option').remove();
              });
              con.send(msg);
              chat.addHandleCreateRoom('iq', id, function(msg2){
                  if($(msg2).attr('type') == 'result'){
                    location.href = window.location.origin + "/#/room/" + $scope.rName;
                  }
              });
            });
          }
        }

        // jquery enter to send sms 
        $('.input').keypress(function (e) {
          if (e.which == 13) {
            console.log('entered');
            $('#submit_send').trigger('click');
            $scope.msg = '';
            setTimeout(function(){ $scope.$apply($scope.msg);});
            }
        });

      }else{
        // if not connected
        location.href = window.location.origin + "/#/";
      }

  }]); // end controller

phonecatControllers.controller('LoginCtrl', ['$scope', 'chat',
  function($scope, chat){
    console.log(chat.chat_status);
    $scope.jid = 'user1@192.168.2.110';
    $scope.password = '123';
    $scope.button = 'connect';
    var BOSH_SERVICE = 'http://192.168.2.110:5280/http-bind';
    //click connect button
    $scope.connect = function(){
        if ($scope.button == 'connect'){
          chat.connect(BOSH_SERVICE, $scope.jid, $scope.password, function(status){
            console.log(status);
            chat.chat_status  = status;
            if (status == 5){
              chat.setUsername();
              chat.sendPre();
              location.href = window.location.origin + "/#/chats";
            }
          });
        }// end if
      } // end connect

  }]);

function ChatRoomCtrl ($scope, chat, $http, $routeParams) {
        if (chat.chat_status == 5) {
          $scope.msg
          $scope.username = chat.username;
          $scope.roomName = $routeParams.roomName + '@conference.192.168.2.110';
          console.log($scope.roomName);
          $scope.datas = [
            {"jid" : 'user2@192.168.2.110', 'text' : 'user2'},
            {"jid" : 'user1@192.168.2.110', 'text' : 'user1'},
            {"jid" : 'admin@192.168.2.110', 'text' : 'admin'},
            {"jid" : 'admin1@192.168.2.110', 'text' : 'admin1'},
          ]
        // handle Mesage from room
        var msg_handler_cb = function(msg){
          console.log('come msg_handler_cb');
          var from = msg.getAttribute('from');
          var elems = msg.getElementsByTagName('body');
          var file = msg.getElementsByTagName('file');
          var x = msg.getElementsByTagName('x');
          var type = msg.getAttribute('type');

          if (type == 'groupchat'){
            // message normal
            if (from.split('/')[1] != chat.getUserName()){
              if (Strophe.getText(file[0]) == null || Strophe.getText(file[0]) == undefined){
                
                  $('#body_group').append('<div class="recv"><div class="send_content"><span>'+ from +'</span><span>'+ Strophe.getText(elems[0]) +'</span></div></div>');
                  $('#body_group').animate({scrollTop: $("#body_group")[0].scrollHeight}, 1000);
                  $scope.playSound('img/sound/facebook_chat_sound.mp3');
                  setTimeout(function(){ $scope.$apply();});
                
              }else{
                $('#body_group').append('<div class="recv"><div class="send_content"><span>'+ from +'</span><a href="'+ Strophe.getText(file[0]) +'" target="_tab"><img src="'+ Strophe.getText(file[0]) +'" style="width: 60px;height:60px;" class="thumbnail"></a></div></div>');
                $('#body_group').animate({scrollTop: $("#body_group")[0].scrollHeight}, 1000);
                $scope.playSound('img/sound/facebook_chat_sound.mp3');
              }
            }
          }
          return true;
        } 


        var con = chat.connection;
        // init
        con.muc.init(con);

        // join to room
        con.muc.join($scope.roomName, chat.getUserName(), msg_handler_cb, null, null, null, null);

        // send message to room
        // con.muc.groupchat('room1@conference.192.168.2.110', chat.username);

        // get list user of room
        // con.muc.queryOccupants('room1@conference.192.168.2.110',
        //   function(success){
        //       console.log('query succesfully');
        //       console.log(success);
        //   },
        //   function(error){
        //       console.log('error');
        //   });
        
        $scope.send_sms = function(){
            con.muc.groupchat($scope.roomName, $scope.msg);
            $('#body_group').append('<div class="send"><div class="send_content"><span>'+ chat.connection.jid +'</span><span>'+ $scope.msg +'</span></div></div>');
            $('#body_group').animate({scrollTop: $("#body_group")[0].scrollHeight}, 1000);

        }


        $scope.$watch('image', function(){
           if ($scope.image != null){
            var image = $scope.image;
            $scope.upload(image, function(data){
                if (data.status == 200){
                    // send data
                  var reply = $msg({to: $scope.roomName, from: con.jid, type: 'groupchat'}).c('body').t('send file test').up().c('file').t(data.src);
                  con.send(reply.tree());
                  $('#body_group').append('<div class="send"><div class="send_content"><span>'+ chat.connection.jid +'</span><a href="'+ data.src +'" target="_tab" ><img src="'+ data.src +'" style="width: 60px;height:60px;" class="thumbnail"></div></div>');
                  $('#body_group').animate({scrollTop: $("#body_group")[0].scrollHeight}, 1000);
                  $scope.playSound('img/sound/facebook_chat_sound.mp3');
                }
            })
           }
         });

        $scope.upload = function(image, callback){
          
          console.log('vao up load');
          var formData = new FormData();
          if(image.file != null && image.file != undefined){
               formData.append('image', image.file, image.file.name);
               console.log(image.file);
              $http.post('/upload', formData, {
                  headers: { 'Content-Type': undefined },
                  transformRequest: angular.identity
              }).success(function(result) {
                   callback(result);
              }).error(function(error){
                  console.log(error);
              });
          }
        }

        $scope.sendInvite = function(){
          if ($scope.selected != '' && $scope.selected != undefined){
            con.muc.directInvite($scope.roomName  , $scope.selected.jid , 'Hey, do you want join my room ?');
          }else{
            alert('Please choose username to invite ?');
          }
        }

        con.muc.configure($scope.roomName,function(msg){
          console.log('require config');
          console.log(msg);
        }, function(error){
          console.log('error');
          console.log(error);
        });


        // jquery enter to send sms 
        $('.input').keypress(function (e) {
          if (e.which == 13) {
            console.log('entered');
            $('#submit_send').trigger('click');
            $scope.msg = '';
            setTimeout(function(){ $scope.$apply($scope.msg);});
            }
          });

        $(window).unload(function() {
          // con.muc.leave('room1@conference.192.168.2.110', chat.getUserName());
          con.disconnect();
        });
      }else{
        // if not connected
        location.href = window.location.origin + "/#/";
      }
}

function rootController ($rootScope){
  $rootScope.playSound = function(soundfile) {
   document.getElementById("dummy").innerHTML=
   "<embed src=\""+soundfile+"\" hidden=\"true\" autostart=\"true\" loop=\"false\" />";
  }
}