import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom';
//import './App.css';
//import './Assets/css/default.min.css';
import './Assets/css/bootstrap.min.css';
//components
import Header from './Components/header/header';
import Footer from './Components/footer/footer';
import Home from './Components/pages/homepage';
import WebCrawler from './Components/pages/crawlerpage';


class App extends Component {
  render() {
    return (
      <Router>
      <div className="App">
      <Header />

        <Route exact path='/' component={Home}/>
        <Route exact path='/crawler' component={WebCrawler}/>

      <Footer />
      </div>
      </Router>
    );
  }
}

export default App;
