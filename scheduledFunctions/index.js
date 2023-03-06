require("dotenv").config();
const CronJob = require("node-cron");
const scrapeBountiesFromReplit = require("./../controllers/scrape_bounties");
const filterNonExistingBounties = require("./../controllers/mongo_filter");
const insertManyBounties = require("./../controllers/mongo_insert");
const sendContentToDiscord = require("./../controllers/discord_webhook");

exports.initScheduledJobs = () => {
  const scheduledJobFunction = CronJob.schedule("*/10 * * * *", async () => {
    try {
      console.log("---Running a task every 10 minutes");

      // Scrape the data
      const bountyEntries = await scrapeBountiesFromReplit();
      const filteredBounties = await filterNonExistingBounties(bountyEntries);
      console.log(filteredBounties);
      // Insert the data
      if (filteredBounties.length) {
        await insertManyBounties(filteredBounties);

        // Send the data to the discord webhook
        var fbIndex = 0; //  set your counter to 1

        function sendBountyToDiscord() {
          //  create a Loop function
          setTimeout(async function () {
            //  call a 10s setTimeout when the loop is called
            //  your code here
            let content = `
\`\`\`Open bounty: 
${filteredBounties[fbIndex].title}
          
Worth: $${filteredBounties[fbIndex].price}.
          
Applicants: ${filteredBounties[fbIndex].applicants}.
          
${
  filteredBounties[fbIndex].lapse[0].toUpperCase() +
  filteredBounties[fbIndex].lapse.slice(1)
}
\`\`\`
${filteredBounties[fbIndex].link}
          `;
            await sendContentToDiscord(content);
            fbIndex++; //  increment the counter
            if (fbIndex < filteredBounties.length) {
              //if the counter < Open bounties length, call the sendBountyToDiscord function
              sendBountyToDiscord(); //  ..  again which will trigger another
            } //  ..  setTimeout()
          }, 10000);
        }

        sendBountyToDiscord();
      }
    } catch (error) {
      console.log(error);
      sendContentToDiscord(
        `There seems to be an error with the service. Kindly check the logs. <@${process.env.QUDUSAYO_DISCORD_ID}>`
      );
    }
  });

  scheduledJobFunction.start();
};
