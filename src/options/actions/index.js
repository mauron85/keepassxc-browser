if (process && process.env.NODE_ENV === 'production') {
  module.exports = require('./actions');
} else {
  module.exports = require('./mock');
}
