import axios from 'axios';
import { promises as fs } from 'fs';
import path from 'path';
import url from 'url';
import cheerio from 'cheerio';
import debug from 'debug';
import httpAdapter from 'axios/lib/adapters/http';
import Listr from 'listr';

axios.defaults.adapter = httpAdapter;

const getLog = debug('page-loader:log');

const tagList = {
  link: 'href',
  img: 'src',
  script: 'src',
};

const isLink = link => link && !url.parse(link).host && link[1] !== '/';

// ('/assets/application.css', fileDirPath) => ru-hexlet-io-courses_files/assets-application.css
const makeLocalName = (link, dir = '') => {
  const result = link[0] === '/' ? link.slice(1) : link;
  return path.join(dir, result.replace(/\//g, '-'));
};

// replaces all '\W' by '-' and adds extension;
// ('https://ru.hexlet.io/courses', '.html') => 'ru-hexlet-io-courses.html'
const linkToCebab = (pageUrl, extension = '') => {
  const { hostname, pathname } = url.parse(pageUrl);
  if (pathname === '/') {
    const rawName = hostname.replace(/\W/g, '-');
    return `${rawName}${extension}`;
  }
  const rawName = `${hostname}${pathname}`.replace(/\W/g, '-');
  return `${rawName}${extension}`;
};

export default (pageUrl, pathForSave) => {
  const mainFile = {
    name: linkToCebab(pageUrl, '.html'),
    path: path.join(pathForSave, linkToCebab(pageUrl, '.html')),
  };
  const fileDir = {
    name: linkToCebab(pageUrl, '_file'),
    path: path.join(pathForSave, linkToCebab(pageUrl, '_files')),
  };
  const linksList = [];
  let changedHtml;
  return axios.get(pageUrl)
    .then((response) => {
      getLog('response: ', pageUrl);
      getLog('save to', pathForSave);
      const $ = cheerio.load(response.data);
      const keys = Object.keys(tagList);
      keys.forEach(tag => $(tag)
        .filter((i, elem) => {
          const link = $(elem).attr(tagList[tag]);
          return isLink(link);
        })
        .map((i, elem) => {
          const link = $(elem).attr(tagList[tag]);
          linksList.push(link);
          const localLink = makeLocalName(link, fileDir.name);
          getLog(`change ${link} to ${localLink}`);
          return $(elem).attr(tagList[tag], localLink);
        }));

      changedHtml = $.html();
      getLog('write file');
      return fs.writeFile(mainFile.path, changedHtml);
    })
    .then(() => fs.mkdir(fileDir.path))
    .then(() => {
      const tasks = new Listr(linksList.map(link => ({
        title: `Downloading file: ${link}`,
        task: () => axios
          .get(url.resolve(pageUrl, link), { responseType: 'arraybuffer' })
          .then((response) => {
            const filename = makeLocalName(link);
            const linkSavePath = path.join(fileDir.path, filename);
            getLog(`download content: ${filename}`);
            return fs.writeFile(linkSavePath, response.data);
          }),
      })), { concurrent: true });
      return tasks.run();
    });
};
