/* eslint-disable no-useless-return */
/* eslint-disable array-callback-return */

const yargs = require('yargs');
const path = require('path');
const fs = require('fs');

const args = yargs
  .usage('Usage: node $0 [options]')
  .help('help')
  .alias('help', 'h')
  .version('1.0.0')
  .alias('version', 'v')
  .example('node $0 --entry ./path/path --dist ./path/path --delete')
  .option('entry', {
    alias: 'e',
    describe: 'determine the path to the initial directory',
    demandOption: true
  })
  .option('dist', {
    alias: 'd',
    describe: 'where to sort',
    default: './dist'
  })
  .option('delete', {
    alias: 'D',
    describe: 'delete the initial folder',
    boolean: true,
    default: false
  })
  .epilog('first homework')
  .argv;

const config = {
  entry: path.join(__dirname, args.entry),
  dist: path.join(__dirname, args.dist),
  delete: args.delete
};

/*

function createDist (src, callback) {
  fs.mkdir(src, (error) => {
    if (error && error.code === 'EEXIST') {
      callback();
    }

    callback();
  });
}

function bookSorter (src) {
  fs.readdir(src, (error, files) => {
    if (error) throw error;

    files.map((file) => {
      const currentPath = path.join(src, file);

      fs.stat(currentPath, (error, stat) => {
        if (error) throw error;

        if (stat.isDirectory()) {
          bookSorter(currentPath);
        } else {
          createDist(config.dist, () => {
            const folderName = file[0].toUpperCase();
            const newPath = path.join(config.dist, folderName);

            createDist(newPath, () => {
              const finalPath = path.join(newPath, file);

              fs.link(currentPath, finalPath, error => {
                if (error && error.code === 'EEXIST') {
                  return;
                }
              });
            });
          });
        }
      });
    });
  });
}

try {
  bookSorter(config.entry);
} catch (error) {
  console.error(error);
}

*/

function createDist (src) {
  return new Promise((resolve, reject) => {
    fs.mkdir(src, (error) => {
      if (error && error.code === 'EEXIST') {
        resolve();
      } else if (error) {
        reject(error);
      }

      resolve();
    });
  });
}

function readdir (src) {
  return new Promise((resolve, reject) => {
    fs.readdir(src, (error, files) => {
      if (error) {
        reject(error);
      }

      resolve(files);
    });
  });
}

function stats (src) {
  return new Promise((resolve, reject) => {
    fs.stat(src, (error, stat) => {
      if (error) {
        reject(error);
      }

      resolve(stat);
    });
  });
}

function copyFile (oldPath, newPath) {
  return new Promise((resolve, reject) => {
    fs.copyFile(oldPath, newPath, (error) => {
      if (error) {
        reject(error);
      }

      resolve();
    });
  });
}

function removeFolder (src) {
  return new Promise((resolve, reject) => {
    fs.rm(src, { recursive: true, force: true }, (error) => {
      if (error) {
        reject(error);
      }

      resolve();
    });
  });
}

async function bookSorter (src) {
  const files = await readdir(src);

  for (const file of files) {
    const currentPath = path.join(src, file);
    const stat = await stats(currentPath);

    if (stat.isDirectory()) {
      await bookSorter(currentPath);
    } else {
      const folderName = file[0].toUpperCase();
      const newPath = path.join(config.dist, folderName);
      const finalPath = path.join(newPath, file);

      await createDist(config.dist);
      await createDist(newPath);
      await copyFile(currentPath, finalPath);
    }
  }
}

(async () => {
  try {
    await bookSorter(config.entry);

    if (config.delete) {
      removeFolder(config.entry);
    }
  } catch (error) {
    console.log(error);
  }
})();
