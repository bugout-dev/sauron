import React from 'react';
import ReactDOM from 'react-dom';

import {Header} from './Header';
import {Namespace, NamespacesList} from './Namespaces';
import {Secret, SecretsList} from './Secrets';
import {NAMESPACES, NAMESPACE, CONFIGMAPS, CONFIGMAP, SECRETS, SECRET} from './displays';


class App extends React.Component {
    state = {
        display: NAMESPACES,
        displayContext: {},
    };

    changeDisplay = (displayType, displayContext) => {
        this.setState({
                display: displayType,
                displayContext
        });
    }

    render() {
        return (
            <div className="container">
                <Header transition={this.changeDisplay} display={this.state.display} displayContext={this.state.displayContext} />
                <NamespacesList visible={this.state.display === NAMESPACES} transition={this.changeDisplay} />
                <Namespace visible={this.state.display === NAMESPACE} transition={this.changeDisplay} name={this.state.displayContext.namespace} />
                <SecretsList visible={this.state.display === SECRETS} transition={this.changeDisplay} namespace={this.state.displayContext.namespace} />
                <Secret visible={this.state.display === SECRET} namespace={this.state.displayContext.namespace} name={this.state.displayContext.secret} />
            </div>
        )
    }
}

ReactDOM.render(<App />, document.getElementById('root'));
