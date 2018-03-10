import React, { Component } from 'react';
import ButtonPrimary from './ButtonPrimary';
import ButtonStepper from './ButtonStepper';
import Config from '../Config';
import './Generated.css';

class Generated extends Component {

    render() {
        var clearButton = this.props.results.length > 0 ? <ButtonPrimary
            className="clearButton button"
            disabled={false}
            text="Clear List"
            onClick={this.props.clear}
        /> : "";
        var selection = this.props.selection;
        var animateButton = selection.length === 2 ? <ButtonStepper
            className="animateButton button"
            disabled={false}
            text="Animate #s Gif"
            onClick={(n) => {this.props.animate(n)}}
            min={0.1}
            max={5.0}
            step={0.1}
            value={1.0}
            width={2}
        /> : "";

        var variationsButton = selection.length >= 1 ? <ButtonPrimary
            className="variationsButton button"
            disabled={false}
            text="Generate Variations"
            onClick={this.props.variations}
        /> : "";
        return (
            <div className="generated-wrapper">
                <h3 style={{color: Config.colors.themeStrongText}}>Generated Images</h3>
                {clearButton}
                {variationsButton}
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
