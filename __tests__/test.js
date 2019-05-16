import axios from 'axios';
import nock from 'nock';
import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';
import httpAdapter from 'axios/lib/adapters/http';

import downloadPage from '../src';

axios.defaults.adapter = httpAdapter;

const htmlNoLinks = path.resolve(__dirname, '__fixtures__/html-without-links.html');
const htmlWithLinks = path.resolve(__dirname, '__fixtures__/html-with-links.html');
const htmlWithChangedLinks = path.resolve(__dirname, '__fixtures__/html-with-changed-links.html');
const image = path.resolve(__dirname, '__fixtures__/files/img.jpg');
const script = path.resolve(__dirname, '__fixtures__/files/script.txt');
const style = path.resolve(__dirname, '__fixtures__/files/style.css');

test('download simple html', async () => {
  const host = 'http://localhost';
  const fixtureContent = await fs.readFile(htmlNoLinks, 'utf8');
  const tmpDir = await fs.mkdtemp(path.resolve(os.tmpdir(), 'test-directory-'));
  nock(host)
    .get('/')
    .reply(200, fixtureContent);

  await downloadPage(host, tmpDir);
  const fileContent = await fs.readFile(path.resolve(tmpDir, 'localhost.html'), 'utf8');
  return expect(fileContent).toBe(fixtureContent);
});

test('download changed html', async () => {
  const host = 'http://localhost';
  const tmpDir = await fs.mkdtemp(path.resolve(os.tmpdir(), 'test-directory-'));
  nock(host)
    .get('/')
    .replyWithFile(200, htmlWithLinks);
  nock(host)
    .get('/files/img.jpg')
    .replyWithFile(200, image);
  nock(host)
    .get('/files/script.txt')
    .replyWithFile(200, script);
  nock(host)
    .get('/files/style.css')
    .replyWithFile(200, style);
  await downloadPage(host, tmpDir);
  const result = await fs.readFile(htmlWithChangedLinks, 'utf8');
  const fileContent = await fs.readFile(path.resolve(tmpDir, 'localhost.html'), 'utf8');
  return expect(fileContent).toBe(result);
});
