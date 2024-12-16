#! /usr/bin/env node
const fs = require('fs').promises;
const path = require('path');
const prettier = require('prettier');

const filePath = path.join(process.cwd(), 'orbital.config.json');

function fetchTaxonomyFromSchemaServer(config) {
  return new Promise((resolve, reject) => {
    console.log(`Reading the taxonomy from the configured Orbital server in ${config.orbitalServerUrl}.`);
    const client = require(config.orbitalServerUrl.includes('https') ? 'https' : 'http');
    client.get(`${config.orbitalServerUrl}api/taxonomy/typescript`, (res) => {
      if (res.statusCode !== 200) {
        res.resume();
        reject(`Failed to obtain the taxonomy from the configured schema server due to HTTP error code ${res.statusCode}. Please make sure that your machine is able to connect to the schema server.`);
        return;
      }

      let taxonomy = '';
      res.on('data', (chunk) => {
        taxonomy += chunk;
      });

      res.on('close', () => {
        console.log('Successfully retrieved the taxonomy from the configured schema server. Writing it to the local schema file.');
        console.log(taxonomy);
        resolve(taxonomy);
      });
    });
  })
}

fs.readFile(filePath, { encoding: 'utf-8' }).then(
  (data) => {
    console.log('Successfully read the Orbital configuration file.');
    return JSON.parse(data);
  },
  (err) => {
    console.error("Failed to read the Orbital configuration file. See the next message for details.");
    console.error(err);
  }
).then(config => fetchTaxonomyFromSchemaServer(config).catch((err) => {
    console.error("Failed to retrieve the taxonomy from the configured schema server. See the next message for details.");
    console.error(err);
  })
).then(taxonomy => {
  return new Promise(async (resolve, reject) => {
    const prettifiedTaxonomy = await prettier.format(taxonomy, {
      parser: "typescript",
      singleQuote: true,
      trailingComma: "es5",
      semi: true,
      tabWidth: 2,
      printWidth: 100
    });

    fs.writeFile('taxonomy.ts', prettifiedTaxonomy, err => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    })
  })
});
