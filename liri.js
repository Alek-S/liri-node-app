'use strict';

//==REQUIRE==
const fs = require('fs');

//npm
const request = require('request');
const spotify = require('spotify');
const Twitter = require('twitter');
const chalk = require('chalk'); //CLI text color

//project specific
const twitterAccount = require('./keys.js'); //part of .gitignore


//==GLOBAL VARIABLES==
const inFile = './random.txt'; //for reading in do-what-it-says command
const logFile = './log.txt'; //file used for logging --part of .gitignore
const errorText = chalk.red; //formatting for error text
let command = process.argv[2]; //command
let commandSearch = process.argv.slice(3).join(' '); //song or movie name




//==Argument Parm Check==
commandCheck();
function commandCheck(){
	appendToLog('COMMAND IN >> ' + command + '  ARG: ' + commandSearch );

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
}




//==FUNCTIONS==

function myTweets(){
	let myAccount = new Twitter(twitterAccount.twitterKeys);

	//get last 20 tweets on timeline
	myAccount.get('statuses/home_timeline',{count: 20}, (error, tweets) => {
		if(error){
			console.trace( errorText(error) );
			return;
		}

		//console each tweet and created at timestamp
		tweets.forEach( (tweet) => {
			console.log(chalk.yellow('\nTweet:'), tweet.text);
			console.log(chalk.cyan('Created At:'), tweet.created_at);
			appendToLog('OUTPUT << ' + tweet.text);
			appendToLog('OUTPUT << ' + tweet.created_at);
		});
	});
}


function spotifySong(){

	if(!commandSearch){
		commandSearch = '"the sign"'; //default fallback song
	}

	spotify.search({ 
		type: 'track', query: commandSearch}, (err, data) => {
		if ( err ) {
			console.trace(err);
			return;
		}

		if(data.tracks.items.length > 0){
			let artist = data.tracks.items[0].album.artists[0].name;
			let album = data.tracks.items[0].album.name;
			let song = data.tracks.items[0].name;
			let externalURL = data.tracks.items[0].external_urls.spotify;

			console.log(chalk.yellow('\nArtist:'), artist);
			appendToLog('OUTPUT << ' + 'Artist: ' + artist);

			console.log(chalk.yellow('Song:'), song);
			appendToLog('OUTPUT << ' + 'Song: ' + song);

			console.log(chalk.yellow('Album:'), album);
			appendToLog('OUTPUT << ' + 'Album: ' + album);

			console.log(chalk.yellow('Link:'), externalURL);
			appendToLog('OUTPUT << ' + 'Link: ' + externalURL);

		}else{
			//if search returns nothing, show error, and run it again using default song
			console.log(errorText('Error! Nothing found for "' + commandSearch + '". Searching default song') );
			appendToLog('ERROR << Error! Nothing found for "' + commandSearch + '". Searching default song');

			commandSearch = undefined;
			spotifySong();
		}
	});

}


function movieThis(){
	
	if(!commandSearch){
		commandSearch = 'mr nobody'; //default fallback song
	}else{
		commandSearch = commandSearch.replace('.', '');
	}

	request('http://www.omdbapi.com/?t=' + commandSearch, (err, response, body) => {
		let formattedName = commandSearch;
		let rottenRating = '';

		if ( err ) {
			console.trace(err);
			return;
		}

		body = JSON.parse(body);
  
		while(formattedName.indexOf(' ') > 0){
			formattedName = formattedName.replace(' ', '_').toLowerCase();
		}

		if(body.Response === 'True'){
			for (let i = 0; i < body.Ratings.length; i++) {
				if(body.Ratings[i].Source === 'Rotten Tomatoes'){
					rottenRating = body.Ratings[i].Value;
				}
			}


			console.log(chalk.yellow('Title:'), body.Title);
			appendToLog('OUTPUT << ' + 'Title: ' + body.Title);

			console.log(chalk.yellow('Year:'), body.Year);
			appendToLog('OUTPUT << ' + 'Year: ' + body.Year);

			console.log(chalk.yellow('Rated:'), body.Rated);
			appendToLog('OUTPUT << ' + 'Rated: ' + body.Rated);

			console.log(chalk.yellow('Country:'), body.Country);
			appendToLog('OUTPUT << ' + 'Country: ' + body.Country);

			console.log(chalk.yellow('Language:'), body.Language);
			appendToLog('OUTPUT << ' + 'Language: ' + body.Language);

			console.log(chalk.yellow('Plot:'), body.Plot);
			appendToLog('OUTPUT << ' + 'Plot: ' + body.Plot);

			console.log(chalk.yellow('Actors:'), body.Actors);
			appendToLog('OUTPUT << ' + 'Actors: ' + body.Actors);

			console.log(chalk.yellow('Rotten Tomatoes Rating:'), rottenRating);
			appendToLog('OUTPUT << ' + 'Rotten Tomatoes Rating: ' + rottenRating);

			console.log(chalk.yellow('Movie URL:'), body.Website);
			appendToLog('OUTPUT << ' + 'Movie URL: ' + body.Website);

			checkRottenLink('https://www.rottentomatoes.com/m/'+ formattedName);

		}else{
			//if search returns nothing, show error, and run it again using default movie
			console.log(errorText('Error! Nothing found for "' + commandSearch + '". Searching default movie') );
			appendToLog('ERROR << Error! Nothing found for "' + commandSearch + '". Searching default movie');

			commandSearch = undefined;
			movieThis();
		}
	});

}


function whatItSays(){
	let fileInArray = [];

	console.log(chalk.yellow('Reading From:'), inFile);
	appendToLog('OUTPUT << ' + 'Reading From: ' + inFile);

	fs.readFile(inFile, (err, data) => {
		if (err) throw err;

		fileInArray = data.toString().split(' ');
		command = fileInArray[0];
		commandSearch = fileInArray.slice(1).join(' ');
		commandCheck();
	});
}


//if user doesn't use supported command argument
function showHelp(){
	
	if(process.argv[2] === undefined){
		console.log( errorText('Error! No commands passed.') );
		appendToLog('ERROR << Error! No commands passed.');
	} else {
		console.log( errorText('Error! "' + command + '" not a valid option') );
		appendToLog('ERROR << Error! "' + command + '" not a valid option');
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


//check if Rotten Tomatoes link is legit
function checkRottenLink(link){
	request(link, (err, response, body) => {
		
		if ( err ) {
			console.trace(err);
			return;
		}

		//check the body for a 404 error
		if(body.indexOf('<h1>404 - Not Found</h1>') > 0){
			console.log(chalk.grey('Rotten Tomatoes URL could not be provided. This is usually indicative of non-unique film name.'));
			appendToLog('OUTPUT << ' + 'Rotten Tomatoes URL could not be provided. This is usually indicative of non-unique film name.');
		}else{
			console.log(chalk.yellow('Rotten Tomatoes URL:'), link);
			appendToLog('OUTPUT << ' + 'Rotten Tomatoes URL: ' + link);
		}
	});
}


function appendToLog( toLog ){
	let now = new Date();
	
	let logEntry = '\n'+ now +': ' + toLog;

	fs.appendFile(logFile, logEntry, (err) => {
		if (err) throw err;
	});
}

