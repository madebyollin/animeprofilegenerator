import React, { Component } from 'react';
import './ProgressBar.css'

class ProgressBar extends Component {

    render() {
        console.log("render", this.props);
        return (
            <div className="progress" style={{marginBottom: 10}}>
                <div className="progress-bar" role="progressbar" style={{width: this.props.value + '%'}}>
                </div>
            </div>
        );
    }
}

export default ProgressBar;
