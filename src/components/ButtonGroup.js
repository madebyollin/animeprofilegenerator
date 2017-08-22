import React, { Component } from 'react';
import Config from '../Config';

class ButtonGroup extends Component {

    renderButton(props) {
        var style = {
            outline: 0,
            active: {
                backgroundColor: Config.colors.theme,
                color: '#fff',
            }
        };

        return (
            <button type="button" className="btn btn-default"
                    key={props.key || props.name}
                    style={Object.assign({}, style, props.isActive && style.active)}
                    onClick={() => props.onClick()}>
                {props.name}
            </button>
        );
    }

    renderButtonGroup(buttons) {
        return (
            <div className="btn-group" role="group">
                {buttons.map(options => this.renderButton(options))}
            </div>
        );
    }
}

export default ButtonGroup;
