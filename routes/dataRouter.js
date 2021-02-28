const { Router } = require('express');
const { data } = require('../controllers');

const dataRouter = Router();

dataRouter.post('/genres', data.setGenres);
dataRouter.post('/movies', data.setMovies);
// dataRouter.post('/genres',);

module.exports = dataRouter;
