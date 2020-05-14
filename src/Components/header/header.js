import React, { Component } from 'react';
import{
  Link
}from 'react-router-dom';
class Header extends Component {
  render() {
    return (
      <div className="Header">
      <header>
      <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
  <a class="navbar-brand" href="#">Web Crawler</a>
  <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarColor01" aria-controls="navbarColor01" aria-expanded="false" aria-label="Toggle navigation">
    <span class="navbar-toggler-icon"></span>
  </button>

  <div class="collapse navbar-collapse" id="navbarColor01">
    <ul class="navbar-nav mr-auto">
      <li class="nav-item active">
        <Link to="/" color="white"><a class="nav-link">Home</a></Link>
      </li>
      <li class="nav-item">
        <Link to="/crawler"><a class="nav-link">Web Crawler</a></Link>
      </li>
    </ul>
  </div>
</nav>
      </header>

      </div>

    );
  }
}

export default Header;
