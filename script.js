paypal.Buttons({
    createOrder: function (data, actions) {
        // Collect buyer's information from the form
        let phoneNumber = document.querySelector('#country option:checked').getAttribute('data-phone-prefix') + document.getElementById('phone').value.replace(/[^0-9]/g, '');

        // Simple logic to format phone number for E.164 (this assumes all numbers are US numbers for illustration)
        // But with our updated method, we're using the selected country's prefix.
        if (phoneNumber.charAt(0) !== '+') {
            phoneNumber = '+' + phoneNumber; // Add a + if not present (shouldn't happen with our current setup)
        }

        const buyerInfo = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            email: document.getElementById('email').value,
            phone: phoneNumber,
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
        }).then(res => {
            if (!res.ok) {
                throw new Error('Network response was not ok'); // or you can get more specific error info from `res`
            }
            return res.json();
        }).then(data => {
            return data.orderID;
        }).catch(error => {
            console.error('There was a problem with the fetch operation:', error.message);
            // You can inform users here e.g., show a modal or an alert about the error
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
