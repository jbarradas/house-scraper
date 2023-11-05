const rp = require("request-promise");
const cheerio = require("cheerio");
const puppeteer = require("puppeteer");

const urlList = [
  "https://www.century21.pt/comprar/moradia/alcobaca/?numberOfElements=12&map=225000&ptd=Moradia%7CQuinta%20e%20Herdade&ma=100&q=Portugal%2C%20Leiria%2C%20Alcoba%C3%A7a&ord=date-desc",
  "https://www.century21.pt/comprar/moradia/batalha/?numberOfElements=12&map=225000&ptd=Moradia%7CQuinta%20e%20Herdade&ma=100&q=Portugal%2C%20Leiria%2C%20Batalha&ord=date-desc",
  "https://www.century21.pt/comprar/moradia/leiria/?numberOfElements=12&map=225000&ptd=Moradia%7CQuinta%20e%20Herdade&ma=100&q=Portugal%2C%20Leiria%2C%20Leiria&ord=date-desc",
  "https://www.century21.pt/comprar/moradia/marinha-grande/?numberOfElements=12&map=225000&ptd=Moradia%7CQuinta%20e%20Herdade&ma=100&q=Portugal%2C%20Leiria%2C%20Marinha%20Grande&ord=date-desc",
  "https://www.century21.pt/comprar/moradia/porto-de-mos/?numberOfElements=12&map=225000&ptd=Moradia%7CQuinta%20e%20Herdade&ma=100&q=Portugal%2C%20Leiria%2C%20Porto%20de%20M%C3%B3s&ord=date-desc",
];

const getUrlLinks = async () => {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  const results = [];

  // Navigate the page to a URL
  for (let url of urlList) {
    await page.goto(url);
    await page.waitForSelector(".c21card__photo");

    const link_list = await page.$$eval(".c21card__photo", (links) => {
      // console.log("links", links);
      return links.map((link) => link.href);
    });

    results.push(...link_list);
  }

  // Type into search box
  // await page.type('.search-box__input', 'automate beyond recorder');

  // Wait and click on first result
  // const searchResultSelector = ".search-box__link";
  // await page.waitForSelector(searchResultSelector);
  // await page.click(searchResultSelector);
  // console.log("page", hey.);

  // const data = await page.evaluate(() => {
  //   const tds = Array.from(document.querySelectorAll(".c21card__photo"));
  //   console.log("length,", tds.length);
  //   return tds.map((td) => {
  //     var txt = td.getAttribute("href");
  //     return txt;
  //   });
  // });

  // console.log("data", data);

  // // Locate the full title with a unique string
  // const textSelector = await page.waitForSelector(".c21card__photo");
  // console.log("CArd Photo", textSelector);
  // const fullTitle = await textSelector?.evaluate((el) =>
  //   el.getAttribute("href")
  // );

  // Print the full title
  // console.log("URL ===>", results);

  await browser.close();
  return results;
};

