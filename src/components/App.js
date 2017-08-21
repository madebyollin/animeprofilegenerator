import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
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
                    <Switch>
                        <Route path="/(|about|news|tips)" render={() =>
                            <Home onTimelineLoad={() => this.onTimelineLoad()} />
                        }/>
                    </Switch>
                </div>
            </div>
        );
    }
}

export default App;
