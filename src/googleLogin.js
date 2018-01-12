// clientId: '1001607640957-42ssi9hidvrraae5gpklcsdh6l4qvpai.apps.googleusercontent.com',
// scope: 'https://www.googleapis.com/auth/youtube.readonly',
// discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest']

import React, { Component } from 'react';
import './googleLogin.css';
// import InfiniteScroll from 'react-infinite-scroller';

class GoogleLogin extends Component {
    constructor(props) {
        super(props);
        this.state = {
            disabled: true,
            videos: [],
            nextPageToken: '',
            playlistId: '',
            loading: false
        };
        this.handleScroll = this.handleScroll.bind(this);

    }

    componentDidMount() {
        window.addEventListener('scroll', this.handleScroll);

        ((d, s, id, callback) => {
            let js, gs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) {
                this.setState({
                    disabled: false
                });
            } else {
                js = d.createElement(s); js.id = id;
                js.src = 'https://apis.google.com/js/platform.js';
                gs.parentNode.insertBefore(js, gs);
                js.onload = callback;
            }
        })(document, 'script', 'google-platform', () => {
            window.gapi.load('client:auth2', () => {
                this.setState({
                    disabled: false
                });
                if (!window.gapi.auth2.getAuthInstance()) {
                    window.gapi.auth2.init({
                        client_id: '1001607640957-42ssi9hidvrraae5gpklcsdh6l4qvpai.apps.googleusercontent.com',
                        scope: 'https://www.googleapis.com/auth/youtube.readonly'
                    });
                }
            });
        });
    }

    checkLoginState(response) {
        if (window.gapi.auth2.isSignedIn.get()) {
            const profile = window.gapi.auth2.currentUser.get().getBasicProfile();
        } else {
            if (this.props.responseHandler) {
                this.props.responseHandler({ status: response.status });
            }
        }
    }

    clickHandler() {
        const auth2 = window.gapi.auth2.getAuthInstance();
        console.log(auth2);
        // auth2.signIn();
        // auth2.disconnect();
        // console.log(auth2.currentUser.get().getBasicProfile());
        console.log(auth2.isSignedIn.get());
        if (auth2.isSignedIn.get()) {
            window.gapi.client.request({
                'method': 'GET',
                'path': '/youtube/v3/channels',
                'params': {
                    'mine': 'true',
                    'part': 'snippet,contentDetails'
                }
            }).execute(response => {
                console.log(response);
                try {
                    // auth2.signOut();
                    if (response.items[0].contentDetails.relatedPlaylists.uploads !== undefined) {
                        // console.log(response.items[0].contentDetails.relatedPlaylists.uploads);
                        this.setState({ playlistId: response.items[0].contentDetails.relatedPlaylists.uploads });
                        window.gapi.client.request({
                            'method': 'GET',
                            'path': '/youtube/v3/playlistItems',
                            'params': {
                                'playlistId': this.state.playlistId,
                                'part': 'snippet,contentDetails,status',
                                'maxResults': '50'
                            }
                        }).execute(response2 => {
                            console.log(response2)
                            // auth2.signIn();
                            this.setState({ nextPageToken: response2.nextPageToken })
                            var link = "https://www.youtube.com/watch?v=";
                            this.setState({
                                videos: response2.items.map(thumb => {
                                    if (thumb.status.privacyStatus === 'private') {
                                        return <li className='PlaylistItem' key={thumb.id}><a className='ItemTitle' href={link
                                            + thumb.snippet.resourceId.videoId}>{thumb.snippet.title} THIS VIDEO IS PRIVATE
                                            <img alt="" src={thumb.snippet.thumbnails.default.url}></img></a></li>
                                    }
                                    else {
                                        return <li className='PlaylistItem' key={thumb.id}><a className='ItemTitle' href={link
                                            + thumb.snippet.resourceId.videoId}>{thumb.snippet.title}
                                            <img alt="" src={thumb.snippet.thumbnails.default.url}></img></a></li>
                                    }
                                })
                            })

                        })
                    }
                } catch (error) {
                    console.log(error);
                }
            })
        }
        else {
            auth2.signIn();
        }
    }

    handleScroll(event) {
        // conslog(window.pageYOffset);
        if (document.body.clientHeight - window.innerHeight - window.pageYOffset < 0 && !this.state.loading && this.state.nextPageToken !== '') {
            this.setState({ loading: true });
            this.loadNextPage();
        }
    }

    loadNextPage() {
        try {
            window.gapi.client.request({
                'method': 'GET',
                'path': '/youtube/v3/playlistItems',
                'params': {
                    'playlistId': this.state.playlistId,
                    'part': 'snippet,contentDetails,status',
                    'maxResults': '50',
                    'pageToken': this.state.nextPageToken
                }
            }).execute(response2 => {
                if (response2.nextPageToken === undefined) {
                    this.setState({ nextPageToken: '' });
                }
                else {
                    this.setState({ nextPageToken: response2.nextPageToken });
                }
                var link = "https://www.youtube.com/watch?v=";
                this.setState({
                    videos: this.state.videos.concat(response2.items.map(thumb => {
                        if (thumb.status.privacyStatus === 'private') {
                            return <li className='PlaylistItem' key={thumb.id}><a className='ItemTitle' href={link
                                + thumb.snippet.resourceId.videoId}>{thumb.snippet.title} THIS VIDEO IS PRIVATE
                                    <img alt="" src={thumb.snippet.thumbnails.default.url}></img></a></li>
                        }
                        else {
                            return <li className='PlaylistItem' key={thumb.id}><a className='ItemTitle' href={link
                                + thumb.snippet.resourceId.videoId}>{thumb.snippet.title}
                                <img alt="" src={thumb.snippet.thumbnails.default.url}></img></a></li>
                        }
                    }))
                })
            })
        } catch (error) {
            console.log(error);
        }
        this.setState({ loading: false });
    }

    render() {
        const {
      socialId, scope, fetchBasicProfile, responseHandler,
            children, buttonText, ...props
    } = this.props;

        props.disabled = this.state.disabled || props.disabled;

        return (
            <div>
                <button onClick={this.clickHandler.bind(this)}>
                    Log in with Google
            </button>
                <div>
                    <ul>
                        {this.state.videos}
                    </ul>
                </div>
            </div>
        )
    }
}

export default GoogleLogin;