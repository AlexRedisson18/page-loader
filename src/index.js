import axios from 'axios';
import { promises as fs } from 'fs';
import _ from 'lodash';
import path from 'path';

const makeNewName = url => `${_.kebabCase(url.split('//').slice(1).join(''))}.html`;

const downloadPage = (url, pathForSave) => {
  const fileName = makeNewName(url);
  const newPathForSave = path.join(pathForSave, fileName);
  return fs.access(pathForSave)
    .then(() => axios.get(url))
    .then(response => fs.writeFile(newPathForSave, response.data, 'utf8'));
};

export default downloadPage;
