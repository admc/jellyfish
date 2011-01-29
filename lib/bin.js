var shell = require('./shell');

if (process.argv[2] == "shell") {
  shell.start();
}
else {
  console.log("What would you like to do?");
}

