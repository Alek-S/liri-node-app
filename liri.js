//==REQUIRE==
const fs = require('fs');

//npm
const request = require('request');
const spotify = require('spotify');
const Twitter = require('twitter');
const chalk = require('chalk'); //CLI text color and formatting

//project specific
const twitterAccount = require('./keys.js');


//==global variables==
const errorText = chalk.red; //formatting for error text
const command = process.argv[2]; //command
const commandSearch = process.argv.slice(3).join(' '); //song or movie name

//==Argument Parm Check==
switch(command){
	case 'my-tweets':
	myTweets();
	break;

	case 'spotify-this-song':
	spotifySong();
	break;

	case 'movie-this':
	movieThis();
	break;

	case 'do-what-it-says':
	whatItSays();
	break;

	default:
	showHelp();
}


//==FUNCTIONS==

function myTweets(){
	let myAccount = new Twitter(twitterAccount.twitterKeys);

	//get last 20 tweets on timeline
	myAccount.get('statuses/home_timeline',{count: 20}, function(error, tweets, response){
		if(error){
			console.trace( errorText(error) );
		}

		//console each tweet and created at timestamp
		tweets.forEach( (tweet) => {
			console.log(chalk.yellow('\nTweet:'), tweet.text);
			console.log(chalk.cyan('Created At:'), tweet.created_at);
		});
	});
}


function spotifySong(){

}


function movieThis(){

}


function whatItSays(){

};


//if user doesn't use supported command argument
function showHelp(){
	
	if(process.argv[2] === undefined){
		console.log( errorText('Error! No commands passed.') );
	} else {
		console.log( errorText('Error! "' + command + '" not a valid option') );
	}

	console.log('\n::Command Help::');
	console.log('node liri', chalk.cyan('<command>'), chalk.grey('<optional name>\n'));

	console.log( chalk.cyan('my-tweets'));
	console.log('└─ Show last 20 tweets');

	console.log(chalk.cyan('\nspotify-this-song') , chalk.grey('<name of song>'));
	console.log('└─ Show song information. If none provided, default to "The Sign" by Ace of Base');

	console.log(chalk.cyan('\nmovie-this'), chalk.grey('<name of movie>'));
	console.log('└─ Show movie information. If none provided, default to Mr. Nobody');
	
	console.log(chalk.cyan('\ndo-what-it-says'));
	console.log('└─ run command from random.txt');
}