//==REQUIRE==
const fs = require('fs');
//npm
const request = require('request');
const spotify = require('spotify');
const Twitter = require('twitter');
const chalk = require('chalk'); //CLI text color
//project specific
const twitterAccount = require('./keys.js');


//==global variables==
let errorText = chalk.red; //formatting for error text
let command = process.argv[2]; //command
let commandSearch = process.argv.slice(3).join(' '); //song or movie name





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
			return;
		}

		//console each tweet and created at timestamp
		tweets.forEach( (tweet) => {
			console.log(chalk.yellow('\nTweet:'), tweet.text);
			console.log(chalk.cyan('Created At:'), tweet.created_at);
		});
	});
}


function spotifySong(){

	if(!commandSearch){
		commandSearch = '"the sign"'; //default fallback song
	}

	spotify.search({ 
		type: 'track', query: commandSearch}, function(err, data) {
	    if ( err ) {
	        console.trace(err);
	        return;
	    }

	    if(data.tracks.items.length > 0){
		    var artist = data.tracks.items[0].album.artists[0].name;
		    var album = data.tracks.items[0].album.name;
		    var song = data.tracks.items[0].name
		    var externalURL = data.tracks.items[0].external_urls.spotify

		    console.log(chalk.yellow('\nArtist:'), artist);
		    console.log(chalk.yellow('Song:'), song);
	    	console.log(chalk.yellow('Album:'), album);
	    	console.log(chalk.yellow('Link:'), externalURL);
	    }else{
	    	//if search returns nothing, show error, and run it again using default song
	    	console.log(errorText('Error! Nothing found for "' + commandSearch + '". Searching default song') );
	   
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

	request('http://www.omdbapi.com/?t=' + commandSearch, function (err, response, body) {
		if ( err ) {
	        console.trace(err);
	        return;
	    }

	    body = JSON.parse(body);
	    let formattedName = commandSearch.replace(' ', '_').toLowerCase();

	    if(body.Response === "True"){
		    for (var i = 0; i < body.Ratings.length; i++) {
		    	if(body.Ratings[i].Source === 'Rotten Tomatoes'){
		    		var rottenRating = body.Ratings[i].Source;
		    	}
		    }


	  		console.log(chalk.yellow('Title:'), body.Title);
	  		console.log(chalk.yellow('Year:'), body.Year);
	  		console.log(chalk.yellow('Rated:'), body.Rated);
	  		console.log(chalk.yellow('Country:'), body.Country);
	  		console.log(chalk.yellow('Language:'), body.Language);
	  		console.log(chalk.yellow('Plot:'), body.Plot);
	  		console.log(chalk.yellow('Actors:'), body.Actors);
	  		console.log(chalk.yellow('Rotten Tomatoes Rating:'), rottenRating);
	  		console.log(chalk.yellow('Rotten Tomatoes URL:'), 'https://www.rottentomatoes.com/m/'+ formattedName);
	  	}else{
	  		//if search returns nothing, show error, and run it again using default movie
	    	console.log(errorText('Error! Nothing found for "' + commandSearch + '". Searching default movie') );
	    	commandSearch = undefined;
	    	movieThis();
	  	}
	});

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