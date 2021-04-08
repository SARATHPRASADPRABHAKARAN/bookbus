$(document).ready(() => {
    $("#address-form").validate({
        rules: {
            firstname: {
                required: true,
                minlength: 3
            },
            lastname: {
                required: true,
                minilength: 3
            },
            
            city: {
                required: true
            },
            State: {
                required: true
            },
            pincode: {
                required: true,
                minlength: 6,
                maxlength: 6
            },
            payment: {
                required: true,

            }
        },
        submitHandler: function (form, e) {
            e.preventDefault()
            console.log("form called")
            $.ajax({
                url: '/placeorder',
                method: 'post',
                data: $('#address-form').serialize(),
                success: (response) => {
                    console.log("dfska", response)
                    if (response.codSuccess) {
                        location.href = '/success'
                    }
                    else if (response.paypal) {
                        console.log("PAYAPADKjkh")
                        console.log(response)
                        paypal.Buttons({
                            createOrder: function (data, actions) {
                                return actions.order.create({
                                    purchase_units: [{
                                        amount: {
                                            value: response.total
                                        }
                                    }]
                                })
                            },
                            onApprove: function (data, action) {
                                return action.order.capture().then(function (details) {
                                    location.href = '/success'
                                })
                            }
                        }).render('#paypal-payment-button');

                    }
                    else {
                        razorpayment(response)
                    }
                }
            })
        }
    })

    function razorpayment(order) {
        console.log(order.response.amount, order.id)
        var options = {
            "key": "rzp_test_XV9PdEenLV2Ukw", // Enter the Key ID generated from the Dashboard
            "amount": order.response.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
            "currency": "INR",
            "name": "bookbus",
            "description": "Test Transaction",
            "image": "https://example.com/your_logo",
            "order_id": order.response.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
            "handler": function (response) {
                {

                }
                verifyPayment(response, order)
            },
            "prefill": {
                "name": "Gaurav Kumar",
                "email": "gaurav.kumar@example.com",
                "contact": "9999999999"
            },
            "notes": {
                "address": "Razorpay Corporate Office"
            },
            "theme": {
                "color": "#3399cc"
            }
        };
        var rzp1 = new Razorpay(options);
        rzp1.open();
    }
    function verifyPayment(payment, order) {
        let ord = order.response
        console.log("datata", ord)
        console.log("VERIFY OIkj", payment, order)
        $.ajax({
            url: '/verifypayment',
            method: 'POST',
            data: {
                payment, order
            },

            success: (response) => {
                console.log(response, "rtrtdfgyfg")
                if (response.status) {
                    location.href = '/success'
                }
                else {
                    alert('payment failed')
                }
            }
        })
    }
})