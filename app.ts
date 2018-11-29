import * as express from 'express';
import * as builder from 'botbuilder';
import { Handoff } from './handoff';
import { commandsMiddleware } from './commands';
var cognitiveServices = require('botbuilder-cognitiveservices');
var dialogFlowRecognizer = require('api-ai-recognizer');
import {ChatConnector, IChatConnectorAddress, IMessage,
    IIdentity, Message, UniversalBot, IAddress} from 'botbuilder'

//=========================================================
// Bot Setup
//=========================================================

const app = express();

// Setup Express Server
app.listen(process.env.PORT || 3978, () => {
    console.log('Server Up');
});
// Create chat bot
const connector = new builder.ChatConnector({
    appId: 'c81a71e1-f22a-4774-98e4-6cd4ea4bee5c',
    appPassword: 'uKMBL14#)rlbareVDQ859;^'
});

var recognizer = new dialogFlowRecognizer('e7e5ee6358ce4b3094a0368d43281e70');

var inMemoryStorage = new builder.MemoryBotStorage();

var intents = new builder.IntentDialog({
    recognizers: [recognizer]
});


// const bot = new builder.UniversalBot(connector, [
//     function (session, args, next) {
//         session.send('Echo ' + session.message.text);
//     }
// ]).set('storage',inMemoryStorage);

const bot = new builder.UniversalBot(connector).set('storage',inMemoryStorage);

app.post('/api/messages', connector.listen());

bot.on('conversationUpdate', function (message) {
    if (message.membersAdded) {
        message.membersAdded.forEach(function (identity) {
            if (identity.id === message.address.bot.id) {
                bot.beginDialog(message.address, '/welcome');
            }
        });
    }
});

bot.dialog('/welcome',
    function(session){
        session.send('Hi! I\'m your first level of support');
});

bot.dialog('/', intents);

intents.matches('TransferChat',
[
    function(session, args){

        console.log('Intent identified as TransferChat');

        builder.Prompts.choice(session, 'Do you want to talk to agent?','Yes|No');
    },

    function(session,results){

        console.log(results.response);

        if(results.response){
            session.dialogData.userChoice = results.response.entity;

            if('Yes' === session.dialogData.userChoice){
                session.send('Transferring chat to agent...');

                /** chat transfer to agent */
                let messageChannel = session.message.source;
                let messageID = session.message.replyToId;
                

                let usr: builder.IIdentity = {
                    id: "session.message.user",
                    name: "amitgaikwad85@gmail.com"
                }

                let bot: builder.IIdentity = {
                    id: "session.message.bot",
                    name: ""
                }

                let connectorAddress:  IChatConnectorAddress = {
                    "channelId": "skype",
                    "user": usr,
                    "bot": bot,
                    "serviceUrl": messageID

            }

            connector.startConversation(connectorAddress, (err, address) => {

                    let msgs = (new Message().text('This is ping from the bot').address(address).toMessage);

                    if(err){
                        
                    }
                    
                    connector.send(msgs[0], (err) => {

                        if(err){

                        }
                    });

                    
            });



                session.endDialog();
            }else{
                session.send('Let\'s continue chatting');
            }
        }
    }

]);

intents.matches('Default Welcome Intent', function(session, args){

    console.log('Intent found Default Welcome Intent');

    var fulfillment = builder.EntityRecognizer.findEntity(args.entities, 'fulfillment');

    if(fulfillment){
        var speech = fulfillment.entity;
        session.send(speech);
    }else{
        session.send('Sorry, I dont understand that.');
    }
});

intents.onDefault(function (session){
    session.send('Sorry ... can you please rephrase?');
    //botbuilder.Prompts.choice(session, 'Please select from following',['convert to inr','convert to JPY']) 
});

// const isAgent = (session: builder.Session) => true;

// const handoff = new Handoff(bot, isAgent);

// bot.use(
//     commandsMiddleware(handoff),
//     handoff.routingMiddleware(),
//       /* other bot middlware should probably go here */
// );

// Create endpoint for agent / call center
//app.use('/webchat', express.static('public'));

// replace this function with custom login/verification for agents
//const isAgent = (session: builder.Session) =>
 //   session.message.user.name.startsWith("Agent");

//const handoff = new Handoff(bot, isAgent);

//========================================================
// Bot Middleware
//========================================================
//bot.use(
 //   commandsMiddleware(handoff),
  //  handoff.routingMiddleware(),
    /* other bot middlware should probably go here */
//);
