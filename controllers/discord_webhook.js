require("dotenv").config();
const axios = require("axios");

module.exports = async function sendContentToDiscord(content) {
  await axios.post(
    process.env.DISCORD_WEBHOOK_URL,
    {
      content,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};
