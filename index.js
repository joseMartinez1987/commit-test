import puppeteer from "puppeteer";
import fs from "fs/promises";

let stockFound = [];

console.log("adding message");

const searchStock = async (url, portfolioUpdatedDate) => {
  console.log("enter in searchStock");
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1024 });
  await page.goto(url);

  const investorStock = await page.evaluate(() => {
    const stockList = Array.from(document.querySelectorAll(".stock")).map(
      (li) => {
        const stockName = li.querySelector("a").innerText;
        const stockLink = li.querySelector("a").href;
        const portcentagePortfolio =
          li.nextSibling.nextElementSibling.innerText;
        const recentActivity =
          li.nextSibling.nextElementSibling.nextElementSibling.innerText;

        return { stockName, portcentagePortfolio, recentActivity, stockLink };
      },
    );

    return stockList;
  });

  if (investorStock.length) {
    const inverstor = {
      investorName: await page.evaluate(
        () => document.querySelector("#f_name").innerText,
      ),
      portfolioUpdatedDate,
      stocks: investorStock,
    };
    stockFound.push(inverstor);
  }
  await browser.close();
};

const listInvestor = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1024 });

  await page.goto("https://www.dataroma.com/m/home.php");

  const investorList = await page.evaluate(() => {
    const body = Array.from(document.querySelectorAll("#port_body ul li")).map(
      (li) => {
        const name = li.querySelector("a").innerText;
        const url = li.querySelector("a").href;
        const portfolioUpdatedDate = li
          .querySelector("a")
          .innerText?.split("Updated")[1];
        return { name, portfolioUpdatedDate, url };
      },
    );
    return body;
  });

  if (investorList.length) {
    for (const investor of investorList) {
      await searchStock(investor.url, investor.portfolioUpdatedDate);
    }
  }

  await browser.close();
};

(async () => {
  await listInvestor();
  fs.writeFile("stock.json", JSON.stringify(stockFound, null, 2));
})();
