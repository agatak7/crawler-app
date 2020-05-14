import React, { Component } from 'react';

  var request = require('request');
  var cheerio = require('cheerio');
  var URL = require('url-parse');
  var ReactDOM = require('react-dom');

  var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
      res.send(200);
    }
    else {
      console.log("yes");
      next();
    }
  };

  var CORS = "https://cors-anywhere.herokuapp.com/";

  let START_URL = "https://www.google.com/";
  let searchword = "battery";
  let phrases = [];
  let threshold = 1;
  var MAX_PAGES_TO_VISIT = 300;

  var pagesVisited = {};
  var numPagesVisited = 0;
  var pagesToVisit = [];
  var found_phrases = [];
  var url = new URL(CORS + START_URL);
  let origin_url = new URL(START_URL);
  let baseUrl = origin_url.protocol + "//" + origin_url.hostname;

  pagesToVisit.push(START_URL);

  function crawl() {
    if(numPagesVisited >= MAX_PAGES_TO_VISIT) {
      console.log("Reached max limit of number of pages to visit.");
      return;
    }
    var nextPage = pagesToVisit.pop();
    if (nextPage in pagesVisited) {
      // We've already visited this page, so repeat the crawl
      crawl();
    } else {
      // New page we haven't visited
      visitPage(nextPage, crawl);
    }
  }

  function visitPage(url, callback) {
    // Add page to our set
    pagesVisited[url] = true;
    numPagesVisited++;

    // Make the request
    console.log("Visiting page " + url);
    const urls ="Visiting page: " + url;

    request(CORS + url, function(error, response, body) {
       // Check status code (200 is HTTP OK)
       console.log("Status code: " + response.statusCode);
       if(response.statusCode !== 200) {
         callback();
         return;
       }
       // Parse the document body
       var $ = cheerio.load(body);
       console.log(phrases);
       if(satisfiesThreshold($, phrases, threshold)) {
         const found ="Word "+ phrases+ " found on " + url;

         //window.crawlerComponent.addURL(found);
         window.crawlerComponent.appendTable(url, found_phrases);

         console.log('Word ' + phrases + ' found at page ' + url);
       }
       var x = new URL(url);
       //only collect links if at base url
       if( x.hostname == origin_url.hostname) collectInternalLinks($);
       // In this short program, our callback is just calling crawl()
       callback();
    });
  }

  function satisfiesThreshold($, words, threshold) {
    var sum = 0;
    found_phrases = [];
    for(var i = 0; i < words.length; i++) {
      if(searchForWord($, words[i])) {
        found_phrases.push(words[i]);
        sum++;
      }
    }
    console.log(found_phrases);
    return (sum >= threshold);
  }

  function searchForWord($, word) {
    var bodyText = $('html > body').text().toLowerCase();
    return(bodyText.indexOf(word.toLowerCase()) !== -1);
  }

  function collectInternalLinks($) {
      var relativeLinks = $("a[href^='/']");
      var absoluteLinks = $("a[href^='http']");
      absoluteLinks.each(function() {
        pagesToVisit.push($(this).attr('href'));
      });

      console.log("Found " + relativeLinks.length + " relative links on page");
  }


class WebCrawler extends Component {

  constructor(props) {
    super(props);
    this.array = [];
    this.selected = [];
    this.handleWord = this.handleWord.bind(this);
    this.handleUrl = this.handleUrl.bind(this);

    window.crawlerComponent = this;

  }

  state = {
     response: '',
     post: '',
     responseToPost: '',
   };


   //On init we get phrases from the DB
   componentDidMount() {
      this.getDB();
   }

   //gets the phrases from the db and fills the HTML element.
   getDB = async () => {
     const response = await fetch('/db/phrases');
     const body = await response.json();

     if (response.status !== 200) throw Error(body.message);

     this.array = body;

     phrases = [];

     for(var i = 0; i< this.array.length;i++) {
       this.addPhrase(this.array[i].phrase);
       phrases.push(this.array[i].phrase);
     }

     return body;
   };


   //adds phrases to the DB
   addToDB= async () => {
     const response = await fetch('/db/phrases/insert', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({ post: this.state.post }),
     });
     const body = await response.text();

