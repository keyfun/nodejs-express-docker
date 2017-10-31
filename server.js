'use strict';

// bot framework
var restify = require('restify');
var builder = require('botbuilder');

var dotenv = require('dotenv');
dotenv.load();

// Constants
const PORT = 3000;
const HOST = '0.0.0.0';


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
      var datetime = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
      session.send("You said: %s at %s", session.message.text, datetime);
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
      retryPrompt: 'Not a valid option',
      listStyle: builder.ListStyle.button
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
