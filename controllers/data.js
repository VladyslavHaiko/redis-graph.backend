// movies.js
const Movies = require('../models/actions/movies');
const { writeResponse } = require('../helpers/response');
const loginRequired = require('../middlewares/loginRequired');
const dbUtils = require('../db/dbUtils');
const {
  ACTORS: { actors },
  // todo
  // DIRECTORS_OF_FILMS: { directors },
  GENRES: { genres },
  MOVIES: { movies },
  // todo
  // MOVIES_WITH_GENRES: { moviesWithGenres }
} = require('../data');

/**
 * @swagger
 * definition:
 *   Movie:
 *     type: object
 *     properties:
 *       id:
 *         type: integer
 *       title:
 *         type: string
 *       summary:
 *         type: object
 *       released:
 *         type: integer
 *       duration:
 *         type: integer
 *       rated:
 *         type: string
 *       tagline:
 *         type: string
 *       poster_image:
 *         type: string
 *       my_rating:
 *         type: integer
 */
exports.setGenres = function(req, res, next) {
  const session = dbUtils.getSession();
  genres.forEach((genre) => {
    session.query('create (g:Genre{name:$genre}) ', genre)
      .catch(next);
  });
  writeResponse(res, `added ${genres.length} genres`);
};

exports.setMovies = function(req, res, next) {
  const session = dbUtils.getSession();

  movies.forEach((movie) => {
    for (const field in movie) {
      if (movie[field].low) movie[field] = movie[field].low;
    }
  });
  movies.forEach(({
    url, id, languages, title, countries, budget, duration, imdbId, imdbRating, imdbVotes,
    movieId, plot, poster, poster_image, released, revenue, runtime, tagline, tmdbId, year
  }) => {
    session.query('create (m:Movie {url: $url,'
      + 'id:$id, '
      + 'languages:$languages,'
      + ' title:$title,'
      + ' countries:$countries,'
      + ' budget:$budget, '
      + 'duration:$duration,'
      + ' imdbId:$imdbId, '
      + 'imdbRating:$imdbRating,'
      + ' imdbVotes:$imdbVotes, '
      + 'movieId:$movieId, '
      + 'plot:$plot, '
      + 'poster:$poster,'
      + ' poster_image:$poster_image, '
      + 'released:$released, '
      + 'revenue:$revenue,'
      + ' runtime:$runtime,'
      + ' tagline:$tagline, '
      + 'tmdbId:$tmdbId, '
      + 'year:$year})',
    {
      url,
      id,
      languages,
      title,
      countries,
      budget,
      duration,
      imdbId,
      imdbRating,
      imdbVotes,
      movieId,
      plot,
      poster,
      poster_image,
      released,
      revenue,
      runtime,
      tagline,
      tmdbId,
      year
    })
      .catch(next);
  });

  writeResponse(res, `added ${movies.length} movies`);
  // writeResponse(res, movies[0]);
};
// todo
// eslint-disable-next-line no-unused-vars
exports.setActors = function(req, res, next) {
  // const session = dbUtils.getSession();

  actors.forEach((actor) => {
    for (const field in actor) {
      if (actor[field].actor.properties) actor[field].actor = actor[field].actor.properties;
      if (actor[field].actor.low) actor[field].actor = actor[field].actor.low;
    }
  });
  console.log(actors);
  // todo
  // actors.forEach(({
  //   actor: {
  //     bio, born, bornIn, died, imdbId, name, poster, tmdbId, url
  //   }, movieTitle, role
  // }) => {
  //   session.query(
  //     'MATCH (m:Movie)\n'
  //     + 'WHERE m.title=\'Toy Story\'\n'
  //     + 'CREATE (a:Actor)-[r:ACTED_IN_MOVIE {role:\'captain\'}]->(m)\n'
  //     + 'RETURN type(r), r.name,r.role', { }
  //   )
  //     .catch(next);
  // });

  writeResponse(res, `added ${actors.length} actors with relations [ACTED_IN_MOVIE] to their movies`);
};

