const { Router } = require('express');
const { people, users } = require('../controllers');

const peopleRouter = Router();

peopleRouter.get('/', people.list);
peopleRouter.get('/:id', people.findById);
peopleRouter.get('/me', users.me);

module.exports = peopleRouter;
