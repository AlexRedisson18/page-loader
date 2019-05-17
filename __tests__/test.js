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

const host = 'http://localhost';

test('download simple html', async () => {
  const tmpDir = await fs.mkdtemp(path.resolve(os.tmpdir(), 'test-directory-'));
  nock(host)
    .get('/')
    .replyWithFile(200, htmlNoLinks);
  await downloadPage(host, tmpDir);
  const receivedHtml = await fs.readFile(path.resolve(tmpDir, 'localhost.html'), 'utf8');
  const expectedHtml = await fs.readFile(htmlNoLinks, 'utf8');
  expect(receivedHtml).toBe(expectedHtml);
});

test('download changed html with resources', async () => {
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

  const receivedHtml = await fs.readFile(path.resolve(tmpDir, 'localhost.html'), 'utf8');
  const receivedImg = await fs.readFile(path.resolve(tmpDir, 'localhost_files/files-img.jpg'), 'utf8');
  const receivedScript = await fs.readFile(path.resolve(tmpDir, 'localhost_files/files-script.txt'), 'utf8');
  const receivedStyle = await fs.readFile(path.resolve(tmpDir, 'localhost_files/files-style.css'), 'utf8');

  const expectedHtml = await fs.readFile(htmlWithChangedLinks, 'utf8');
  const expectedImg = await fs.readFile(image, 'utf8');
  const expectedScript = await fs.readFile(script, 'utf8');
  const expectedStyle = await fs.readFile(style, 'utf8');

  expect(receivedHtml).toBe(expectedHtml);
  expect(receivedImg).toBe(expectedImg);
  expect(receivedScript).toBe(expectedScript);
  expect(receivedStyle).toBe(expectedStyle);
});

test('Error 404', async () => {
  const tmpDir = await fs.mkdtemp(path.resolve(os.tmpdir(), 'test-directory-'));
  nock(host)
    .get('/')
    .reply(404);
  await expect(downloadPage(host, tmpDir)).rejects.toThrowErrorMatchingSnapshot();
});
