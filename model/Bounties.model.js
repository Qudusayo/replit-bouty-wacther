const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BountiesSchema = new Schema({
  id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: { unique: true },
  },
  title: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
  applicants: {
    type: Number,
    required: true,
  },
  lapse: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    required: true,
    index: { unique: true },
  },
});

module.exports = Bounties = mongoose.model("Bounties", BountiesSchema);
