const RedisGraph = require('redisgraph.js').Graph;
const nconf = require('../config');

const graph_name = nconf.get('GRAPH_NAME');
const host = nconf.get('REDIS_HOST');
const port = nconf.get('REDIS_PORT');
const password = nconf.get('REDIS_PASSWORD');

const graph = new RedisGraph(graph_name, host, port, { password });

exports.getSession = () => graph;

exports.dbWhere = function(name, keys) {
  if (_.isArray(name)) {
    _.map(name, (obj) => _whereTemplate(obj.name, obj.key, obj.paramKey));
  } else if (keys && keys.length) {
    return `WHERE ${_.map(keys, (key) => _whereTemplate(name, key)).join(' AND ')}`;
  }
};

function whereTemplate(name, key, paramKey) {
  return `${name}.${key}={${paramKey || key}}`;
}
