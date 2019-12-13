import React from 'react';

import {NAMESPACES, NAMESPACE, CONFIGMAPS, CONFIGMAP, SECRETS, SECRET} from './displays';

import './css/normalize.css';
import './css/skeleton.css';

class Header extends React.Component {
    state = {
        display: NAMESPACES,
        displayContext: {},
    }

    componentDidUpdate() {
        if (this.props.display !== this.state.display) {
            this.setState({display: this.props.display});
        }
        if (this.props.displayContext !== this.state.displayContext) {
            this.setState({displayContext: this.props.displayContext});
        }
    }

    transitioner(targetDisplay) {
        const transition = () => this.props.transition(targetDisplay, this.state.displayContext);
        return transition;
    }

    // Each of the sub-render functions are mutually exclusive - if one returns non-null, the others don't
    renderNamespaces() {
        if (this.state.display !== NAMESPACES) {
            return null;
        }
        return (
            <div className="twelve columns">
                <h3>
                / namespaces
                </h3>
            </div>
        )
    }

    renderNamespace() {
        if (this.state.display !== NAMESPACE) {
            return null;
        }
        return (
            <div className="twelve columns">
                <h3>
                / <a href="#" onClick={this.transitioner(NAMESPACES)}>namespaces</a> {" "}
                / {this.state.displayContext.namespace}
                </h3>
            </div>
        )
    }

    renderSecrets() {
        if (this.state.display !== SECRETS) {
            return null;
        }
        return (
            <div className="twelve columns">
                <h3>
                / <a href="#" onClick={this.transitioner(NAMESPACES)}>namespaces</a> {" "}
                / <a href="#" onClick={this.transitioner(NAMESPACE)}>{this.state.displayContext.namespace}</a> {" "}
                / secrets
                </h3>
            </div>
        )
    }

    renderSecret() {
        if (this.state.display !== SECRET) {
            return null;
        }
        return (
            <div className="twelve columns">
                <h3>
                / <a href="#" onClick={this.transitioner(NAMESPACES)}>namespaces</a> {" "}
                / <a href="#" onClick={this.transitioner(NAMESPACE)}>{this.state.displayContext.namespace}</a> {" "}
                / <a href="#" onClick={this.transitioner(SECRETS)}>secrets</a> {" "}
                / {this.state.displayContext.secret}
                </h3>
            </div>
        )
    }

    renderConfigMaps() {
        if (this.state.display !== CONFIGMAPS) {
            return null;
        }
        return (
            <div className="twelve columns">
                <h3>
                / <a href="#" onClick={this.transitioner(NAMESPACES)}>namespaces</a> {" "}
                / <a href="#" onClick={this.transitioner(NAMESPACE)}>{this.state.displayContext.namespace}</a> {" "}
                / configMaps
                </h3>
            </div>
        )
    }

    renderConfigMap() {
        if (this.state.display !== CONFIGMAP) {
            return null;
        }
        return (
            <div className="twelve columns">
                <h3>
                / <a href="#" onClick={this.transitioner(NAMESPACES)}>namespaces</a> {" "}
                / <a href="#" onClick={this.transitioner(NAMESPACE)}>{this.state.displayContext.namespace}</a> {" "}
                / <a href="#" onClick={this.transitioner(CONFIGMAPS)}>configMaps</a> {" "}
                / {this.state.displayContext.configMap}
                </h3>
            </div>
        )
    }

    render() {
        return (
            <div className="container" id="navbar">
                <div className="row">
                        {this.renderNamespaces()}
                        {this.renderNamespace()}
                        {this.renderSecrets()}
                        {this.renderSecret()}
                        {this.renderConfigMaps()}
                        {this.renderConfigMap()}
                </div>
            </div>
        )
    }
}

export {Header};
