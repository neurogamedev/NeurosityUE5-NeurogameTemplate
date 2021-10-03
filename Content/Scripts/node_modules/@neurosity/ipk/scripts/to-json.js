const fs = require("fs");
const mkdirp = require("mkdirp");

const ipk = require("../dist/cjs/index");

const dir = "dist/json";
const path = `${dir}/index.json`;
const contents = JSON.stringify(ipk, null, 2);

mkdirp(dir, function(err) {
  if (err) {
    return console.error(err);
  }

  fs.writeFile(path, contents, error => {
    if (error) {
      return console.error(error);
    }

    console.log("to-json was successful");
  });
});
