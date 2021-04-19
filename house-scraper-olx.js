const rp = require('request-promise');
const $ = require('cheerio');
const url = 'https://www.olx.pt/imoveis/casas-moradias-para-arrendar-vender/moradias-arrenda/leiria/';

const olxExtractInfo = (html) => {
  return {
    id: html.attribs['data-id'],
    href: $('.title-cell a', html).attr('href').split('?')[0], // delete queries
    title: $('.title-cell strong', html).text(),
    price: $('.price strong', html).text().replace(/\D/g, ''), // only digits
    location: $('.bottom-cell small:first-child span', html).text(),
    date: $('.bottom-cell small:last-child span', html).text() 
  }
}

rp(url).then(html => {
  const offers = $('.offer table', html)
  const resultsCount = offers.length
  const houses = []

  for (let i = 0; i < offers.length; i++) {
    houses.push(olxExtractInfo(offers[i]));
  }
}).catch(err => console.log('Error: ', err))