/**
 * @swagger
 * /movies:
 *   get:
 *     tags:
 *     - movies
 *     description: Find all movies
 *     summary: Find all movies
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: A list of movies
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/Movie'
 */
exports.list = function(req, res, next) {
  Movies.getAll(dbUtils.getSession())
    .then((response) => writeResponse(res, response))
    .catch(next);
};

/**
 * @swagger
 * /movies/{id}:
 *   get:
 *     tags:
 *     - movies
 *     description: Find movie by ID
 *     summary: Find movie by ID
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: movie id
 *         in: path
 *         required: true
 *         type: integer
 *       - name: Authorization
 *         in: header
 *         type: string
 *         description: Token (token goes here)
 *     responses:
 *       200:
 *         description: A movie
 *         schema:
 *           $ref: '#/definitions/Movie'
 *       404:
 *         description: movie not found
 */
exports.findById = function(req, res, next) {
  Movies.getById(dbUtils.getSession(), req.params.id, req.user.id)
    .then((response) => writeResponse(res, response))
    .catch(next);
};

/**
 * @swagger
 * /movies/genre/{id}:
 *   get:
 *     tags:
 *     - movies
 *     description: Returns movies based on genre id
 *     summary: Returns movies based on genre id
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: genre id
 *         in: path
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: A list of movies
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/Movie'
 *       400:
 *         description: Invalid genre id
 */
exports.findByGenre = function(req, res, next) {
  const { id } = req.params;
  if (!id) throw { message: 'Invalid id', status: 400 };

  Movies.getByGenre(dbUtils.getSession(), id)
    .then((response) => writeResponse(res, response))
    .catch(next);
};

/**
 * @swagger
 * /movies/daterange/{start}/{end}:
 *   get:
 *     tags:
 *     - movies
 *     description: Returns movies between a year range
 *     summary: Returns movies between a year range
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: start
 *         description: Year that the movie was released on or after
 *         in: path
 *         required: true
 *         type: integer
 *       - name: end
 *         description: Year that the movie was released before
 *         in: path
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: A list of movies
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/Movie'
 *       400:
 *         description: Error message(s)
 */
exports.findMoviesByDateRange = function(req, res, next) {
  const { start } = req.params;
  const { end } = req.params;

  if (!start) throw { message: 'Invalid start', status: 400 };
  if (!end) throw { message: 'Invalid end', status: 400 };

  Movies.getByDateRange(dbUtils.getSession(), start, end)
    .then((response) => writeResponse(res, response))
    .catch(next);
};

/**
 * @swagger
 * /movies/directed_by/{id}:
 *   get:
 *     tags:
 *     - movies
 *     description: Returns movies directed by a person
 *     summary: Returns movies directed by a person
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: Id of the director person
 *         in: path
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: A list of movies
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/Movie'
 *       400:
 *         description: Error message(s)
 */
exports.findMoviesByDirector = function(req, res, next) {
  const { id } = req.params;
  if (!id) throw { message: 'Invalid id', status: 400 };

  Movies.getMoviesbyDirector(dbUtils.getSession(), id)
    .then((response) => writeResponse(res, response))
    .catch(next);
};

/**
 * @swagger
 * /movies/acted_in_by/{id}:
 *   get:
 *     tags:
 *     - movies
 *     description: Returns movies acted in by some person
 *     summary: Returns movies acted in by some person
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: id of the actor who acted in the movies
 *         in: path
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: A list of movies
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/Movie'
 *       400:
 *         description: Error message(s)
 */
exports.findMoviesByActor = function(req, res, next) {
  const { id } = req.params;
  if (!id) throw { message: 'Invalid id', status: 400 };

  Movies.getByActor(dbUtils.getSession(req), id)
    .then((response) => writeResponse(res, response))
    .catch(next);
};

/**
 * @swagger
 * /movies/written_by/{id}:
 *   get:
 *     tags:
 *     - movies
 *     description: Returns movies written by some person
 *     summary: Returns movies written by some person
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: id of the writer who wrote the movies
 *         in: path
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: A list of movies
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/Movie'
 *       400:
 *         description: Error message(s)
 */
