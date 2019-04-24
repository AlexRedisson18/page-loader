import axios from 'axios';
import nock from 'nock';
import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';
import httpAdapter from 'axios/lib/adapters/http';

import downloadPage from '../src';

const host = 'http://localhost';

axios.defaults.host = host;
axios.defaults.adapter = httpAdapter;

test('download simple html', async () => {
  const fixturePath = path.join(__dirname, '__fixtures__/simple-html.html');
  const fixtureContent = await fs.readFile(fixturePath, 'utf8');
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'test-directory-'));
  nock(host)
    .get('/')
    .reply(200, fixtureContent);

  await downloadPage(host, tmpDir);
  const filePath = await path.resolve(tmpDir, 'localhost.html');
  const fileContent = await fs.readFile(filePath, 'utf8');
  return expect(fileContent).toBe(fixtureContent);
});
