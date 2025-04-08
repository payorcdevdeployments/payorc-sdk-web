
# # PayOrc Payment Web SDK 

## Table of Contents
1. [Installation](#installation)
2. [Basic Setup](#basic-setup)
3. [Configuration Options](#configuration-options)
4. [Required Fields](#required-fields)

## Installation

Include the PayOrc SDK in your HTML file:

```html
<script src="https://cdn.example.com/payorc.umd.cjs"></script>
```

## Basic Setup

```javascript
// Initialize the SDK with your merchant credentials
payorc.init({
  apiKey: 'your-merchant-key',
  merchantSecret: 'your-merchant-secret',
  environment: 'test',
  onSuccess: (data) => {
    console.log('Payment successful:', data);
  },
  onFailure: (error) => {
    console.error('Payment failed:', error);
  },
  onCancel: () => {
    console.log('Payment cancelled');
  }
});
```

## Configuration Options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| apiKey | string | Yes | Your merchant key |
| merchantSecret | string | Yes | Your merchant secret |
| environment | string | No | 'test' or 'production' (defaults to 'test') |
| onSuccess | function | No | Callback for successful payments |
| onFailure | function | No | Callback for failed payments |
| onCancel | function | No | Callback for cancelled payments |


## Event Handling

```javascript
// Listen for payment events
var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
var eventer = window[eventMethod];
var messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";

eventer(messageEvent, function(e) {
  try {
    const result = JSON.parse(e.data);
    console.log('Payment response:', result);
    if (result.status === "SUCCESS") {
      console.log('Transaction successful:', result.transaction_id);
    } else if (result.status === "CANCELLED") {
      console.log('Transaction cancelled:', result.remark);
    } else if (result.status === "FAILED") {
      console.log('Transaction failed:', result.transaction_id);
    }
    // Close modal if it exists
    payorc.close();
  } catch (error) {
    console.error('Error processing payment response:', error);
  }
}, false);
```

## Required Fields

### Order Details
- m_order_id
- amount
- convenience_fee
- currency
- quantity

### Customer Details
- name
- m_customer_id
- email

### Billing Details
- address_line1
- city
- province
- pin
- country

### Shipping Details
- shipping_name
- address_line1
- city
- province
- pin
- country
- shipping_currency
- shipping_amount

## Sample Request

```json

{
"data":  {
		"class":  "ECOM",
		"action":  "AUTH | SALE",
		"capture_method":  "MANUAL | AUTOMATIC",
		"payment_token":  "",
		"order_details":  {
			"m_order_id":  "1234",
			"amount":  "500",
			"convenience_fee":  "0",
			"currency":  "AED", // should be dynamic
			"description":  "",
			"quantity":  "1"  // should be dynamic
		},
		"customer_details":  {
			"m_customer_id":  "123",
			name: "John Doe",
            email: "johndoe@example.com",
            mobile: "987654321",
            code: "971", // without leading + 
		},
		"billing_details":  {
			addressLine1: "Po Box 12322",
            addressLine2: "Jebel Ali Free Zone",
            city: "Dubai",
            province: "Dubai", // state
            country: "AE", // Alpha-2 country codes
            pin: "54044",
		},
		"shipping_details":  {
			shippingName: "John Doe",
            shippingEmail: "email@company.com",
            shippingCode: "971", // without leading + 
            shippingMobile: "987654321",
            addressLine1: "Po Box 12322",
            addressLine2: "Jebel Ali Free Zone",
            city: "Dubai",
            province: "Dubai", // state
            country: "AE", // Alpha-2 country codes
            pin: "54044",
            locationPin: "{URL}", // Placeholder URL
            shippingCurrency: "AED", // should be dynamic
            shippingAmount: "0",
		},
		"urls":  {
			"success":  "",
			"cancel":  "",
			"failure":  ""
		},
		"parameters":  [
			{  "alpha":  ""  },
			{  "beta":  ""  },
			{  "gamma":  ""  },
			{  "delta":  ""  },
			{  "epsilon":  ""  }
		],
		"custom_data":  [
			{  "alpha":  ""  },
			{  "beta":  ""  },
			{  "gamma":  ""  },
			{  "delta":  ""  },
			{  "epsilon":  ""  }
		]
	}
}
