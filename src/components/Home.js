import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
import { CSSTransitionGroup } from 'react-transition-group';
import Config from '../Config';
import ProgressBar from './ProgressBar';
import Options from './Options';
import PromptDialog from './PromptDialog';
import ButtonStepper from './ButtonStepper';
import Result from './Result';
import GAN from '../utils/GAN';
import Generated from "./Generated"
import GIF from './Gif'
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
            },
            results: [],
            rating: 0,
            mode: 'normal',
            selection: []
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
        for (let i = 0; i < count; i++) {
            let result = new Result();
            results.push(result);
        }
        this.setState({
            results: results
        });

        for (let i = 0; i < count; i++) {
            let optionInputs = this.getRandomOptionValues(this.state.options);
            let label = this.getLabel(optionInputs);
            let noise = this.getNoise(optionInputs);
            let result = await this.gan.run(label, noise);
            result = result.slice();
            results[startIndex + i] = new Result({options: optionInputs, noise: noise, rawImage: result});
            this.setState({
                results: results
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
        this.setState({results: [], selection: []});
    }

    onSelect(idx) {
        if (idx !== this.state.selection[0]) {
            this.setState({selection: [idx].concat(this.state.selection).slice(0, 2)})
        }
    }

    interpolate(a, b, mix) {
        if (!(0 <= mix && mix <= 1)) {
            console.error("Invalid parameters to interpolate", mix);
        }
        let result;
        if (typeof a === "number" && typeof b === "number") {
            result = mix * b + (1 - mix) * a;
        } else if (a === b) {
            result = a;
        } else if (Array.isArray(a) && Array.isArray(b) ) {
            result = a.map((x, i) => {
                return this.interpolate(a[i], b[i], mix);
            });
        } else if (typeof a === "object") {
            result = {};
            for (let key in a) {
                result[key] = this.interpolate(a[key], b[key], mix);
            }
        }
        return result;
    }

    async onGenerateVariations() {
        let count = 5;
        this.setState({
            gan: Object.assign({}, this.state.gan, {isRunning: true})
        });
        let start = this.state.results[this.state.selection[0]];

        var results = this.state.results.concat([]);
        var startIndex = results.length;
        for (let i = 0; i < count; i++) {
            let result = new Result();
            results.push(result);
        }
        this.setState({
            results: results
        });

        for (let i = 0; i < count; i++) {
            let optionInputs = this.interpolate(start.props.options, this.getRandomOptionValues({}), 0.5);
            let label = this.getLabel(optionInputs);
            // Randomize 1/4 of the noise channels
            let noise = start.props.noise.map(x => Math.random() < 0.25 ? Math.random() : x);
            let result = await this.gan.run(label, noise);
            result = result.slice();
            results[startIndex + i] = new Result({options: optionInputs, noise: noise, rawImage: result});
            console.log("Added result", results[startIndex + i]);
            this.setState({
                results: results,
            });
        }

        this.setState({
            gan: Object.assign({}, this.state.gan, {isRunning: false}),
        });
    }

    async onAnimate(time, start = this.state.results[this.state.selection[1]], end = this.state.results[this.state.selection[0]]) {
        console.log("Got request to animate with time", time);
        let msPerFrame = 15;
        let msTotal = time * 1000;
        let approxTotalFrames = msTotal / msPerFrame;
        let n =  Math.round((1 + approxTotalFrames) / 2);

        let results = this.state.results.slice();
        let result = new Result();
        results.push(result);

        console.log("Starting animation of", n, "frames");

        this.setState({
            results: results,
            gan: Object.assign({}, this.state.gan, {isRunning: true})
        });

        let gif = new GIF({
            workers: 2,
            quality: 10,
            workerScript: "./GifWorker.js"
        });

        let frameStack = [];

        let addFrame = (frame) => {
            frameStack.push(frame);
        }

        // Quarter-sinusoid with unit domain and range
        let smoothCurve = (x) => Math.sin(x * Math.PI - Math.PI/2)/2 + 0.5;;

        for (var i = 0; i < n; i++) {
            let mixFactor = smoothCurve(i / (n - 1));
            let options = this.interpolate(start.props.options, end.props.options, mixFactor);
            let label = this.getLabel(options);
            let noise = this.interpolate(start.props.noise, end.props.noise, mixFactor);
            let result = await this.gan.run(label, noise);
            result = result.slice();
            let img = document.createElement("img");
            img.src = ImageEncoder.encode(result);
            addFrame(img);
        }

        for (let i = frameStack.length - 2; i >= 0; i--) {
            addFrame(frameStack[i])
        }

        for (let i = 0; i < frameStack.length; i++) {
            let img = frameStack[i];
            gif.addFrame(img, {delay: msPerFrame});
        }

        let self = this;

        gif.on('finished', function(blob) {
            let result = new Result({
                options: self.interpolate(start.props.options, end.props.options, 0.5),
                noise: self.interpolate(start.props.noise, end.props.noise, 0.5),
                dataURL: window.URL.createObjectURL(blob)
            });
            results[results.length - 1] = result;
            self.setState({
                results: results,
                gan: Object.assign({}, self.state.gan, {isRunning: false})
            });
        });
        if (frameStack.length <=1) {
            console.error("Can't generate a gif with no frames...");
        }
        gif.render();
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
                                width={3}
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
                                        selection={this.state.selection}
                                        clear={() => this.onClearResults()}
                                        select={(i) => this.onSelect(i)}
                                        animate={(n) => this.onAnimate(n)}
                                        variations={() => this.onGenerateVariations()}
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
