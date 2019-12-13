const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const k8s = require('@kubernetes/client-node');

const mappings = require('./mappings.js');

const app = express();
const port = 1729;

app.use(cors());
app.use(bodyParser.json());

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

// Expose UI as static files served from SAURON_UI_BUILD directory
const SAURON_UI_BUILD = process.env.SAURON_UI_BUILD;
if (SAURON_UI_BUILD) {
    console.info(`Serving UI at / from: ${SAURON_UI_BUILD}`)
    app.use(express.static(SAURON_UI_BUILD));
}

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
            console.error(`Error retrieving Secret (${name}) from namespace=${namespace} from Kubernetes API: ${err}`);
            res.sendStatus(500);
        });
});

app.post('/namespaces/:namespace/secrets', (req, res) => {
    const {namespace} = req.params;
    if (!req.body.name) {
        return res.sendStatus(400);
    }
    k8sApi.createNamespacedSecret(namespace, {metadata: {name: req.body.name}})
        .then(k8sResponse => k8sResponse.body)
        .then(body => {
            res.send(mappings.secret(body));
        })
        .catch(err => {
            console.error(`Error creating Secret (${name}) in namespace=${namespace}: ${err}`);
            res.sendStatus(500);
        });
});

app.put('/namespaces/:namespace/secrets/:name', (req, res) => {
    const {namespace, name} = req.params;
    console.log(req.body)
    k8sApi.replaceNamespacedSecret(name, namespace, req.body)
        .then(k8sResponse => k8sResponse.body)
        .then(body => {
            res.send(mappings.secret(body));
        })
        .catch(err => {
            console.error(`Error replacing Secret (${name}) in namespace=${namespace}: ${err}`);
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

app.get('/namespaces/:namespace/configmaps/:name', (req, res) => {
    const {namespace, name} = req.params;
    k8sApi.readNamespacedConfigMap(name, namespace)
        .then(k8sResponse => k8sResponse.body)
        .then(body => {
            res.send(mappings.configMap(body));
        })
        .catch(err => {
            console.error(`Error retrieving ConfigMap (${name}) from namespace=${namespace} from Kubernetes API: ${err}`);
            res.sendStatus(500);
        });
});

app.post('/namespaces/:namespace/configmaps', (req, res) => {
    const {namespace} = req.params;
    if (!req.body.name) {
        return res.sendStatus(400);
    }
    k8sApi.createNamespacedConfigMap(namespace, {metadata: {name: req.body.name}})
        .then(k8sResponse => k8sResponse.body)
        .then(body => {
            res.send(mappings.configMap(body));
        })
        .catch(err => {
            console.error(`Error creating ConfigMap (${req.body.name}) in namespace=${namespace}: ${err}`);
            res.sendStatus(500);
        });
});

app.put('/namespaces/:namespace/configmaps/:name', (req, res) => {
    const {namespace, name} = req.params;
    console.log(req.body)
    k8sApi.replaceNamespacedConfigMap(name, namespace, req.body)
        .then(k8sResponse => k8sResponse.body)
        .then(body => {
            res.send(mappings.configMap(body));
        })
        .catch(err => {
            console.error(`Error replacing ConfigMap (${name}) in namespace=${namespace}: ${err}`);
            res.sendStatus(500);
        });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
