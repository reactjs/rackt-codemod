'use strict';

jest.autoMockOff();

require('babel-polyfill');

const fs = require('fs');
const jscodeshift = require('jscodeshift');
const p = require('path');

const read = fileName => fs.readFileSync(
  p.join(__dirname, global.baseDir, 'test', fileName),
  'utf8'
);

global.test = (transformName, testFileName, options, fakeOptions) => {
  let path = testFileName + '.js';
  const source = read(testFileName + '.js');
  const output = read(testFileName + '.output.js');
  const transform = require(
    p.join(global.baseDir, '/modules/', transformName)
  );

  if (fakeOptions) {
    if (fakeOptions.path) {
      path = fakeOptions.path;
    }
  }

  expect(
    (transform({path, source}, {jscodeshift}, options || {}) || '').trim()
  ).toEqual(
    output.trim()
  );
};

