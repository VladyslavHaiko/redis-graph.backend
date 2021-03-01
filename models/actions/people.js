const User = require('../redis/user');

// return many people
function _manyPeople(listOfPersons) {
  return listOfPersons._results.map((r) => new User(r.get('user')));
}

// get a single person by id
const getById = function(session, id) {
  const query = ['MATCH (u:User {id: $id})', 'RETURN DISTINCT u'].join('\n');

  return session.query(query, { id }).then((result) => {
    if (result.hasNext()) {
      return User(result.next().get('u'));
    }
    throw { message: 'person not found', status: 404 };
  });
};

// get all people
const getAll = function(session) {
  return session.query('MATCH (user:User) RETURN user').then((result) => _manyPeople(result));
};

module.exports = {
  getAll,
  getById,
};
