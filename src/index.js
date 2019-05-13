import axios from 'axios';
import { promises as fs } from 'fs';
import path from 'path';
import url from 'url';
import cheerio from 'cheerio';

const tagList = {
  link: 'href',
  img: 'src',
  script: 'src',
};

const isLink = link => link && !url.parse(link).host && link[1] !== '/';

// assets/application.css => ru-hexlet-io-courses_files/assets-application.css
const makeLocalName = (link, dir = '') => {
  const result = link[0] === '/' ? link.slice(1) : link;
  return path.join(dir, result.replace(/\//g, '-'));
};

// replaces all '\W' by '-' and adds extension;
const linkToCebab = (pageUrl, extension = '') => {
  const { hostname, pathname } = url.parse(pageUrl);
  const rawName = `${hostname}${pathname}`.replace(/\W/g, '-');
  return `${rawName}${extension}`;
};

export default (pageUrl, pathForSave) => {
  const mainFileName = linkToCebab(pageUrl, '.html');
  const mainFilePath = path.join(pathForSave, mainFileName);
  const fileDirName = linkToCebab(pageUrl, '_file');
  const fileDirPath = path.join(pathForSave, fileDirName);

  const linksList = [];
  let changedHtml;
  return axios.get(pageUrl)
    .then((response) => {
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
          const localLink = makeLocalName(link, fileDirPath);
          return $(elem).attr(tagList[tag], localLink);
        }));

      changedHtml = $.html();
      return fs.writeFile(mainFilePath, changedHtml);
    })
    .then(() => fs.mkdir(fileDirPath))
    .then(() => {
      linksList.map((link) => {
        const currentLink = url.resolve(pageUrl, link);
        return axios
          .get(currentLink, { responseType: 'arraybuffer' })
          .then((response) => {
            const filename = makeLocalName(link);
            const linkSavePath = path.join(fileDirPath, filename);
            return fs.writeFile(linkSavePath, response.data);
          });
      });
    });
};
