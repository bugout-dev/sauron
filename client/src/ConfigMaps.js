import React from 'react';

import {CONFIGMAP} from './displays';

import './css/normalize.css';
import './css/skeleton.css';

class ConfigMapsList extends React.Component {
    state = {
        server: process.env.REACT_APP_SAURON_SERVER || '',
        visible: false,
        namespace: null,
        configMaps: [],
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
        if (this.props.namespace !== this.state.namespace) {
            this.setState({namespace: this.props.namespace}, this.getConfigMaps);
        }
    }

    updateNewConfigMap = (event) => {
        this.setState({newConfigMap: event.target.value});
    }

    createNewConfigMap = () => {
        const target = `${this.state.server}/namespaces/${this.state.namespace}/configmaps`
        fetch(target, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({name: this.state.newConfigMap})
        })
        .then(this.transitioner(this.state.newConfigMap))
        .catch(err => {
            this.setState({message: `Error creating new ConfigMap (${this.state.newConfigMap}): ${JSON.stringify(err, null, 4)}`})
        })
    }

    /**
     * Get a list of namespaces on the Kubernetes cluster and store in state
     */
    getConfigMaps = () => {
        const target = `${this.state.server}/namespaces/${this.state.namespace}/configMaps`
        fetch(target, {method: 'GET'})
        .then(response => {
            if (!response.ok) {
                throw Error(response.statusText);
            }
            return response.json();
        })
        .then(body => {
            const configMaps = body.map(configMap => {
                return {
                    name: configMap.name,
                    namespace: configMap.namespace,
                    configMapType: configMap.configMapyType,
                };
            })
            this.setState({configMaps});
        })
        .catch(err => {
            this.setState({message: `Error listing Kubernetes configMaps for namespace=${this.state.namespace}: ${JSON.stringify(err, null, 4)}`})
        });
    }

    transitioner = (configMapName) => {
        const displayContext = {
            namespace: this.state.namespace,
            configMap: configMapName,
        }
        const transition = () => this.props.transition(CONFIGMAP, displayContext);
        return transition;
    }

    renderConfigMaps = () => {
        return this.state.configMaps.map((configMap, i) => {
            return (
                <li key={i}>
                    <a href="#" onClick={this.transitioner(configMap.name)}>{configMap.name}</a>
                </li>
            )
        });
    }

    render() {
        if (!this.state.visible) {
            return null;
        }

        return (
            <div className="container" id="configMaps-list">
                <form id="create-configmap">
                    <div className="row">
                        <div className="nine columns" align="left">
                            <input className="u-full-width" type="text" id="configMapNameInput" onChange={this.updateNewConfigMap} />
                        </div>
                        <div className="three columns" align="left">
                            <input type="button" className="u-full-width button-primary" id="createConfigMapButton" value="Create" onClick={this.createNewConfigMap} />
                        </div>
                    </div>
                </form>
                <ul>
                    {this.renderConfigMaps()}
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

class ConfigMap extends React.Component {
    state = {
        server: process.env.REACT_APP_SAURON_SERVER || '',
        visible: false,
        namespace: null,
        name: null,
        configMap: {},
        message: '',
        newConfigMap: '',
    }

    /**
     * When component updates, make sure that the parent's expectations of visibility are reflected
     * in the component state.
     */
    componentDidUpdate() {
        if (this.props.visible !== this.state.visible) {
            this.setState({visible: this.props.visible});
        }
        if (this.props.namespace !== this.state.namespace || this.props.name !== this.state.name ) {
            this.setState({namespace: this.props.namespace, name: this.props.name}, () => {
                if (this.props.name) {
                    this.getConfigMap();
                }
            });
        }
    }

    /**
     * Get a list of namespaces on the Kubernetes cluster and store in state
     */
    getConfigMap = () => {
        const target = `${this.state.server}/namespaces/${this.state.namespace}/configMaps/${this.state.name}`;
        fetch(target, {method: 'GET'})
        .then(response => {
            if (!response.ok) {
                throw Error(response.statusText);
            }
            return response.json();
        })
        .then(body => {
            let configMap = body;
            this.setState({configMap, message: ''});
        })
        .catch(err => {
            this.setState({message: `Error retrieving Kubernetes configMap=${this.state.name} for namespace=${this.state.namespace}: ${err}`})
        });
    }

    renderConfigMap = () => {
        if (!this.state.configMap) {
            return null;
        }
        return Object.keys(this.state.configMap.data || {}).map(key => {
            return (
                <li key={`${this.state.namespace}.${this.state.name}.${key}`}>
                    {key}: <br/>
                    <textarea className="u-full-width" defaultValue={this.state.configMap.data[key]} />
                </li>
            )
        });
    }

    render() {
        if (!this.state.visible) {
            return null;
        }

        return (
            <div className="container" id="configMaps-list">
                <ul>
                    {this.renderConfigMap()}
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

export {ConfigMapsList, ConfigMap};
