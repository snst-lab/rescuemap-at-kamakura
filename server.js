"use strict";
const util = require('./lib/util.js');

const Linebot = function(app) {
  const linebot = require('linebot');
  const line = require('@line/bot-sdk');
  const Database = require('nedb');

  this.db={};
  this.profile = {};
  
  this.db.botstatus = new Database({
      filename: '.database/botstatus',
      autoload: true
  });
  this.bot = linebot({
      channelId: process.env.CHANNEL_ID,
      channelSecret: process.env.CHANNEL_SECRET,
      channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
      verify: true
  });
  this.client = new line.Client({
      channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  });
  
  app.post('/', this.bot.parser());
  
  this.onLineEvent = function (callback){
      this.bot.on('message',event => {
            this.setMessageTemplate(event);
            this.setProfile(event,callback);
      });
      this.bot.on('postback',event => {
            this.setMessageTemplate(event);
            this.setProfile(event,callback);
      });
      this.bot.on('follow',event => {
            this.setMessageTemplate(event);
            this.setProfile(event,callback);
      });
  }
  
  this.setProfile = function(event,callback){
      this.client.getProfile(event.source.userId)
      .then((result) => {
          event.source.displayName = result.displayName;
          event.source.pictureUrl = result.pictureUrl;
          event.source.statusMessage = result.statusMessage;
          callback(event);
      })
      .catch((err) => {
          console.log('Failed to get profile.');
      });
  }
  
  this.setMessageTemplate = function(event){
      event.replyText = function(message){
           event.reply([{
              "type": "text",
              "text": message
           }]).then(data => {
                console.log('Success', data);
           }).catch(error => {
                console.log('Failed', error);
           });
      }
      
      event.replyButton = function(/*title,message,button,postback,...*/){
           var obj = {
              "type": "template",
              "altText": arguments[0],
              "template": {
                  "type": "buttons",
                  "thumbnailImageUrl": null,
                  "imageAspectRatio": "rectangle",
                  "imageSize": "cover",
                  "imageBackgroundColor": "#FFFFFF",
                  "title": arguments[0],
                  "text": arguments[1],
                  "actions": [
                      {
                        "type": "postback",
                        "label": arguments[2],
                        "data": arguments[3],
                      }
                  ]
              }
           }
           for (var i = 0; i < 3; i++) {
             if(arguments.length > 2*i+4){
                obj.template.actions[i+1]={
                  "type":  "postback",
                  "label": arguments[2*i+4],
                  "data":  arguments[2*i+5] 
                };
             }
           }
          event.reply([obj]).then(data => {
                console.log('Success', data);
           }).catch(error => {
                console.log('Failed', error);
           });
      }
      
      event.replyImage = function(message){
           event.reply([{
                "type": "image",
                "originalContentUrl": "https://pragma-curry.com/wp/wp-content/uploads/2018/07/Etherbot.png",
                "previewImageUrl": "https://pragma-curry.com/wp/wp-content/uploads/2018/07/Etherbot.png"
           }]).then(data => {
                console.log('Success', data);
           }).catch(error => {
                console.log('Failed', error);
           });
      }
      
      event.replyFlex = function(flex){
           event.reply([flex]).then(data => {
                console.log('Success', data);
           }).catch(error => {
                console.log('Failed', error);
           });
          }
      }

      this.pushLocation = function(to,lat,lng,title,address){
         this.client.pushMessage(to,{
            "type": "location",
            "title": title,
            "address": address,
            "latitude": lat,
            "longitude": lng
         })
         .then(data => {
            console.log('Success', data);
         })
         .catch(error => {
              console.log('Failed', error);
         });
      }
  
      this.readDatabase = function(lineID,callback){
          return new Promise((resolve, reject) =>  {
              this.db.botstatus.findOne({ lineid: lineID }, (err, result) =>{
                   if(err == null && result!=null){
                       resolve(result);
                   }
                   else if(err == null && result==null){
                       resolve(null);
                   }
                   else{
                       reject(err);
                   }
              });
          });
      }

      this.writeDatabase = function(/*lineID,status,hash,displayName,pictureUrl*/){
          this.db.botstatus.findOne({ lineid: arguments[0] }, (err, result) => {
              if(result==null){
                  this.db.botstatus.insert({'lineid':arguments[0] ,'status':arguments[1] ,'hash':arguments[2] ,'displayName':arguments[3] ,'pictureUrl':arguments[4] });  
              }
              else{
                  this.db.botstatus.update({ 'lineid': arguments[0] }, { $set: { status: arguments[1] ,hash: arguments[2] ,'displayName':arguments[3] ,'pictureUrl':arguments[4] }}, { multi: true });
              }
          });
      }
}

const Route = function(app,bot){
    const bodyParser = require('body-parser');
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json());

    app.use(express.static('public'));
    app.get("/", (req, res) => {
        res.sendFile(__dirname + '/public/index.html');
    }); 
    app.post('/here', (req, res) => {
        bot.db.botstatus.findOne({ hash: req.body.hash }, (err, sender) =>{
            bot.db.botstatus.find({}, (err, result)=>{
                var message = req.body.message =='' ? sender.displayName+'が位置を送信しました' : sender.displayName+'が位置を送信しました:'+ req.body.message;
                var address = req.body.address == undefined ? '住所情報無し' : req.body.address;
                for(var i in result){
                    if(result[i]["lineid"]!='undefined'){
                         bot.pushLocation( result[i]["lineid"], req.body.lat, req.body.lng, message, address);
                    }
                }
            });
        });
    });
}


const Main = function(app){
    const bot = new Linebot(app);
    const route = new Route(app,bot);

    bot.getAction = function(event,message){
        try{　
            if(typeof(message['action']) == 'undefined' || message['action']==''){
                throw 'No Action Detected.';
            }
            switch(message['action']){
            case 'showMap':
                const flex = require( "./message/flex.json" );
                event.replyFlex(flex);
                break;
            default:
                throw 'No Action Detected.';
                break;
            }

          }catch(e){
               event.replyText(e);
          }
    }

    bot.onMessageEvent = function(event,message){
        bot.getAction(event,message);
        return false;
    }
    
    this.onLineEvent = function(event){
        switch(event.type){
           case 'message':
              var message = util.queryParse(event.message.text);
              bot.onMessageEvent(event,message);
              break;
           case 'postback':
              var message = util.queryParse(event.postback.data);
              bot.onMessageEvent(event,message);
              break;
           case 'follow':
              var hash = util.sha256(event.source.userId);
              bot.writeDatabase(event.source.userId, null , hash, event.source.displayName, event.source.pictureUrl);
              break;
           default:
              event.replyText('The event type is not supported.');
              break;
        }
    }
    
    app.listen(process.env.PORT || 80, () => {
        console.log('Server is running.');
    });
    bot.onLineEvent(this.onLineEvent);
}
const express = require('express');
new Main(express());

    
