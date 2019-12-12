/**
 * mappings.js
 *
 * Defines mappings between representations of resources returned by the Kubernetes API and those
 * returned by the Sauron API.
 */

function mapSecret(rawSecret) {
    const transformedSecret = {
        namespace: rawSecret.metadata.namespace,
        name: rawSecret.metadata.name,
        createdAt: rawSecret.metadata.creationTimestamp,
        data: rawSecret.data || {},
        secretType: rawSecret.type,
    };
    return transformedSecret;
}

function mapConfigMap(rawConfigMap) {
    const transformedConfigMap = {
        namespace: rawConfigMap.metadata.namespace,
        name: rawConfigMap.metadata.name,
        createdAt: rawConfigMap.metadata.creationTimestamp,
        data: rawConfigMap.data || {},
    };
    return transformedConfigMap;
}

module.exports = {
    secret: mapSecret,
    configMap: mapConfigMap,
};
