//All the jellyfish envs in one place to make it easy to add new ones

var zombieEnv = require('./env/zombieEnv')
  , browserEnv = require('./env/browserEnv')
  , sauceEnv = require('./env/sauceEnv')
  , webdriverEnv = require('./env/webdriverEnv')
//, seleniumEnv = require('./env/seleniumEnv')
  ;

exports.zombieEnv = zombieEnv;
exports.browserEnv = browserEnv;
exports.sauceEnv = sauceEnv;
exports.webdriverEnv = webdriverEnv;