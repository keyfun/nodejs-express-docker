'use strict';

var https = require('https');
var http = require('http');
var request = require('request');
var forceSsl = require('express-force-ssl');
const express = require('express');
const bodyParser = require('body-parser');

// bot framework
var restify = require('restify');
var builder = require('botbuilder');

var dotenv = require('dotenv');
dotenv.load();

// Constants
const PORT = 3000;
const HOST = '0.0.0.0';

// App
const app = express();
app.use(bodyParser.urlencoded({"extended": false}));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Hello world abc\n');
});


// bot framework
// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || PORT, function () {
   console.log('%s listening to %s', server.name, server.url); 
});

console.log('AppID: %s', process.env.MICROSOFT_APP_ID);
console.log('AppPassword: %s', process.env.MICROSOFT_APP_PASSWORD);

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

var DialogLabels = {
    Hotels: 'Hotels',
    Flights: 'Flights',
    Support: 'Support'
};

// Receive messages from the user and respond by echoing each message back (prefixed with 'You said:')
var bot = new builder.UniversalBot(connector, [
  function (session) {
    console.log('send message: %s', session.message.text);

    if (session.message.text.toLowerCase() === 'carousel') {
      sendCarousel(session);
    } else if (session.message.text.toLowerCase() === 'action') {
      promptChoice(session);
    } else {
      session.send("You said: %s", session.message.text);
    }
  },
  function (session, result) {
        if (!result.response) {
            // exhausted attemps and no selection, start over
            session.send('Ooops! Too many attemps :( But don\'t worry, I\'m handling that exception and you can try again!');
            return session.endDialog();
        }

        // on error, start over
        session.on('error', function (err) {
            session.send('Failed with message: %s', err.message);
            session.endDialog();
        });

        // continue on proper dialog
        var selection = result.response.entity;
        switch (selection) {
            case DialogLabels.Flights:
                return session.beginDialog('flights');
            case DialogLabels.Hotels:
                return session.beginDialog('hotels');
        }
    }
]);

bot.dialog('flights', require('./flights'));
bot.dialog('hotels', require('./hotels'));
bot.dialog('support', require('./support'))
    .triggerAction({
        matches: [/help/i, /support/i, /problem/i]
    });

// log any bot errors into the console
bot.on('error', function (e) {
    console.log('And error ocurred', e);
});

function promptChoice(session) {
  // prompt for search option
  builder.Prompts.choice(
    session,
    'Are you looking for a flight or a hotel?',
    [DialogLabels.Flights, DialogLabels.Hotels],
    {
      maxRetries: 3,
      retryPrompt: 'Not a valid option'
    });
}

function getCardsAttachments(session) {
    return [
        new builder.HeroCard(session)
            .title('NeoStrata')
            .subtitle('更生活膚啫喱面膜')
            .text('守護毛孔第一步，就是清除老角質，令油脂順利排出！但磨砂顆粒粗糙，極易搓傷肌膚；用分子最小、深透力強的專利AHAs甘醇酸，能溶解老角質和多餘油脂，還能恢復28日更生週期，肌膚更細緻光滑，100%*用家見證成效！')
            .images([
                builder.CardImage.create(session, 'https://supappdev.neoderm.com.hk/PublicImages/ItemType/8203%20%28NS%20gel%20plus%29.png')
            ])
            .buttons([
                builder.CardAction.openUrl(session, 'https://supappdev.neoderm.com.hk/Web/jtbd/product/detail/701', '了解更多')
            ]),

        new builder.HeroCard(session)
            .title('Endocare')
            .subtitle('強效活肌修復精華SCA40')
            .text('西班牙地中海特種蝸牛的修復力有多神奇？研究發現，其分泌液能於短短48小時內，自體修復受傷組織至原有健康狀態！憑此成果，Endocare研創出SCA活肌修復因子，修護受損甚至老化肌膚細胞，刺激膠原母體不停新生，鞏固肌底彈力蛋白，提升彈性，顯著減淡皺紋。')
            .images([
                builder.CardImage.create(session, 'https://supappdev.neoderm.com.hk/PublicImages/ItemType/312826%20%28Endocare%20Concentrate%20SCA40%29.png')
            ])
            .buttons([
                builder.CardAction.openUrl(session, 'https://supappdev.neoderm.com.hk/Web/jtbd/product/detail/702', '了解更多')
            ]),

        new builder.HeroCard(session)
            .title('RevitaLash®')
            .subtitle('激活美睫增生精華')
            .text('要擁有電力十足的黃金10mm長立體美睫，就要像護膚一樣護養睫毛 。由美國眼科醫生研創的RevitaLash® Advanced，其突破性專利配方榮獲多項國際獎項，醫學實證能同步強化睫毛、減少折斷，重整睫毛生長週期，新生濃翹強韌睫毛，超過98%*用家見證21日真美睫復活。')
            .images([
                builder.CardImage.create(session, 'https://supappdev.neoderm.com.hk/PublicImages/ItemType/REV2979S%20Revitalash%20eye%20lash%201ml.png')
            ])
            .buttons([
                builder.CardAction.openUrl(session, 'https://supappdev.neoderm.com.hk/Web/jtbd/product/detail/348', '了解更多')
            ]),

        new builder.HeroCard(session)
            .title('elyze RF深層擊脂療程')
            .subtitle('針對難減部位，單極射頻深入皮下20mm脂肪層，發放46℃熱力縮小脂肪細胞，即現局部修形成效！')
            .text('要擁有美好身形，不能盲目追求「瘦」，還要有凹凸有致的緊實曲線！不過要達到勻稱線條，也真不容易…無論如何努力運動和節食，也擺脫不了拜拜肉、肚腩、粗腿等惱人的局部脂肪！')
            .images([
                builder.CardImage.create(session, 'https://supappdev.neoderm.com.hk/PublicImages/JTBD/elyze/JTBD_elyze_RF_banner1.jpg')
            ])
            .buttons([
                builder.CardAction.openUrl(session, 'https://supappdev.neoderm.com.hk/Web/jtbd/slimming/elyze', '了解更多')
            ])
    ];
}

