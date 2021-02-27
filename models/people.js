const _ = require('lodash');
const Person = require('./neo4j/person');

const _singlePersonWithDetails = function(person) {
  if (person.length) {
    const result = {};
    _.extend(result, new Person(person.get('person')));
    // mappings are temporary until the neo4j driver team decides what to do about numbers
    result.directed = _.map(person.get('directed'), (record) => record);
    result.produced = _.map(person.get('produced'), (record) => record);
    result.wrote = _.map(person.get('wrote'), (record) => record);
    result.actedIn = _.map(person.get('actedIn'), (record) => record);
    result.related = _.map(person.get('related'), (record) => record);
    return result;
  }

  return null;
};

// return many people
function _manyPeople(listOfPersons) {
  return listOfPersons._results.map((r) => new Person(r.get('person')));
}

// get a single person by id
const getById = function(session, id) {
  const query = [
    'MATCH (person:Person {tmdbId: $id})',
    'OPTIONAL MATCH (person)-[:DIRECTED]->(d:Movie)',
    'OPTIONAL MATCH (person)<-[:PRODUCED]->(p:Movie)',
    'OPTIONAL MATCH (person)<-[:WRITER_OF]->(w:Movie)',
    'OPTIONAL MATCH (person)<-[r:ACTED_IN]->(a:Movie)',
    'OPTIONAL MATCH (person)-->(movies)<-[relatedRole:ACTED_IN]-(relatedPerson)',
    'RETURN DISTINCT person,',
    'collect(DISTINCT { name:d.title, id:d.tmdbId, poster_image:d.poster}) AS directed,',
    'collect(DISTINCT { name:p.title, id:p.tmdbId, poster_image:p.poster}) AS produced,',
    'collect(DISTINCT { name:w.title, id:w.tmdbId, poster_image:w.poster}) AS wrote,',
    'collect(DISTINCT{ name:a.title, id:a.tmdbId, poster_image:a.poster, role:r.role}) AS actedIn,',
    'collect(DISTINCT{ name:relatedPerson.name, id:relatedPerson.tmdbId, poster_image:relatedPerson.poster, role:relatedRole.role}) AS related'
  ].join('\n');

  return session.query(query, { id }).then((result) => {
    if (result.hasNext()) {
      return _singlePersonWithDetails(result._results[0]);
    }
    throw { message: 'person not found', status: 404 };
  });
};

// get all people
const getAll = function(session) {
  return session.query('MATCH (person:Person) RETURN person').then((result) => _manyPeople(result));
};

// get people in Bacon path, return many persons
const getBaconPeople = function(session, name1, name2) {
// needs to be optimized
  const query = [
    'MATCH p = shortestPath( (p1:Person {name: $name1 })-[:ACTED_IN*]-(target:Person {name: $name2 }) )',
    'WITH [n IN nodes(p) WHERE n:Person | n] as bacon',
    'UNWIND(bacon) AS person',
    'RETURN DISTINCT person'
  ].join('\n');

  return session.query(query, {
    name1,
    name2
  }).then((result) => _manyPeople(result));
};

module.exports = {
  getAll,
  getById,
  getBaconPeople
};
