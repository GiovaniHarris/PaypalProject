const paypal = require("paypal-rest-sdk");
const express = require("express");
const app = express();
const path = require('path');

paypal.configure({
  mode: "sandbox",
  client_id: "AVCCbyMcLoxLYq2N7pDzsKMoS5O6h9oyEWewfM9ob3zubR4ZXqD4E-Fhyh8M2d82p6gpSmdKW0XmsPr-",
  client_secret: "EIKhpG-z-d_JcZ7dcR-npUk5efRZcO4WkObpjMN4L0ewKRhdqqmLj6Qte0S8ujucukEb0TNOrzZogj0T",
});

app.use(express.static(path.join(__dirname, '.')));
app.use(express.json());


const executePayment = (paymentId, payerId, res) => {
  const execute_payment_json = {
    payer_id: payerId, // Use o payer_id correto aqui
    transactions: [{
      amount: {
        currency: "USD",
        total: "19.99",
      },
    }],
  };

  paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
    if (error) {
      console.error("Payment Execution Error:", error.response);
      res.status(400).send('Payment execution failed.');
      return;
    }
    res.send("Success");
  });
};

app.post("/pay", (req, res) => {
  try {
    const { firstName, lastName, email, address1, address2, city, state, zip, country } = req.body;

    const paymentDetails = {
      intent: "sale",
      payer: {
        payment_method: "paypal",
        payer_info: {
          first_name: firstName,
          last_name: lastName,
          email: email,
          billing_address: {
            line1: address1,
            line2: address2 || null, // If address2 is empty, you can set it to null.
            city: city,
            state: state,
            postal_code: zip,
            country_code: country // This needs to be the two-letter country code (e.g., "US").
          }
        }
      },
      transactions: [
        {
          description: "This is the payment description.",
          invoice_number: "", // If you have an invoice_number, add it here. Otherwise, it can be omitted.
          amount: {
            currency: "USD",
            total: "19.99",
            details: { // Optional breakdown of the amount.
              subtotal: "19.99"
            }
          },
          item_list: {
            items: [
              {
                name: "Cool T-shirt",
                sku: "123456",
                price: "19.99",
                currency: "USD",
                quantity: 1
              }
            ]
          }
        }
      ],
      redirect_urls: {
        return_url: "https://mighty-shelf-27108.herokuapp.com/success",
        cancel_url: "https://mighty-shelf-27108.herokuapp.com/cancel"
      }
    }
    
    paypal.payment.create(paymentDetails, function (error, payment) {
      if (error) {
        console.error("PayPal Error:");
        console.error("Details", error.response.details);
        res.status(400).send('Payment processing failed.');
        return;
      }

      for (let i = 0; i < payment.links.length; i++) {
        if (payment.links[i].rel === "approval_url") {
          return res.json({ orderID: payment.id });
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