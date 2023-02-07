//ROUTE: /track/payments

// I'm calling this in the sent and succeeded callbacks to try and add the callback url to the payment object so that the payments can be validated. It works locally but not when deployed.

const express = require("express");
const axios = require("axios");

const { v4: uuidv4 } = require("uuid");

const router = express.Router();

const getPayment = async (req) => {
  let markers = req.body.markers;

  let amount = markers.reduce((n, { ticketPrice }) => n + ticketPrice, 0);

  // console.log(req.body);

  let response = await axios({
    method: "post", //you can set what request you want to be
    url: "https://api.depay.com/v2/payments",

    data: {
      blockchain: req.body.transaction.blockchain,
      sender: req.body.transaction.from,
      nonce: String(req.body.transaction.nonce),
      token: req.body.transaction.params.path[1],
      confirmations: 1,
      after_block: "38878507",
      callback: "https://webhook.site/1b09ce62-b3ec-4479-81f0-0442ab74b081",
      receiver: "0x60C611D9F3f50a903A9ff112Eea7887B5F9b6064",

      // amount: String(amount),
      amount: String(amount),
      transaction: req.body.transaction.id,
      secret_id: req.body.transaction.id,
    },
    headers: {
      "x-api-key": "lNfu1NmxQh1IphrxzVr2P10SjyghguMB9xqWk2hd",
    },
  });

  console.log(response);

  return response.data;
};

router.post("/", async (req, res) => {
  const update = await getPayment(req);
  console.log(update);
  res.json(update);
});

module.exports = router;

// ROUTE: /track/payments/track

const express = require("express");
const axios = require("axios");

const router = express.Router();

const { v4: uuidv4 } = require("uuid");

let secret_id = uuidv4();

const initialResponse = async (req) => {
  let initialResponse = await axios({
    method: "post", //you can set what request you want to be
    url: "https://api.depay.com/v2/payments",
    data: {
      blockchain: req.body.payment.blockchain,
      sender: req.body.payment.sender,
      nonce: req.body.payment.nonce,
      token: req.body.payment.to_token,
      confirmations: 1,
      after_block: req.body.payment.after_block,
      callback: "https://webhook.site/1b09ce62-b3ec-4479-81f0-0442ab74b081",
      receiver: "0x60C611D9F3f50a903A9ff112Eea7887B5F9b6064",
      amount: "0.02",
      secret_id: String(secret_id),
    },
    headers: {
      "x-api-key": "lNfu1NmxQh1IphrxzVr2P10SjyghguMB9xqWk2hd",
    },
  });
  // console.log(response);

  return initialResponse.data;
};

const afterResponse = async (req) => {
  // let markers = req.body.markers;

  // let amount = markers.reduce((n, { ticketPrice }) => n + ticketPrice, 0);

  console.log(req.body);

  let afterResponse = await axios({
    method: "post", //you can set what request you want to be
    url: "https://api.depay.com/v2/payments",
    data: {
      blockchain: req.body.payment.blockchain,
      sender: req.body.payment.sender,
      nonce: req.body.payment.nonce,
      token: req.body.payment.to_token,
      confirmations: 1,
      after_block: req.body.payment.after_block,
      callback: "https://webhook.site/1b09ce62-b3ec-4479-81f0-0442ab74b081",
      receiver: "0x60C611D9F3f50a903A9ff112Eea7887B5F9b6064",
      amount: "0.02",
      transaction: req.body.payment.transaction,
      secret_id: req.body.payment.transaction,
    },
    headers: {
      "x-api-key": "lNfu1NmxQh1IphrxzVr2P10SjyghguMB9xqWk2hd",
    },
  });

  // console.log(afterResponse);

  return afterResponse.data;
};

router.post("/", async (req, res) => {
  if (req.body.transaction) {
    console.log(await afterResponse(req));
    console.log("after response" + afterResponse(req));
  } else {
    console.log(await initialResponse(req));
    console.log("initial response" + initialResponse(req));
  }
  console.log(req.body);
  res.json(req.body);
});

module.exports = router;
