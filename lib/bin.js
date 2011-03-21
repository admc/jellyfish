var shell = require('./shell')
  , jellyfish = require('./main');

if (process.argv[2] == "shell") {
  shell.start();
}
//cmd line chrome launcher
else if (process.argv[2] == "chrome") {
  //goto provided url
  if (process.argv[3]) {
    jellyfish.createChrome(process.argv[3]);
  }
  else {
    jellyfish.createChrome();
  }
}
//cmd line firefox launcher
else if (process.argv[2] == "firefox") {
  //goto provided url
  if (process.argv[3]) {
    jellyfish.createFirefox(process.argv[3]);
  }
  else {
    jellyfish.createFirefox();
  }
}
else {
  console.log("What would you like to do?");
  console.log("shell, firefox, chrome")
}