     this.setState({ responseToPost: body });
   };

   deleteFromPhrases = async () => {
     const response = await fetch('/db/phrases/delete', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({ post: this.state.post }),
     });
     const body = await response.text();

     this.setState({ responseToPost: body });
   }

  //adds a URL onto the stack
  handleUrl = event => {
   event.preventDefault();
   START_URL = event.target.value;
   origin_url = new URL(event.target.value);
   baseUrl = origin_url.protocol + "//" + origin_url.hostname;
   pagesToVisit.push(START_URL);

  };

  //handles the change of threshold
  handleThres = event => {
   threshold = event.target.value;
  };

  //parses the phrases from JSON format to an array
  handleWord = event => {
   event.preventDefault();
   searchword = event.target.value;

   this.array = JSON.parse("[" + searchword + "]");

  };

  //adds the submitted phrases to the DB and the working array
  handleSubmitWords = event => {
    event.preventDefault();
    phrases.concat(this.array);

    for(var i = 0; i< this.array.length;i++) {
      this.addPhrase(this.array[i]);
      phrases.push(this.array[i]);
      this.state.post = this.array[i];
      this.addToDB();
    }

  };

  handleSubmit = event => {
    event.preventDefault();
  };

  handleDelete = event => {
    event.preventDefault();
    console.log(this.selected);
    for(var i = 0; i<this.selected.length; i++) {
      this.state.post = this.selected[i];
      this.deleteFromPhrases();
    }

    var element = document.getElementById("phrases");
    for (var j = element.childNodes.length - 1; j >= 0; j--)
    element.removeChild(element.childNodes[j]);


    this.getDB();

  };

  deletePhrases = event => {
   event.preventDefault();
   this.selected = JSON.parse("[" + event.target.value + "]");

  };



  addNoLinks(string){
    document.getElementById("nolinks").innerHTML += '<br />' + string + '<br />';
  };

  addURL(string){
    document.getElementById("url").innerHTML += '<br />' + string + '<br />';
  };

  addPhrase(string){
    document.getElementById("phrases").innerHTML += '<span class="badge badge-pill badge-info">'+ string + '</span>';
  };

  appendTable(link, found){
    var table = document.getElementById("table");

    // Create an empty <tr> element and add it to the 1st position of the table:
    var row = table.insertRow(1);

    // Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
    var links = row.insertCell(0);

    var visit = row.insertCell(1);

    var words = row.insertCell(2);


    // Add some text to the new cells:
    links.innerHTML = link;
    visit.innerHTML = '<a href =' + link+' target="_blank"> visit </a>';
    for(var i = 0; i < found.length; i++) {
      words.innerHTML +=  '<span class="badge badge-pill badge-success">'+ found[i] + '</span>';
    }
  }


  render() {
    return (
      <div className="container-fluid">
        Web crawler contents here!
        <p>{this.state.responseToPost}</p>
        <form onSubmit = {this.handleSubmit}>
          <label>
            Enter starting URL:
            <input class="form-control"type="text" name="url" onChange={this.handleUrl} />
          </label>
          <input class="btn btn-primary" type="submit" value="Submit" />
        </form>
        <div class="form-group">
         <label for="exampleSelect1">Select threshold of phrases to match.</label>
         <select class="form-control" id="exampleSelect1" onChange={this.handleThres} style={{width: "325px"}}>
           <option>1</option>
           <option>2</option>
           <option>5</option>
           <option>15</option>
           <option>20</option>
         </select>
       </div>
   <form onSubmit = {this.handleSubmitWords}>
     <p>Enter phrases to add (in quotes, comma separated e.g. ["cat and dog", "car"]):</p>
     <label>
       <input class="form-control" type="text" name="word" onChange={this.handleWord} />
     </label>
     <input class="btn btn-success" type="submit" value="Add" />
   </form>

   <form onSubmit = {this.handleDelete}>
   <p> Enter phrases you want to delete:</p>
     <label>
       <input class="form-control"type="text" name="delete" onChange={this.deletePhrases} />
     </label>
     <input class="btn btn-danger" type="submit" value="Delete" />
   </form>

       <div class="jumbotron">
        <h5 class="display-6">Phrases To Crawl On</h5>
        <p class="lead" id="phrases"></p>
      </div>

        <button type="button" class="btn btn-outline-primary" onClick={crawl}>Crawl</button>
        <p id="url"></p>
        <p id="nolinks"></p>
        <p id="found"></p>


        <table id="table" class="table table-hover">
          <thead>
            <tr>
              <th scope="col">Link</th>
              <th scope="col">Visit</th>
              <th scope="col">Relevant Phrases</th>
            </tr>
          </thead>
          <tbody>
          </tbody>
        </table>
      </div>
    );
  }
}

export default WebCrawler;