exports.findMoviesByWriter = function(req, res, next) {
  const { id } = req.params;
  if (!id) throw { message: 'Invalid id', status: 400 };

  Movies.getMoviesByWriter(dbUtils.getSession(req), id)
    .then((response) => writeResponse(res, response))
    .catch(next);
};

/**
 * @swagger
 * /movies/{id}/rate:
 *   post:
 *     tags:
 *     - movies
 *     description: Rate a movie from 0-5 inclusive
 *     summary: Rate a movie from 0-5 inclusive
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: id of the writer who wrote the movies
 *         in: path
 *         required: true
 *         type: integer
 *       - name: body
 *         in: body
 *         type: object
 *         schema:
 *           properties:
 *             rating:
 *               type: integer
 *       - name: Authorization
 *         in: header
 *         type: string
 *         required: true
 *         description: Token (token goes here)
 *     responses:
 *       200:
 *         description: movie rating saved
 *       400:
 *         description: Error message(s)
 *       401:
 *         description: invalid / missing authentication
 */
exports.rateMovie = function(req, res, next) {
  loginRequired(req, res, () => {
    let { rating } = req.body;
    rating = Number(rating);
    if (Number.isNaN(rating) || rating < 0 || rating >= 6) {
      throw { rating: 'Rating value is invalid', status: 400 };
    }

    Movies.rate(dbUtils.getSession(), req.params.id, req.user.id, rating)
      .then(() => writeResponse(res, {}))
      .catch(next);
  });
};

/**
 * @swagger
 * /movies/{id}/rate:
 *   delete:
 *     tags:
 *     - movies
 *     description: Delete your rating for a movie
 *     summary: Delete your rating for a movie
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: id of the writer who wrote the movies
 *         in: path
 *         required: true
 *         type: integer
 *       - name: Authorization
 *         in: header
 *         type: string
 *         required: true
 *         description: Token (token goes here)
 *     responses:
 *       204:
 *         description: movie rating deleted
 *       400:
 *         description: Error message(s)
 *       401:
 *         description: invalid / missing authentication
 */
exports.deleteMovieRating = function(req, res, next) {
  if (!req.params.id) {
    throw { message: 'Invalid movie id', status: 400 };
  }

  loginRequired(req, res, () => {
    Movies.deleteRating(dbUtils.getSession(), req.params.id, req.user.id)
      .then((response) => writeResponse(res, response, 204))
      .catch(next);
  });
};

/**
 * @swagger
 * /movies/rated:
 *   get:
 *     tags:
 *     - movies
 *     description: A list of movies the authorized user has rated
 *     summary: A list of movies the authorized user has rated
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: Authorization
 *         in: header
 *         type: string
 *         required: true
 *         description: Token (token goes here)
 *     responses:
 *       200:
 *         description: A list of movies
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/Movie'
 *       401:
 *         description: invalid / missing authentication
 */
exports.findMoviesRatedByMe = function(req, res, next) {
  loginRequired(req, res, () => {
    Movies.getRatedByUser(dbUtils.getSession(), req.user.id)
      .then((response) => writeResponse(res, response, 200))
      .catch(next);
  });
};

/**
 * @swagger
 * /movies/recommended:
 *   get:
 *     tags:
 *     - movies
 *     description: A list of recommended movies for the authorized user
 *     summary: A list of recommended movies for the authorized user
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: Authorization
 *         in: header
 *         type: string
 *         required: true
 *         description: Token (token goes here)
 *     responses:
 *       200:
 *         description: A list of movies
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/Movie'
 *       401:
 *         description: invalid / missing authentication
 */
exports.getRecommendedMovies = function(req, res, next) {
  loginRequired(req, res, () => {
    Movies.getRecommended(dbUtils.getSession(), req.user.id)
      .then((response) => writeResponse(res, response, 200))
      .catch(next);
  });
};
