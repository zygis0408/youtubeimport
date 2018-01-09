import React, { Component } from 'react';
import GoogleLogin from './googleLogin'
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { id: '', videosArray: [] };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

  }
  handleSubmit(event) {
    var link = "https://www.youtube.com/watch?v=";
    this.nextPageButton = '';
    fetch('http://localhost:5000/' + this.state.id).then((response) => {
      response.json().then((videos) => {
        if (videos.nextPageToken) this.nextPageButton = <button onClick={this.handleNextPage}>{videos.nextPageToken}</button>;
        console.log(videos);
        // console.log()
        this.videosArray = videos.items.map(thumb => <li key={thumb.id}><a href={link + thumb.snippet.resourceId.videoId}>{thumb.snippet.title}<img alt="" src={thumb.snippet.thumbnails.default.url}></img></a></li>);
        this.setState({ videosArray: this.videosArray });
      })
    })
    event.preventDefault();
  }

  handleChange(event) {
    this.setState({ id: event.target.value })
  }

  handleNextPage(event) {
    console.log('next page');
  }
  render() {
    return (
      <div className="App">
        <GoogleLogin />
        <form onSubmit={this.handleSubmit}>
          <input type="text" value={this.state.id} onChange={this.handleChange}></input>
          <input type="submit" value="Submit" />
        </form>
        <ul>{this.videosArray}</ul>
        {this.nextPageButton}
      </div >
    );
  }
}

export default App;
