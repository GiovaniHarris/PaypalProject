const paypal = require("paypal-rest-sdk");
const express = require("express");
const app = express();
const path = require('path');

paypal.configure({
  mode: "sandbox",
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_CLIENT_SECRET,
});

app.use(express.static(path.join(__dirname, '.')));
app.use(express.json());

app.post("/pay", (req, res) => {
  try {
    const paymentDetails = {
    intent: "sale",
    payer: {
      payment_method: "paypal",
    },
    redirect_urls: {
      return_url: "https://mighty-shelf-27108.herokuapp.com/success",
      cancel_url: "https://mighty-shelf-27108.herokuapp.com/cancel",
    },
    transactions: [
      {
        item_list: {
          items: [
            {
              name: "Cool T-shirt",
              sku: "123456",
              price: "19.99",
              currency: "USD",
              quantity: 1,
            },
          ],
        },
        amount: {
          currency: "USD",
          total: "19.99",
        },
        description: "This is the payment description.",
      },
    ],
  };

  paypal.payment.create(paymentDetails, function (error, payment) {
    if (error) {
      console.error("PayPal Error:", error);
      res.status(400).send('Payment processing failed.');
      return;
    }

    for (let i = 0; i < payment.links.length; i++) {
      if (payment.links[i].rel === "approval_url") {
        res.redirect(payment.links[i].href);
      }
    }
  });
} catch (error) {
  console.error("Error:", error);
  res.status(500).send('Internal Server Error');
}
});

app.get("/success", (req, res) => {
try {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  const execute_payment_json = {
    payer_id: payerId,
    transactions: [
      {
        amount: {
          currency: "USD",
          total: "19.99",
        },
      },
    ],
  };

  paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
    if (error) {
      console.log(error.response);
      res.status(400).send('Payment execution failed.');
      return;
    } else {
      console.log("Get Payment Response");
      console.log(JSON.stringify(payment));
      res.send("Success");
    }
  });
} catch (error) {
  console.error("Error:", error);
  res.status(500).send('Internal Server Error');
}
});

app.get("/cancel", (req, res) => res.send("Cancelled"));

app.get("/", (req, res) => {
try {
  res.sendFile(path.join(__dirname, "index.html"));
} catch (error) {
  console.error("Error:", error);
  res.status(500).send('Internal Server Error');
}
});

app.use((err, req, res, next) => {
console.error(err.stack);
res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
console.log(`Server is running on port ${PORT}`);
});