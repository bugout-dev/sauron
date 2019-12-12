const express = require('express');
const k8s = require('@kubernetes/client-node');

const mappings = require('./mappings.js');

const app = express();
const port = 1729;

// Generate Kubernetes API client based on the SAURON_ENV environment variable.
// The valid values for SAURON_ENV are:
// 1. 'default'
// 2. 'cluster'
const VALID_SAURON_ENV = {
    'default': (kubeConfig) => {
        kubeConfig.loadFromDefault();
    },
    'cluster': (kubeConfig) => {
        kubeConfig.loadFromCluster();
    },
};
const SAURON_ENV = process.env.SAURON_ENV;
if (!VALID_SAURON_ENV[SAURON_ENV]) {
    throw Error(`Invalid value for SAURON_ENV environment variable: ${SAURON_ENV}. Must be one of ${Object.keys(VALID_SAURON_ENV).join(', ')}`);
}

const kc = new k8s.KubeConfig();
VALID_SAURON_ENV[SAURON_ENV](kc);
const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

app.get('/', (req, res) => res.send('Hello World!'));

app.get('/namespaces', (req, res) => {
    k8sApi.listNamespace()
        .then(k8sResponse => k8sResponse.body)
        .then(body => {
            const items = body.items || [];
            const namespaces = items.map(item => item.metadata.name);
            res.send(namespaces);
        })
        .catch(err => {
            console.log(`Error retrieving namespaces from Kubernetes API: ${err}`);
            res.sendStatus(500);
        });
});

app.get('/namespaces/:namespace/secrets', (req, res) => {
    const {namespace} = req.params;
    k8sApi.listNamespacedSecret(namespace)
        .then(k8sResponse => k8sResponse.body)
        .then(body => {
            const items = body.items || [];
            const secrets = items.map(mappings.secret);
            res.send(secrets);
        })
        .catch(err => {
            console.error(`Error retrieving Secrets from namespace=${namespace} from Kubernetes API: ${err}`);
            res.sendStatus(500);
        });
});

app.get('/namespaces/:namespace/secrets/:name', (req, res) => {
    const {namespace, name} = req.params;
    k8sApi.readNamespacedSecret(name, namespace)
        .then(k8sResponse => k8sResponse.body)
        .then(body => {
            res.send(mappings.secret(body));
        })
        .catch(err => {
            console.error(`Error retrieving Secrets from namespace=${namespace} from Kubernetes API: ${err}`);
            res.sendStatus(500);
        });
});

app.get('/namespaces/:namespace/configmaps', (req, res) => {
    const {namespace} = req.params;
    k8sApi.listNamespacedConfigMap(namespace)
        .then(k8sResponse => k8sResponse.body)
        .then(body => {
            const items = body.items || [];
            const configMaps = items.map(mappings.configMap);
            res.send(configMaps);
        })
        .catch(err => {
            console.error(`Error retrieving ConfigMaps from namespace=${namespace} from Kubernetes API: ${err}`);
            res.sendStatus(500);
        });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
