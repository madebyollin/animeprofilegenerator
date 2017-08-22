import React, { Component } from 'react';
import ButtonPrimary from './ButtonPrimary';
import "./ButtonStepper.css";
import Config from '../Config';

class ButtonStepper extends ButtonPrimary {

    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.state = {value: this.props.value || 1};
    }

    handleChange(event) {
        var value = event.target.value;
        if (value >= this.props.min && value <= this.props.max) {
            this.setState({value: value});
        }
        event.stopPropagation();
    }

    shouldComponentUpdate(nextProps, nextState) {
        return nextProps.disable != this.props.disabled ||
        (this.nextState.value != 1 && this.state.value == 1) ||
        (("" + this.nextState.value).length != ("" + this.state.value).length);
    }
    // Props:
    // className, disabled, onClick (like a normal button)
    // min, max, value, step (for stepper)
    // text (Put a # where you want the stepper to go)

    handleParentClick() {
        this.props.onClick(this.state.value);
    }

    handleChildClick(e) {
        e.stopPropagation();
    }

    render() {
        var style = {
            backgroundColor: Config.colors.theme,
            borderColor: Config.colors.themeDarker
        };

        var inputStyle = {
            width: (("" + this.state.value).length + 0.75) + "em"
        }

        var input = (<input onClick={this.handleChildClick} style={inputStyle} className="button-stepper" type="number" min={this.props.min || 1} max={this.props.max || 10} onChange={this.handleChange} value={this.state.value} step={this.props.step || 1}></input>);
        var text = this.props.text.replace("$", this.state.value == 1 ? "" : "s");

        var textSplit = text.split("#");
        var textFirst = textSplit[0] || "";
        var textSecond = textSplit[1] || "";

        return (
            <button className={"btn btn-primary btn-stepper " + (this.props.className || '')} style={style} disabled={this.props.disabled} onClick={() => {this.handleParentClick()}}>{textFirst}{input}{textSecond}</button>
        );
    }
}

export default ButtonStepper;
