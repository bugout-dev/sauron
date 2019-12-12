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
                / namespaces
            </div>
        )
    }

    renderNamespace() {
        if (this.state.display !== NAMESPACE) {
            return null;
        }
        return (
            <div className="twelve columns">
                / <a href="#" onClick={this.transitioner(NAMESPACES)}>namespaces</a> {" "}
                / {this.state.displayContext.namespace}
            </div>
        )
    }

    renderSecrets() {
        if (this.state.display !== SECRETS) {
            return null;
        }
        return (
            <div className="twelve columns">
                / <a href="#" onClick={this.transitioner(NAMESPACES)}>namespaces</a> {" "}
                / <a href="#" onClick={this.transitioner(NAMESPACE)}>{this.state.displayContext.namespace}</a> {" "}
                / secrets
            </div>
        )
    }

    renderSecret() {
        if (this.state.display !== SECRET) {
            return null;
        }
        return (
            <div className="twelve columns">
                / <a href="#" onClick={this.transitioner(NAMESPACES)}>namespaces</a> {" "}
                / <a href="#" onClick={this.transitioner(NAMESPACE)}>{this.state.displayContext.namespace}</a> {" "}
                / <a href="#" onClick={this.transitioner(SECRETS)}>secrets</a> {" "}
                / {this.state.displayContext.secret}
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
                </div>
            </div>
        )
    }
}

export {Header};
