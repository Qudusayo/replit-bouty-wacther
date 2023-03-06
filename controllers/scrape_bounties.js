require("dotenv").config();
const axios = require("axios");
const cheerio = require("cheerio");

module.exports = async function scrapeBountiesFromReplit() {
  const axiosResponse = await axios.request({
    url: process.env.REPLIT_BOUNTY_URL,
    method: "GET",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
    },
  });

  const $ = cheerio.load(axiosResponse.data);

  let response = $("ul > li")
    .toArray()
    .map((e) => {
      let applicants = $(e)
        .find("div > div > div:nth-child(2n) > div:nth-child(2n) > span")
        .text()
        .trim();

      return {
        title: $(e).find("div > div > h3").text().trim(),
        price: parseFloat(
          $(e)
            .find("div > div > div > div > span:first")
            .text()
            .trim()
            .slice(1)
            .split(",")
            .join("")
        ),
        applicants: isNaN(parseInt(applicants)) ? 0 : parseInt(applicants),
        lapse: $(e)
          .find("div > div > div:first > span > div:first > span")
          .text()
          .trim(),
        link:
          "https://replit.com" +
          $(e).find("div[role=article] > a").attr("href"),
      };
    });

  return response;
};
