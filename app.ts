import * as express from 'express';
import * as builder from 'botbuilder';
import { Handoff } from './handoff';
import { commandsMiddleware } from './commands';

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

var inMemoryStorage = new builder.MemoryBotStorage();

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
        session.send('Hi! You either talk to me or to agent');
});

bot.dialog('/', 

    function(session){
        console.log(session.message.text);
        session.send('You decided to talk to ' + session.message.text);

        if(session.message.text.match('Talk to Agent')){
            
        }   

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
