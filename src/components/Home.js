import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
import { CSSTransitionGroup } from 'react-transition-group';
import Config from '../Config';
import ProgressBar from './ProgressBar';
import Options from './Options';
import PromptDialog from './PromptDialog';
import ButtonStepper from './ButtonStepper';
import ButtonPrimary from './ButtonPrimary';
import Result from './Result';
import GAN from '../utils/GAN';
import Generated from "./Generated"
import Utils from '../utils/Utils';
import ImageEncoder from '../utils/ImageEncoder';
import './Home.css';

class Home extends Component {

    constructor() {
        super();
        this.state = {
            gan: {
                loadingProgress: 0,
                isReady: false,
                isRunning: false,
                isCanceled: false,
                isError: false
            },
            options: {
                amount: 1
            },
            results: [],
            rating: 0,
            mode: 'normal'
        };
        this.initOptions(this.state);
        this.gan = new GAN();
    }

    initOptions(state) {
        Config.options.forEach(option => {
            state.options[option.key] = {
                random: true,
                value: option.type === 'multiple' ? Array.apply(null, {length: option.options.length}).fill(-1) : -1
            }
        });
        state.options.noise = {
            random: true
        };
    }

    async componentDidMount() {

        if (Utils.usingCellularData()) {
            try {
                await this.cellularDialog.show();
            }
            catch (err) {
                this.setState({gan: Object.assign({}, this.state.gan, {isCanceled: true})});
                return;
            }
        }

        if (!Utils.supportsWebGPU()) {
            try {
                await this.browserDialog.show();
            }
            catch (err) {
                this.setState({gan: Object.assign({}, this.state.gan, {isCanceled: true})});
                return;
            }
        }

        try {
            await this.gan.init((current, total) => this.setState({gan: Object.assign({}, this.state.gan, {loadingProgress: current / total * 100})}));
        }
        catch (err) {
            this.setState({gan: Object.assign({}, this.state.gan, {isError: true})});
            return;
        }

        this.setState({gan: {isReady: true}});
    }

    getRandomOptionValues(originalOptionInputs) {
        var optionInputs = window.$.extend(true, {}, originalOptionInputs);
        Config.options.forEach(option => {
            var optionInput = optionInputs[option.key];

            if (!optionInput || optionInput.random) {
                optionInput = optionInputs[option.key] = {random: true};

                if (option.type === 'multiple') {
                    var value = Array.apply(null, {length: option.options.length}).fill(-1);
                    if (option.isIndependent) {
                        for (var j = 0; j < option.options.length; j++) {
                            value[j] = Math.random() < option.prob[j] ? 1 : -1;
                        }
                    }
                    else {
                        var random = Math.random();
                        for (j = 0; j < option.options.length; j++) {
                            if (random < option.prob[j]) {
                                value[j] = 1;
                                break;
                            }
                            else {
                                random -= option.prob[j];
                            }
                        }
                    }
                    optionInput.value = value;
                }
                else {
                    optionInput.value = Math.random() < option.prob ? 1 : -1;
                }
            }
        });

        if (!optionInputs.noise || optionInputs.noise.random) {
            var value = [];
            optionInputs.noise = {random: true, value: value};
            Array.apply(null, {length: Config.gan.noiseLength}).map(() => Utils.randomNormal((u, v) => value.push([u, v])));
        }

        return optionInputs;
    }

    getLabel(optionInputs) {
        var label = Array.apply(null, {length: Config.gan.labelLength});
        Config.options.forEach(option => {
            var optionInput = optionInputs[option.key];

            if (option.type === 'multiple') {
                optionInput.value.forEach((value, index) => {
                    label[option.offset + index] = value;
                });

            }
            else {
                label[option.offset] = optionInput.value;
            }
        });
        return label;
    }

    getNoise(optionInputs) {
        var noise = optionInputs.noise.value.map(([u, v]) => Utils.uniformToNormal(u, v));
        return noise;
    }

