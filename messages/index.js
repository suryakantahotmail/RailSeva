/*-----------------------------------------------------------------------------
This template demonstrates how to use an IntentDialog with a LuisRecognizer to add 
natural language support to a bot. 
For a complete walkthrough of creating this type of bot see the article at
https://aka.ms/abs-node-luis
-----------------------------------------------------------------------------*/
"use strict";
var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");
var path = require('path');
//Date Logic
var date = require('date-and-time');        //date-and-time API
var today = new Date();
today = date.format(today, 'YYYYMMDD');
console.log("Current date(YYYYMMDD):" + today);
var now = new Date();
now = date.format(now, 'HHmmss');   //HH-Hours-24   mm-Minutes      ss-seconds 
console.log("Current time(HHmmss):" + now);

//Railway-API Logic
var railway = require("railway-api");
var rail_api_key = '9dkmoce4';


var useEmulator = (process.env.NODE_ENV == 'development');

var connector = useEmulator ? new builder.ChatConnector() : new botbuilder_azure.BotServiceConnector({
    appId: process.env['MicrosoftAppId'],
    appPassword: process.env['MicrosoftAppPassword'],
    stateEndpoint: process.env['BotStateEndpoint'],
    openIdMetadata: process.env['BotOpenIdMetadata']
});

var bot = new builder.UniversalBot(connector);
bot.localePath(path.join(__dirname, './locale'));

// Make sure you add code to validate these fields
var luisAppId = process.env.LuisAppId;
var luisAPIKey = process.env.LuisAPIKey;
var luisAPIHostName = process.env.LuisAPIHostName || 'westus.api.cognitive.microsoft.com';

const LuisModelUrl = 'https://' + luisAPIHostName + '/luis/v1/application?id=' + luisAppId + '&subscription-key=' + luisAPIKey;

// Main dialog with LUIS
var recognizer = new builder.LuisRecognizer(LuisModelUrl);
var intents = new builder.IntentDialog({ recognizers: [recognizer] })
/*
.matches('<yourIntent>')... See details at http://docs.botframework.com/builder/node/guides/understanding-natural-language/
*/
//None
.matches('None', (session, args) => {
    session.send('Apologies... I don\'t have sufficient information related to your query.');
})
//Queries related to Bot
.matches('aboutBot', (session, args) => {
    session.send('This query is related to me. But I will not allow you to access my privacy');
})
//Greetings

.matches('Greetings', (session, args) => {
    var greet;
    session.send('Hello...!!! ');
    if (now < '120000' && now >= '040000')
        session.send("Good Morning");
    if(now <= '170000' && now >= '120000')
        session.send("Good Afternoon");
    if(now <= '220000' && now > '170000')
        session.send("Good evening");
    session.send('How may I help you?');
    session.sendTyping("Hello Again...How may I help you?");
})
//getRailName_no
.matches('getRailName_No', (session, args) => {
        session.send(JSON.stringify(args));
        session.send(session.entities.entity.text);
        session.send(session.entities.type.text);
/*    for(var temp in session)
        session.send(temp);

*/
})
//getTime
.matches('getTime', (session, args) => {
    session.send('get time');
})
//

.onDefault((session) => {
    session.send('Sorry, I did not understand \'%s\'.', session.message.text);
});

bot.dialog('/', intents);    

if (useEmulator) {
    var restify = require('restify');
    var server = restify.createServer();
    server.listen(3978, function() {
        console.log('test bot endpont at http://localhost:3978/api/messages');
    });
    server.post('/api/messages', connector.listen());    
} else {
    module.exports = { default: connector.listen() }
}

