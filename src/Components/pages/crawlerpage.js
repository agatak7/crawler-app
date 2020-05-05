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
  let threshold = 3;
  var MAX_PAGES_TO_VISIT = 300;

  var pagesVisited = {};
  var numPagesVisited = 0;
  var pagesToVisit = [];
  var url = new URL(CORS + START_URL);
  let origin_url = new URL(START_URL);
  let baseUrl = origin_url.protocol + "//" + origin_url.hostname;

  pagesToVisit.push(CORS + START_URL);

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

    ReactDOM.render(urls, document.getElementById('url'));
    window.crawlerComponent.addURL(url);

    request(url, allowCrossDomain);



    request(url, function(error, response, body) {
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
         const found ="Word "+ searchword+ " found on " + url;

         ReactDOM.render(found, document.getElementById('found'));

         console.log('Word ' + searchword + ' found at page ' + url);
       } else {
         collectInternalLinks($);
         // In this short program, our callback is just calling crawl()
         callback();
       }
    });
  }

  function satisfiesThreshold($, words, threshold) {
    var sum = 0;
    for(var i = 0; i < words.length; i++) {
      if(searchForWord($, words[i])) sum++;
    }
    return (sum >= threshold);
  }

  function searchForWord($, word) {
    var bodyText = $('html > body').text().toLowerCase();
    return(bodyText.indexOf(word.toLowerCase()) !== -1);
  }

  function collectInternalLinks($) {
      var relativeLinks = $("a[href^='/']");
      var absoluteLinks = $("a[href^='http']");
      relativeLinks.each(function() {
        pagesToVisit.push(CORS + baseUrl +$(this).attr('href'));
      });
      const links ="Found " + relativeLinks.length + " links on page!";

      window.crawlerComponent.addNoLinks(links);

      console.log("Found " + relativeLinks.length + " relative links on page");
  }


class WebCrawler extends Component {

  constructor(props) {
    super(props);
    this.state = {value: ''};
    this.handleWord = this.handleWord.bind(this);
    this.handleUrl = this.handleUrl.bind(this);
    window.crawlerComponent = this;

  }

  handleWord = event => {
   event.preventDefault();
   searchword = event.target.value;

   var array = JSON.parse("[" + searchword + "]");
   phrases = array;
  };

  handleUrl = event => {
   event.preventDefault();
   START_URL = event.target.value;
   origin_url = new URL(event.target.value);
   baseUrl = origin_url.protocol + "//" + origin_url.hostname;
   pagesToVisit.push(CORS + START_URL);

  };

  handleThres = event => {
   threshold = event.target.value;
   console.log(threshold);
  };

  handleSubmit = event => {
    event.preventDefault();
  }

  addNoLinks(string){
    document.getElementById("nolinks").innerHTML += '<br />' + string + '<br />';
  }

  addURL(string){
    document.getElementById("url").innerHTML += '<br />' + string + '<br />';
  }


  render() {
    return (
      <div className="container-fluid">
        Web crawler contents here!
        <form onSubmit = {this.handleSubmit}>
          <p>Enter phrases to search on (in quotes, comma separated e.g. ["cat and dog", "car"]):</p>
          <label>
            <input class="form-control" type="text" name="word" onChange={this.handleWord} />
          </label>
          <input class="btn btn-primary" type="submit" value="Submit" />
        </form>
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

        <button type="button" class="btn btn-outline-primary" onClick={crawl}>Crawl</button>
        <p id="url"></p>
        <p id="nolinks"></p>
        <p id="found"></p>
      </div>
    );
  }
}

export default WebCrawler;
