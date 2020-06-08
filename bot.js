var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');
require('dotenv').config();

const PREFIX = '!';

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';
// Initialize Discord Bot
var bot = new Discord.Client({
   token: auth.token,
   autorun: true 
});


function getQuote (ticker, callback) {
	var resDictionary = {} 
	var unirest = require("unirest");
	var req = unirest("GET", "https://apidojo-yahoo-finance-v1.p.rapidapi.com/market/get-quotes");

	req.query({
		"region": "US",
		"lang": "en",
		"symbols": ticker
	});

	req.headers({
		"x-rapidapi-host":process.env.API_HOST,
		"x-rapidapi-key": process.env.API_KEY,
		"useQueryString": true
	});
	
	req.end(function (res) {
		if (res.error) {	
			console.log("GET error", res.error);
			callback(res.error,null);
		}
		else{
			console.log("status", res.status);
			console.log("headers", res.headers);
			console.log("GET response", res.body);
			
			var resString = JSON.stringify(res.body.quoteResponse.result, null, 2);
			console.log(resString);
			
			var resArray = res.body.quoteResponse.result;
			
			resDictionary["longName"] = resArray[0].longName;
			resDictionary["currency"] = resArray[0].currency;
			resDictionary["bid"] = resArray[0].bid;
			resDictionary["ask"] = resArray[0].ask;


			
			callback(null, resDictionary);
		}

	});
	
}
	
bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
});
bot.on('message', function (user, userID, channelID, message, evt) {
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`
    if (message.substring(0, 1) == PREFIX) {
        var args = message.substring(1).split(' ');
        var cmd = args[0];
		
		var ticker = args[1]; 
		
		args = args.splice(2);
		
		var msg;
	  
	    var response = getQuote(ticker, function(error, res) {
		
			if (error === null) {
				
				msg = 
				res["longName"] + "\n" + 
				"Currency: " + res["currency"] + "\n" +
				"Bid: " + res["bid"] + "\n" +
				"Ask: " + res["ask"] + "\n" 
				;
				
				
				switch(cmd) {
					case 'ticker':
						console.log("START");
						
						bot.sendMessage({
							to: channelID,
							message: msg
						});

					break;

				}
				
			}
			else{
				console.log(error);
			}			
		});
     }
});



