import React, { Component } from 'react';
import ButtonPrimary from './ButtonPrimary';
import Config from '../Config';
import './Generated.css';

class Generated extends Component {

    clear() {
        this.props.clear()
    }

    render() {
        return (
            <div className="generated-wrapper">
                <h3 style={{color: Config.colors.themeStrongText}}>Generated Images</h3>
                <ButtonPrimary
                    className="generated-button"
                    disabled={false}
                    text="Clear List"
                    onClick={() => this.clear()}
                />
                <ul className="image-list">
                    {this.props.results.map((r,i) => {
                        let rendered = r.render();
                        let key = i + "" + r.props.label + "" + r.props.noise;
                        return <li key={key}>{rendered}</li>;
                    })}
                </ul>
            </div>
        );
    }
}

export default Generated;
