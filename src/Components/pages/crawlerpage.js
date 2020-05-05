import React, { Component } from 'react';


  var request = require('request');
  var cheerio = require('cheerio');
  var URL = require('url-parse');
  var ReactDOM = require('react-dom');

  var CORS = "https://cors-anywhere.herokuapp.com/";

  let START_URL = "https://www.huffingtonpost.com/";
  let searchword = "battery";
  var MAX_PAGES_TO_VISIT = 10;

  var pagesVisited = {};
  var numPagesVisited = 0;
  var pagesToVisit = [];
  var url = new URL(CORS + START_URL);
  var baseUrl = url.protocol + "//" + url.hostname;

  pagesToVisit.push(CORS + START_URL);

  function enterWord(word) {
    searchword = word;
    console.log("The sw: " + searchword);
  }

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



    request(url, function(error, response, body) {
       // Check status code (200 is HTTP OK)
       console.log("Status code: " + response.statusCode);
       if(response.statusCode !== 200) {
         callback();
         return;
       }
       // Parse the document body
       var $ = cheerio.load(body);
       var isWordFound = searchForWord($, searchword);
       if(isWordFound) {
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

  function searchForWord($, word) {
    var bodyText = $('html > body').text().toLowerCase();
    return(bodyText.indexOf(word.toLowerCase()) !== -1);
  }

  function collectInternalLinks($) {
      var relativeLinks = $("a[href^='/']");
      var absoluteLinks = $("a[href^='http']");
        absoluteLinks.each(function() {
        pagesToVisit.push(CORS + $(this).attr('href'));
      });
      const links ="Found " + absoluteLinks.length + " links on page!";

      window.crawlerComponent.addNoLinks(links);

      console.log("Found " + absoluteLinks.length + " relative links on page");
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
  };

  handleUrl = event => {
   event.preventDefault();
   START_URL = event.target.value;
   pagesToVisit.push(CORS + START_URL);

  };

  handleSubmit = event => {
    event.preventDefault();
  }

  addNoLinks(string){
    document.getElementById("nolinks").innerHTML += string + '<br />';
  }

  addURL(string){
    document.getElementById("url").innerHTML += string + '<br />';
  }


  render() {
    return (
      <div className="container-fluid">
        Web crawler contents here!
        <form onSubmit = {this.handleSubmit}>
          <label>
            Enter word to search on:
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
        <button type="button" class="btn btn-outline-primary" onClick={crawl}>Crawl</button>
        <p id="url"></p>
        <p id="nolinks"></p>
        <p id="found"></p>
      </div>
    );
  }
}

export default WebCrawler;
