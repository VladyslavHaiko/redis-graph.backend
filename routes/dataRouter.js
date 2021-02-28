const { Router } = require('express');
const { data } = require('../controllers');

const dataRouter = Router();

dataRouter.get('/movies', data.check);
dataRouter.post('/genres',);

module.exports = dataRouter;