function sendCarousel(session) {
  var cards = getCardsAttachments();

    // create reply with Carousel AttachmentLayout
    var reply = new builder.Message(session)
        .attachmentLayout(builder.AttachmentLayout.carousel)
        .attachments(cards);

    session.send(reply);
}






app.get('/webhook', function(req, res) {
  if (req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === 'hehe_is_fun') {
    console.log("Validating webhook");
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);          
  }  
});

app.post('/webhook', function (req, res) {
  var data = req.body;

  // Make sure this is a page subscription
  if (data.object === 'page') {

    // Iterate over each entry - there may be multiple if batched
    data.entry.forEach(function(entry) {
      var pageID = entry.id;
      var timeOfEvent = entry.time;

      // Iterate over each messaging event
      entry.messaging.forEach(function(event) {
        if (event.message) {
          receivedMessage(event);
        } else {
          console.log("Webhook received unknown event: ", event);
        }
      });
    });

    // Assume all went well.
    //
    // You must send back a 200, within 20 seconds, to let us know
    // you've successfully received the callback. Otherwise, the request
    // will time out and we will keep trying to resend.
    res.sendStatus(200);
  }
});
  
function receivedMessage(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  console.log("Received message for user %d and page %d at %d with message:", 
    senderID, recipientID, timeOfMessage);
  console.log(JSON.stringify(message));

  var messageId = message.mid;

  var messageText = message.text;
  var messageAttachments = message.attachments;

  if (messageText) {

    // If we receive a text message, check to see if it matches a keyword
    // and send back the example. Otherwise, just echo the text we received.
    switch (messageText) {
      case 'generic':
        sendGenericMessage(senderID);
        break;

      default:
        sendTextMessage(senderID, messageText);
    }
  } else if (messageAttachments) {
    sendTextMessage(senderID, "Message with attachment received");
  }
}

function sendGenericMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [{
            title: "rift",
            subtitle: "Next-generation virtual reality",
            item_url: "https://www.oculus.com/en-us/rift/",               
            image_url: "http://messengerdemo.parseapp.com/img/rift.png",
            buttons: [{
              type: "web_url",
              url: "https://www.oculus.com/en-us/rift/",
              title: "Open Web URL"
            }, {
              type: "postback",
              title: "Call Postback",
              payload: "Payload for first bubble",
            }],
          }, {
            title: "touch",
            subtitle: "Your Hands, Now in VR",
            item_url: "https://www.oculus.com/en-us/touch/",               
            image_url: "http://messengerdemo.parseapp.com/img/touch.png",
            buttons: [{
              type: "web_url",
              url: "https://www.oculus.com/en-us/touch/",
              title: "Open Web URL"
            }, {
              type: "postback",
              title: "Call Postback",
              payload: "Payload for second bubble",
            }]
          }]
        }
      }
    }
  };  

  callSendAPI(messageData);
}

function sendTextMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText
    }
  };

  callSendAPI(messageData);
}

function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.7/me/messages',
    qs: { access_token: "EAAEqyq77FlABAC3CJQkaoRtto1gXE6AdLiBG0SVgfHGXgb16ozTdT7ZA7qgVK187FT3ZB4WVZBCtFu39TKdlNZC6ZBB2eZBld4OHnWBmTXRwqInCfN2Cgy1jxXdJi08ZAftH5dlMlJdoKktRvyexg2b2cpYj6x9LLkjX5nmGZBbTZBAZDZD" },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      console.log("Successfully sent generic message with id %s to recipient %s", 
        messageId, recipientId);
    } else {
      console.error("Unable to send message.");
      console.error(response);
      console.error(error);
    }
  });  
}

function receivedPostback(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfPostback = event.timestamp;

  // The 'payload' param is a developer-defined field which is set in a postback 
  // button for Structured Messages. 
  var payload = event.postback.payload;

  console.log("Received postback for user %d and page %d with payload '%s' " + 
    "at %d", senderID, recipientID, payload, timeOfPostback);

  // When a postback is called, we'll send a message back to the sender to 
  // let them know it was successful
  sendTextMessage(senderID, "Postback called");
}


// http.createServer(app).listen(PORT);
app.use(forceSsl);

// console.log(`Running on http://${HOST}:${PORT}`);