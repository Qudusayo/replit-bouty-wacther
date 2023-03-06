require("dotenv").config();
const mongoose = require("mongoose");
const Bounties = require("./../model/Bounties.model");

module.exports = async function insertManyBounties(bounties) {
  const MONGODB_URI = process.env.MONGODB_URI;

  bounties = bounties.map((bounty, index) => {
    bounty.id = new mongoose.Types.ObjectId();
    return bounty;
  });

  await mongoose
    .connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log("Mongoose Coonected"))
    .catch((err) => console.log(err));

  const BountyLab = new Bounties();
  await BountyLab.collection
    .insertMany(bounties)
    .then((docs) => {
      console.log(docs);
    })
    .catch((err) => {
      console.log(err);
    });
  await mongoose.connection
    .close()
    .then(() => console.log("Mongoose Closed"))
    .catch((err) => console.log(err));
};
