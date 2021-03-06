import React, { Component } from 'react';
import Home from './Home';
import './App.css';

class App extends Component {
    onTimelineLoad() {
        window.$('.main-content').css('max-width', 1200);
        window.$('.container-fluid').css('max-width', 1200);
    }

    render() {
        return (
            <div className="App">
                <div className="main-content">
                    <Home onTimelineLoad={() => this.onTimelineLoad()} />
                </div>
            </div>
        );
    }
}

export default App;
