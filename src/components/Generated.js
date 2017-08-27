import React, { Component } from 'react';
import ButtonPrimary from './ButtonPrimary';
import Config from '../Config';
import './Generated.css';

class Generated extends Component {

    render() {
        var clearButton = this.props.results.length > 0 ? <ButtonPrimary
            className="clear-button"
            disabled={false}
            text="Clear List"
            onClick={this.props.clear}
        /> : "";
        var selection = this.props.selection;
        var animateButton = selection.length == 2 ? <ButtonPrimary
            className="animate-button"
            disabled={false}
            text="Animate Gif"
            onClick={this.props.animate}
        /> : "";
        return (
            <div className="generated-wrapper">
                <h3 style={{color: Config.colors.themeStrongText}}>Generated Images</h3>
                {clearButton}
                {animateButton}
                <ul className="image-list">
                    {this.props.results.map((r,i) => {
                        let rendered = r.render();
                        let key = i + "" + r.props.label + "" + r.props.noise;
                        let selectThis = () => {
                            this.props.select(i);
                        };
                        return <li key={key} onClick={selectThis} className={["", "selection selectA", "selection selectB"][selection.indexOf(i) + 1]}>{rendered}</li>;
                    })}
                </ul>
            </div>
        );
    }
}

export default Generated;
