import React from 'react';

import {SECRET} from './displays';

import './css/normalize.css';
import './css/skeleton.css';

class SecretsList extends React.Component {
    state = {
        server: process.env.REACT_APP_SAURON_SERVER || '',
        visible: false,
        namespace: null,
        secrets: [],
        message: '',
        newSecret: '',
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
            this.setState({namespace: this.props.namespace}, this.getSecrets);
        }
    }

    updateNewSecret = (event) => {
        this.setState({newSecret: event.target.value});
    }

    createNewSecret = () => {
        const target = `${this.state.server}/namespaces/${this.state.namespace}/secrets`
        fetch(target, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({name: this.state.newSecret})
        })
        .then(this.transitioner(this.state.newSecret))
        .catch(err => {
            this.setState({message: `Error creating new secret (${this.state.newSecret}): ${JSON.stringify(err, null, 4)}`})
        })
    }

    /**
     * Get a list of namespaces on the Kubernetes cluster and store in state
     */
    getSecrets = () => {
        const target = `${this.state.server}/namespaces/${this.state.namespace}/secrets`
        fetch(target, {method: 'GET'})
        .then(response => {
            if (!response.ok) {
                throw Error(response.statusText);
            }
            return response.json();
        })
        .then(body => {
            const secrets = body.map(secret => {
                return {
                    name: secret.name,
                    namespace: secret.namespace,
                    secretType: secret.secretType,
                };
            })
            this.setState({secrets});
        })
        .catch(err => {
            this.setState({message: `Error listing Kubernetes secrets for namespace=${this.state.namespace}: ${JSON.stringify(err, null, 4)}`})
        });
    }

    transitioner = (secretName) => {
        const displayContext = {
            namespace: this.state.namespace,
            secret: secretName,
        }
        const transition = () => this.props.transition(SECRET, displayContext);
        return transition;
    }

    renderSecrets = () => {
        return this.state.secrets.map((secret, i) => {
            return (
                <li key={i}>
                    <a href="#" onClick={this.transitioner(secret.name)}>{secret.name}</a>
                </li>
            )
        });
    }

    render() {
        if (!this.state.visible) {
            return null;
        }

        return (
            <div className="container" id="secrets-list">
                <form id="create-secret">
                    <div className="row">
                        <div className="nine columns" align="left">
                            <input className="u-full-width" type="text" id="secretNameInput" onChange={this.updateNewSecret} />
                        </div>
                        <div className="three columns" align="left">
                            <input type="button" className="u-full-width button-primary" id="createSecretButton" value="Create" onClick={this.createNewSecret} />
                        </div>
                    </div>
                </form>
                <ul>
                    {this.renderSecrets()}
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

class Secret extends React.Component {
    state = {
        server: process.env.REACT_APP_SAURON_SERVER || '',
        visible: false,
        namespace: null,
        name: null,
        secret: {},
        message: '',
        newDataKey: '',
        newDataValue: '',
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
                    this.getSecret();
                }
            });
        }
    }

    secretValueUpdater = (key) => {
        const updater= (event) => {
            if (this.state.secret) {
                const secret = this.state.secret;
                if (!secret.data) {
                    secret.data = {};
                }
                secret.data[key] = btoa(event.target.value);
                this.setState({secret});
            }
        }
        return updater;
    }

    inputUpdater = (key) => {
        const updateStateKey = (event) => {
            const update = {}
            update[key] = event.target.value;
            this.setState(update);
        };
        return updateStateKey;
    }

    addNewDataInMemory = () => {
        if (this.state.secret) {
            const secret = this.state.secret;
            if (!secret.data) {
                secret.data = {};
            }
            secret.data[this.state.newDataKey] = btoa(this.state.newDataValue);
            this.setState({secret, newDataKey: '', newDataValue: ''});
        }
    }

    replaceSecret = () => {
        const target = `${this.state.server}/namespaces/${this.state.namespace}/secrets/${this.state.name}`;
        fetch(target, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                metadata: {
                    namespace: this.state.namespace,
                    name: this.state.name,
                },
                data: this.state.secret.data || {},
            }),
        })
        .then(response => {
            if (!response.ok) {
                throw Error(response.statusText);
            }
            return response.json();
        })
        .then(body => {
            let secret = body;
            this.setState({secret, message: ''});
        })
        .catch(err => {
            this.setState({message: `Error retrieving Kubernetes secret=${this.state.name} for namespace=${this.state.namespace}: ${err}`})
        });
    }

    /**
     * Get all secrets in the given namespace on the Kubernetes cluster and store in state
     */
    getSecret = () => {
        const target = `${this.state.server}/namespaces/${this.state.namespace}/secrets/${this.state.name}`;
        fetch(target, {method: 'GET'})
        .then(response => {
            if (!response.ok) {
                throw Error(response.statusText);
            }
            return response.json();
        })
        .then(body => {
            let secret = body;
            this.setState({secret, message: ''});
        })
        .catch(err => {
            this.setState({message: `Error retrieving Kubernetes secret=${this.state.name} for namespace=${this.state.namespace}: ${err}`})
        });
    }

    renderSecret = () => {
        if (!this.state.secret) {
            return null;
        }
        return Object.keys(this.state.secret.data || {}).map(key => {
            return (
                <li key={`${this.state.namespace}.${this.state.name}.${key}`}>
                    {key}: <br/>
                    <textarea className="u-full-width" value={atob(this.state.secret.data[key])} onChange={this.secretValueUpdater(key)} />
                </li>
            )
        });
    }

    render() {
        if (!this.state.visible) {
            return null;
        }

        return (
            <div className="container" id="secret-data">
                <div className="row">
                    <div className="twelve columns">
                        <button className="u-full-width button-primary" onClick={this.replaceSecret}>Submit your changes</button>
                    </div>
                </div>
                <div className="row">
                    <div className="twelve columns">
                        <button className="u-full-width" onClick={this.getSecret}>Undo your changes</button>
                    </div>
                </div>
                <ul>
                    {this.renderSecret()}
                </ul>
                <div className="row">
                    <div className="twelve columns">
                        <center>{this.state.message || ''}</center>
                    </div>
                </div>
                <form id="create-secret-data">
                    <div className="row">
                        <div className="four columns" align="left">
                            <label htmlFor="newSecretDataKey">Key:</label>
                            <input className="u-full-width" type="text" placeholder="New key" id="newSecretDataKey" onChange={this.inputUpdater('newDataKey')} value={this.state.newDataKey} />
                        </div>
                    </div>
                    <div className="row">
                        <div className="twelve columns" align="left">
                            <label htmlFor="newSecretDataValue">Value:</label>
                            <textarea className="u-full-width" placeholder="New value" id="newSecretDataValue" onChange={this.inputUpdater('newDataValue')} value={this.state.newDataValue} />
                        </div>
                    </div>
                    <div className="row">
                        <div className="two columns">
                            <input type="button" className="u-full-width" id="addSecretDataButton" value="Add" onClick={this.addNewDataInMemory} />
                        </div>
                    </div>
                </form>
            </div>
        )
    }
}

export {SecretsList, Secret};
