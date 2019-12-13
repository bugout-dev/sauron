import React from 'react';

import {NAMESPACE, SECRETS, CONFIGMAPS} from './displays';

import './css/normalize.css';
import './css/skeleton.css';

class NamespacesList extends React.Component {
    state = {
        server: process.env.REACT_APP_SAURON_SERVER || '',
        visible: false,
        namespaces: [],
        message: '',
    }

    /**
     * When component mounts, retrieve list of namespaces from server and store them in state
     */
    componentDidMount() {
        this.getNamespaces();
    }

    /**
     * When component updates, make sure that the parent's expectations of visibility are reflected
     * in the component state.
     */
    componentDidUpdate() {
        if (this.props.visible !== this.state.visible) {
            this.setState({visible: this.props.visible});
        }
    }

    /**
     * Get a list of namespaces on the Kubernetes cluster and store in state
     */
    getNamespaces = () => {
        const target = `${this.state.server}/namespaces`
        fetch(target, {method: 'GET'})
        .then(response => {
            if (!response.ok) {
                throw Error(response.statusText);
            }
            return response.json();
        })
        .then(body => {
            this.setState({namespaces: body});
        })
        .catch(err => {
            this.setState({message: `Error listing Kubernetes namespaces: ${err}`})
        });
    }

    transitioner = (namespace) => {
        const transition = () => this.props.transition(NAMESPACE, {namespace});
        return transition;
    }

    renderNamespaces = () => {
        return this.state.namespaces.map((namespace, i) => {
            return (
                <li key={i}>
                    <a href="#" onClick={this.transitioner(namespace)}>{namespace}</a>
                </li>
            )
        });
    }

    render() {
        if (!this.state.visible) {
            return null;
        }

        return (
            <div className="container" id="namespaces-list">
                <ul>
                    {this.renderNamespaces()}
                </ul>
                <div className="row">
                    <div className="twelve columns">
                        <center>{this.state.message || ''}</center>
                    </div>
                </div>
            </div>
        )
    }
}

class Namespace extends React.Component {
    state = {
        server: process.env.REACT_APP_SAURON_SERVER || '',
        visible: false,
        name: null,
        message: '',
    }

    /**
     * When component updates, make sure that the parent's expectations of visibility are reflected
     * in the component state.
     */
    componentDidUpdate() {
        if (this.props.visible !== this.state.visible) {
            this.setState({visible: this.props.visible});
        }

        if (this.props.name !== this.state.name) {
            this.setState({name: this.props.name});
        }
    }

    transitioner = (displayType) => {
        const transition = () => this.props.transition(displayType, {namespace: this.state.name})
        return transition;
    }

    render() {
        if (!this.state.visible) {
            return null;
        }

        return (
            <div className="container" id="namespaces-list">
                <ul>
                    <li><a href="#" onClick={this.transitioner(CONFIGMAPS)}>ConfigMaps</a></li>
                    <li><a href="#" onClick={this.transitioner(SECRETS)}>Secrets</a></li>
                </ul>
                <div className="row">
                    <div className="twelve columns">
                        <center>{this.state.message || ''}</center>
                    </div>
                </div>
            </div>
        )
    }
}

export {NamespacesList, Namespace};
