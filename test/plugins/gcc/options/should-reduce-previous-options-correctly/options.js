const path = require('path');

module.exports = {
  "angular_pass": false,
  "compilation_level": "advanced",
  "externs": [path.join(__dirname, "original.externs.js")],
  "js": [path.join(__dirname, "original.js")]
}
