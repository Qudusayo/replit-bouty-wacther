require("dotenv").config();
const mongoose = require("mongoose");
const Bounties = require("./../model/Bounties.model");

module.exports = async function filterNonExistingBounties(bounties) {
  const MONGODB_URI = process.env.MONGODB_URI;
  const bountyLinks = bounties.map((bounty) => bounty.link);

  await mongoose
    .connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log("Mongoose Coonected"))
    .catch((err) => console.log(err));

  const BountyLab = new Bounties();
  let bountWithLinksInDb = await BountyLab.collection
    .find({ link: { $in: bountyLinks } })
    .toArray();

  // Filter out bounties that are not in the database
  const bountiesNotInDb = bounties.filter((bounty) => {
    return !bountWithLinksInDb.some((bountyInDb) => {
      return bountyInDb.link === bounty.link;
    });
  });

  await mongoose.connection
    .close()
    .then(() => console.log("Mongoose Closed"))
    .catch((err) => console.log(err));

  return bountiesNotInDb;
};
