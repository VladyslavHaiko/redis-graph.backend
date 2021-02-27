// extracts just the data from the query results

const _ = require('lodash');

const Movie = function(_node, myRating) {
  _.extend(this, _node.properties);

  // this.id = this.tmdbId;
  // this.poster_image = this.poster;
  // this.tagline = this.plot;

  if (this.duration) {
    this.duration = Number(this.duration);
  } else if (this.runtime) {
    this.duration = Number(this.runtime);
  }

  if (myRating || myRating === 0) {
    this.my_rating = myRating;
  }
};
module.exports = Movie;
