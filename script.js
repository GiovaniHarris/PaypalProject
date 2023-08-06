paypal.Buttons({
    createOrder: function (data, actions) {
        // Collect buyer's information from the form
        const buyerInfo = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            address1: document.getElementById('address1').value,
            address2: document.getElementById('address2').value,
            state: document.getElementById('state').value,
            zip: document.getElementById('zip').value,
            country: document.getElementById('country').value,
        };

        // Send buyer's info to your server and set up the transaction
        return fetch('/pay', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(buyerInfo)
        }).then(res => res.json()).then(data => {
            return data.orderID; // Order ID from the response
        });
    },
    onApprove: function (data, actions) {
        // Capture the funds from the transaction
        return actions.order.capture().then(function (details) {
            // Show a success message to the buyer
            alert('Transaction completed by ' + details.payer.name.given_name + '!');
        });
    }
}).render('#paypal-button-container');