    async generate(count) {
        this.setState({
            gan: Object.assign({}, this.state.gan, {isRunning: true})
        });

        var results = this.state.results.concat([]);
        var startIndex = results.length;
        for (var i = 0; i < count; i++) {
            let result = new Result();
            results.push(result);
        }
        this.setState({
            results: results
        });

        var hash = (arr) => {
            console.log(arr)
            return arr && arr.slice(0, 128).join("").slice(0,128);
        }

        for (var i = 0; i < count; i++) {
            let optionInputs = this.getRandomOptionValues(this.state.options);
            let label = this.getLabel(optionInputs);
            let noise = this.getNoise(optionInputs);
            let result = await this.gan.run(label, noise);
            result = result.slice();
            results[startIndex + i] = new Result({label: label, noise: noise, rawImage: result});
            this.setState({
                options: optionInputs,
                results: results,
                gan: Object.assign({}, this.state.gan, {noise: noise, noiseOrigin: optionInputs.noise.value, input: noise.concat(label)})
            });
        }

        this.setState({
            gan: Object.assign({}, this.state.gan, {isRunning: false}),
        });
    }

    onOptionChange(key, random, value) {
        if (key === 'noise' && !random && !value) {
            return;
        }
        if (random) {
            this.setState({
                options: Object.assign({}, this.state.options, {
                    [key]: Object.assign({}, this.state.options[key], {random: true})
                })
            });
        }
        else {
            this.setState({
                options: Object.assign({}, this.state.options, {
                    [key]: Object.assign({}, this.state.options[key], {random: false, value: value})
                })
            });
        }
    }

    onClearResults() {
        this.setState({results: []});
    }

    render() {
        return (
            <div className="home">

                <div className="row main-row">
                    <div className={'col-xs-12'}>
                        <div className="row progress-container">
                            <CSSTransitionGroup
                                transitionName="progress-transition"
                                transitionEnterTimeout={0}
                                transitionLeaveTimeout={1000}>

                                {!this.state.gan.isReady &&
                                <div className="col-xs-12">
                                    <ProgressBar value={this.state.gan.loadingProgress} />
                                    <h5 className="progress-text" style={{color: this.state.gan.isCanceled || this.state.gan.isError ? '#EB32A7' : '#FFF'}}>
                                        {this.state.gan.isCanceled ? 'Canceled' : this.state.gan.isError ? 'Network Error' : 'Loading Model...'}
                                    </h5>
                                </div>
                                }

                            </CSSTransitionGroup>
                        </div>

                        <div className="row">
                            <ButtonStepper
                                className={"big-generate-button"}
                                text={`Generate # Image$`}
                                disabled={this.state.gan.isRunning || !this.state.gan.isReady}
                                min={1}
                                max={1000}
                                step={1}
                                value={5}
                                onClick={(n) => this.generate(n)} />
                        </div>

                        <div className="row">
                            <div className="col-xs-12 options-container">
                                <Switch>
                                    <Route exact path="/" render={() =>
                                        <Options
                                            options={Config.options}
                                            inputs={this.state.options}
                                            onChange={(key, random, value) => this.onOptionChange(key, random, value)}/>
                                    } />
                                </Switch>

                            </div>
                        </div>
                        <div className="row">
                            <CSSTransitionGroup
                                transitionName="progress-transition"
                                transitionEnterTimeout={500}
                                transitionLeaveTimeout={1000}>

                                {this.state.gan.isReady &&
                                    <Generated
                                        className={"generated-wrapper"}
                                        results={this.state.results}
                                        clear={() => this.onClearResults()}
                                    />
                                }

                            </CSSTransitionGroup>
                        </div>
                    </div>
                </div>

                <PromptDialog
                    ref={cellularDialog => this.cellularDialog = cellularDialog}
                    title="Cellular Data Warning"
                    message="You are using a mobile data network.  This site loads a large (4MB) model file. Are you sure you want to continue?" />

                <PromptDialog
                    ref={browserDialog => this.browserDialog = browserDialog}
                    title="Browser Warning"
                    message="This site will run substantially faster (~20x) in a browser that supports WebGPU.  We recommend using Safari Technical Preview on macOS, with WebGPU Enabled. Are you sure you want to continue?" />
            </div>
        );
    }
}

export default Home;
