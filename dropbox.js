'use strict;'

global.fetch = require('node-fetch');
const Dropbox = require('dropbox').Dropbox;

exports.upload = upload;

async function upload(accessToken, path, contents) {
  const dropbox = new Dropbox({ accessToken });
  await dropbox.filesUpload({
    path, 
    contents
  });
}

