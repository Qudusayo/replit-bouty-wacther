require("dotenv").config();
const fs = require("fs");
const axios = require("axios");
const cron = require("node-cron");
const cheerio = require("cheerio");

async function rp(url) {
  try {
    const axiosResponse = await axios.request({
      url,
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
      },
    });

    const $ = cheerio.load(axiosResponse.data);

    let response = $("ul > li")
      .toArray()
      .map((e) => ({
        title: $(e).find("div > div > h3").text().trim(),
        price: $(e).find("div > div > div > div > span:first").text().trim(),
        applicants: $(e)
          .find("div > div > div:nth-child(2n) > div:nth-child(2n) > span")
          .text()
          .trim(),
        lapse: $(e)
          .find("div > div > div:first > span > div:first > span")
          .text()
          .trim(),
        link:
          "https://replit.com" +
          $(e).find("div[role=article] > a").attr("href"),
      }));

    return response;
  } catch (error) {
    reportError();
  }
}

const url = process.env.REPLIT_BOUNTY_URL;

async function reportError() {
  await axios.post(
    process.env.DISCORD_WEBHOOK_URL,
    {
      content: `There seems to be an error with the scrapper. Kindly check the logs. <@${process.env.QUDUSAYO_DISCORD_ID}>`,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

cron.schedule("* * * * *", function () {
  console.log("---Running a task every minute");
  rp(url)
    .then((res) => {
      //Read the file
      let data = fs.readFileSync("data.json");
      //Parse the file
      let json = JSON.parse(data);

      // Compare the data and look for new bounties
      let newBounties = res.filter((e) => {
        return !json.some((f) => f.title === e.title);
      });

      fs.writeFileSync("data.json", JSON.stringify(res, null, 2));
      const promiseArray = [];

      // Send the new bounties to the discord webhook
      newBounties.forEach((e) => {
        let content = `
\`\`\`Open bounty: 
${e.title}

Worth: ${e.price}.

Applicants: ${isNaN(parseInt(e.applicants)) ? 0 : parseInt(e.applicants)}.

${e.lapse[0].toUpperCase() + e.lapse.slice(1)}
\`\`\`
${e.link}

      `;

        promiseArray.push(
          axios.post(
            process.env.DISCORD_WEBHOOK_URL,
            {
              content,
            },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          )
        );
      });

      Promise.all(promiseArray)
        .then(() => console.log("Done!"))
        .catch(() => {
          reportError();
        });
    })
    .catch(() => {
      reportError();
    });
});
