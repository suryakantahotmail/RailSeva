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
//console.log("Current date(YYYYMMDD):" + today);
var now = new Date();
now = date.format(now, 'HHmmss');   //HH-Hours-24   mm-Minutes      ss-seconds 
//console.log("Current time(HHmmss):" + now);

//Railway-API Logic
var railway = require("railway-api");
railway.setApikey('9dkmoce4');


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
    now = new Date();
    now = date.format(now, 'HHmmss');   //HH-Hours-24   mm-Minutes      ss-seconds 
    session.send('Hello...!!! ');
    if (now < '120000' && now >= '040000')
        session.send("Good Morning");
    if(now <= '170000' && now >= '120000')
        session.send("Good Afternoon");
    if(now <= '220000' && now > '170000')
        session.send("Good evening");
    session.send('How may I help you?');
})
//getRailName_no
.matches('getRailName_No', (session, args) => {
    var from, to, curr_station, source_station, dest_station, invalid_dest, fast_flag;
    curr_station = 'SC';
    var msg1 = session.message.text.replace(/[^a-zA-Z ]/g, "");     //get the user inputted text without any special character
    var msg_arr = msg1.match(/\S+/gi);		//convert the message into array
    for(var i=0;i<msg_arr.length;i++){
        if(msg_arr[i] == 'from'){
            from = msg_arr[i+1];            //get from station
        }
        if(msg_arr[i] == 'to'){
            to = msg_arr[i+1];              //get destination station
            if(to == undefined)
                to = "";
        }
        if(msg_arr[i].indexOf('fast') >= 0)
            fast_flag = 'X';                //User query is to get the fastest train
    }
    if(from == "")
        from = curr_station;
    if(to == "" || to == undefined)
        invalid_dest = 'X';
    
    if(invalid_dest == 'X'){
        session.send('I think you forget to mention the destination station... Please try again');
    }
    if(fast_flag == 'X'){
        var railName_No = getFastestTrain(from, to);
    }
    var i;
    if(from != "" && to != "" && fast_flag != 'X'){
        railway.trainBetweenStations(from, to, function (err, res) {
            if(res.response_code == 200){
                session.send("I found " + res.total + " trains which are available to go from " + from + " to " + to);
				for(i=0;i< res.total;i++){
					session.send(i+1 + '. ' + res.train[i].number + ", " + res.train[i].name + ", Travel Time: " + res.train[i].travel_time + 'Hrs');
				}
			}else{
                session.send("No trains available from "+ from + "to " + to);
            }
        });
    }
    if(fast_flag == 'X'){
        session.send("Found one train with travel time " + res.train[0].travel_time + "hrs");
        session.send("Train Name: " + res.train[0].name + "/nTrain Number: " + res.train[0].number);
    }



})
//getTime
.matches('getTime', (session, args) => {
    if(session.message.text.indexOf("departure")>= 0){

        session.send("Departure time is 22:10");
    }
    if(session.messahe.text.indexOf("arrival")>= 0){
        session.send("Arrival time 23:50");
    }
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

