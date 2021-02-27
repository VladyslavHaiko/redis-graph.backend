require('dotenv').config();

const express = require('express');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const nconf = require('./config');
const routes = require('./routes');
const setAuthUser = require('./middlewares/setAuthUser');
const neo4jSessionCleanup = require('./middlewares/neo4jSessionCleanup');
const { writeError } = require('./helpers/response');

const app = express();
const api = express();

app.use(nconf.get('api_path'), api);

const swaggerDefinition = {
  info: {
    title: 'Redis-graph Movie Demo API (Node/Express)',
    version: '1.0.0',
    description: '',
  },
  host: 'localhost:3001',
  basePath: '/',
};

// options for the swagger docs
const options = {
  // import swaggerDefinitions
  swaggerDefinition,
  // path to the API docs
  apis: ['./routes/*.js'],
};

// initialize swagger-jsdoc
const swaggerSpec = swaggerJSDoc(options);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.set('port', nconf.get('PORT'));

api.use(bodyParser.json());
api.use(methodOverride());

// enable CORS
api.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header(
    'Access-Control-Allow-Methods',
    'GET,HEAD,OPTIONS,POST,PUT,DELETE'
  );
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  next();
});

// api custom middlewares:
api.use(setAuthUser);
api.use(neo4jSessionCleanup);

// api routes
api.post('/register', routes.users.register);
api.post('/login', routes.users.login);
api.get('/users/me', routes.users.me);

api.get('/movies', routes.movies.list);
api.get('/movies/recommended', routes.movies.getRecommendedMovies);
api.get('/movies/rated', routes.movies.findMoviesRatedByMe);
api.get('/movies/:id', routes.movies.findById);
api.get('/movies/genre/:id', routes.movies.findByGenre);
api.get('/movies/daterange/:start/:end', routes.movies.findMoviesByDateRange);
api.get('/movies/directed_by/:id', routes.movies.findMoviesByDirector);
api.get('/movies/acted_in_by/:id', routes.movies.findMoviesByActor);
api.get('/movies/written_by/:id', routes.movies.findMoviesByWriter);
api.post('/movies/:id/rate', routes.movies.rateMovie);
api.delete('/movies/:id/rate', routes.movies.deleteMovieRating);

api.get('/people', routes.people.list);
api.get('/people/:id', routes.people.findById);
api.get('/people/bacon', routes.people.getBaconPeople);

api.get('/genres', routes.genres.list);

// api error handler
api.use((err, req, res, next) => {
  if (err && err.status) {
    writeError(res, err);
  } else next(err);
});

app.listen(app.get('port'), () => {
  console.log(
    `Express server listening on port ${app.get('port')} see docs at /docs`
  );
});