(async () => {
  const urlLinks = await getUrlLinks();

  const browser = await puppeteer.launch({ headless: "false", slowMo: 250 });
  const page = await browser.newPage();

  page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));

  for (let url of urlLinks) {
    await page.goto(url);
    await page.waitForSelector(".contentc21__slideshow img");

    const titleSelector = await page.waitForSelector(".property-title");
    const title = await titleSelector?.evaluate((el) => el.textContent);

    // const priceSelector = await page.waitForSelector("text/Preço");
    // const price = await priceSelector?.evaluate((el) =>
    //   el.textContent.replace(/\D/g, "")
    // );

    // const areaUsefulSelector = await page.waitForSelector("text/Área útil:");
    // const areaUseful = await areaUsefulSelector?.evaluate((el) =>
    //   el.textContent.replace(/\D/g, "")
    // );

    // const areaBruteSelector = await page.waitForSelector("text/Área bruta:");
    // const areaBrute = await areaBruteSelector?.evaluate((el) =>
    //   el.textContent.replace(/\D/g, "")
    // );

    // const areaLandSelector = await page.waitForSelector(
    //   "text/Área do Terreno:"
    // );
    // const areaLand = await areaBruteSelector?.evaluate((el) =>
    //   el.textContent.replace(/\D/g, "")
    // );

    // const wcsSelector = await page.waitForSelector("text/Casas de banho:");
    // const wcs = await wcsSelector?.evaluate((el) =>
    //   el.textContent.replace(/\D/g, "")
    // );

    await page.waitForSelector(".contentc21-property__content-body");
    const list = await page.waitForSelector(".collapsible-content");

    console.log("START", list);

    const [detailsSelector] = await page.$x(
      "//button[contains(., 'Detalhes')]"
    );

    const detailsContent = await page.evaluateHandle(
      (el) => el.nextElementSibling,
      detailsSelector
    );

    const detailsList = await detailsContent.evaluate(
      async (el) => el.innerText
    );

    const cleanDetailsList = detailsList.split("\n").map((d) => d.split(":"));

    console.log("cleanDetailsList", cleanDetailsList);

    const getDetail = (selector) => {
      const cleanDetail = cleanDetailsList.find((e) => e[0] === selector);
      console.log("clean", cleanDetail);
      if (cleanDetail) {
        return cleanDetail[1];
      }
      return "";
    };

    const detailsCenas = {
      price: getDetail("Preço").replace(/\D/g, ""),
      condition: getDetail("Estado"),
      areaUseful: getDetail("Área útil").replace(/m2/g, ""),
      areaBrute: getDetail("Área bruta").replace(/m2/g, ""),
      areaLand: getDetail("Área do Terreno").replace(/m2/g, ""),
      rooms: getDetail("Quartos"),
      wcs: getDetail("Casas de banho"),
      builtYear: getDetail("Ano de Construção"),
      parking: getDetail("Estacionamento"),
      energeticDegree: getDetail("Certificado energético"),
      reference: getDetail("Referência"),
    };

    // const dts = await (
    //   await detailsSelector.getProperty("textContent")
    // ).jsonValue();

    // console.log(
    //   "START 2",
    //   await detailsContent.evaluate((el) => {
    //     console.log("START 222", el);
    //     return el;
    //   })
    // );
    // const details = await detailsSelector?.evaluate((el) =>
    //   console.log("ELEMENTIII", el)
    // );

    // console.log("START 3", details);

    // console.log("detailsSelector", detailsSelector);

    // const collapsible = await page.evaluate(() =>
    //   Array.from(document.querySelectorAll(".collapsible-content"))
    // );

    // const collapsible = await page.evaluate(() =>
    //   Array.from(
    //     document.getElementsByClassName("collapsible-content"),
    //     (e) => e.innerText
    //   )
    // );

    // console.log("hey2", collapsible);
    // const details = await page.$$(".collapsible-content")[3];
    // console.log("hey", details);

    // let idx = 0;
    // for (let detail in details) {
    // }
    // const details = await page.evaluate(() => {
    //   const detailsSelector = Array.from(
    //     document.querySelectorAll(
    //       ".contentc21-property__content-body",
    //       (element) => element.textContent
    //     )
    //   );

    // console.log("hey", details);

    // return {
    //   // price: detailsSelector[0].textContent,
    //   // areaUseful: detailsSelector[1].textContent,
    //   // areaBrute: detailsSelector[2].textContent,
    //   // areaLand: detailsSelector[3].textContent,
    //   // rooms: detailsSelector[4].textContent,
    //   // wcs: detailsSelector[5].textContent,
    //   // builtYear: detailsSelector[6].textContent,
    //   // parking: detailsSelector[7].textContent,
    //   // energeticRating: detailsSelector[8].textContent,
    //   // id: detailsSelector[9].textContent,
    // };
    // });

    console.log("Values", detailsCenas);
    // const titleSelector = await page.waitForSelector(".property-title");
    // const title = await textSelector?.evaluate((el) => el.textContent);
    // const titleSelector = await page.waitForSelector(".property-title");
    // const title = await textSelector?.evaluate((el) => el.textContent);
    // const titleSelector = await page.waitForSelector(".property-title");
    // const title = await textSelector?.evaluate((el) => el.textContent);
  }
  await browser.close();
})();

// const results = await urlList.map((url) => getResults(url));

// (async () => )();
// const olxExtractInfo = (html) => {
//   return {
//     id: html.attribs["data-id"],
//     href: $(".title-cell a", html).attr("href").split("?")[0], // delete queries
//     title: $(".title-cell strong", html).text(),
//     price: $(".price strong", html).text().replace(/\D/g, ""), // only digits
//     location: $(".bottom-cell small:first-child span", html).text(),
//     date: $(".bottom-cell small:last-child span", html).text(),
//   };
// };

// const cenas = urlList.map((url) =>
//   rp(url)
//     .then((html) => {
//       console.log("html", html);
//       const $ = cheerio.load(html);
//       // const resultsCount = offers.length;
//       const houseDetails = [];

//       $(".c21card__photo").each((index, value) => {
//         console.log("Value", value);
//         var link = $(value).attr("href");
//         houseDetails.push(link);
//       });

//       console.log("offers", houseDetails);

//       // for (let i = 0; i < offers.length; i++) {
//       //   houses.push(olxExtractInfo(offers[i]));
//       // }
//     })
//     .catch((err) => console.log("Error: ", err))
// );
