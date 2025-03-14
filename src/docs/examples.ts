/**
 * Examples of how to use the DevoteMe API
 *
 * This file contains code examples for using the DevoteMe API with various programming languages.
 * These examples are included in the API documentation.
 */

// Example: Track an analytics event (JavaScript)
const trackEventExample = `
// Using fetch
fetch('https://api.devoteme.com/api/analytics/track', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_ACCESS_TOKEN'
  },
  body: JSON.stringify({
    eventType: 'contentView',
    sessionId: 'sess_123456789',
    timestamp: new Date().toISOString(),
    properties: {
      contentId: 'post_123456789',
      contentType: 'post',
      timeSpent: 120
    }
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));

// Using axios
import axios from 'axios';

axios.post('https://api.devoteme.com/api/analytics/track', {
  eventType: 'contentView',
  sessionId: 'sess_123456789',
  timestamp: new Date().toISOString(),
  properties: {
    contentId: 'post_123456789',
    contentType: 'post',
    timeSpent: 120
  }
}, {
  headers: {
    'Authorization': 'Bearer YOUR_ACCESS_TOKEN'
  }
})
.then(response => console.log(response.data))
.catch(error => console.error('Error:', error));
`

// Example: Get analytics summary (JavaScript)
const getAnalyticsSummaryExample = `
// Using fetch
const startDate = '2023-06-01T00:00:00Z';
const endDate = '2023-06-30T23:59:59Z';

fetch(\`https://api.devoteme.com/api/analytics/summary?startDate=\${startDate}&endDate=\${endDate}\`, {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_ACCESS_TOKEN'
  }
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));

// Using axios
import axios from 'axios';

const startDate = '2023-06-01T00:00:00Z';
const endDate = '2023-06-30T23:59:59Z';

axios.get('https://api.devoteme.com/api/analytics/summary', {
  params: {
    startDate,
    endDate
  },
  headers: {
    'Authorization': 'Bearer YOUR_ACCESS_TOKEN'
  }
})
.then(response => console.log(response.data))
.catch(error => console.error('Error:', error));
`

// Example: Get time series analytics data (JavaScript)
const getTimeSeriesDataExample = `
// Using fetch
const startDate = '2023-06-01T00:00:00Z';
const endDate = '2023-06-30T23:59:59Z';
const metrics = 'pageViews,activeUsers,conversions';
const interval = 'daily';

fetch(\`https://api.devoteme.com/api/analytics/timeseries?startDate=\${startDate}&endDate=\${endDate}&metrics=\${metrics}&interval=\${interval}\`, {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_ACCESS_TOKEN'
  }
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));

// Using axios
import axios from 'axios';

const startDate = '2023-06-01T00:00:00Z';
const endDate = '2023-06-30T23:59:59Z';
const metrics = 'pageViews,activeUsers,conversions';
const interval = 'daily';

axios.get('https://api.devoteme.com/api/analytics/timeseries', {
  params: {
    startDate,
    endDate,
    metrics,
    interval
  },
  headers: {
    'Authorization': 'Bearer YOUR_ACCESS_TOKEN'
  }
})
.then(response => console.log(response.data))
.catch(error => console.error('Error:', error));
`

// Example: Get content analytics (JavaScript)
const getContentAnalyticsExample = `
// Using fetch
const contentId = 'post_123456789';
const startDate = '2023-06-01T00:00:00Z';
const endDate = '2023-06-30T23:59:59Z';

fetch(\`https://api.devoteme.com/api/analytics/content/\${contentId}?startDate=\${startDate}&endDate=\${endDate}\`, {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_ACCESS_TOKEN'
  }
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));

// Using axios
import axios from 'axios';

const contentId = 'post_123456789';
const startDate = '2023-06-01T00:00:00Z';
const endDate = '2023-06-30T23:59:59Z';

axios.get(\`https://api.devoteme.com/api/analytics/content/\${contentId}\`, {
  params: {
    startDate,
    endDate
  },
  headers: {
    'Authorization': 'Bearer YOUR_ACCESS_TOKEN'
  }
})
.then(response => console.log(response.data))
.catch(error => console.error('Error:', error));
`

// Example: Export analytics data (JavaScript)
const exportAnalyticsDataExample = `
// Using fetch
const startDate = '2023-06-01T00:00:00Z';
const endDate = '2023-06-30T23:59:59Z';
const type = 'summary';

fetch(\`https://api.devoteme.com/api/analytics/export?startDate=\${startDate}&endDate=\${endDate}&type=\${type}\`, {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_ACCESS_TOKEN'
  }
})
.then(response => response.blob())
.then(blob => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'analytics_export.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
})
.catch(error => console.error('Error:', error));

// Using axios
import axios from 'axios';

const startDate = '2023-06-01T00:00:00Z';
const endDate = '2023-06-30T23:59:59Z';
const type = 'summary';

axios.get('https://api.devoteme.com/api/analytics/export', {
  params: {
    startDate,
    endDate,
    type
  },
  headers: {
    'Authorization': 'Bearer YOUR_ACCESS_TOKEN'
  },
  responseType: 'blob'
})
.then(response => {
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'analytics_export.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
})
.catch(error => console.error('Error:', error));
`

// Example: Get system health status (JavaScript)
const getSystemHealthExample = `
// Using fetch
fetch('https://api.devoteme.com/api/monitoring/health', {
  method: 'GET'
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));

// Using axios
import axios from 'axios';

axios.get('https://api.devoteme.com/api/monitoring/health')
.then(response => console.log(response.data))
.catch(error => console.error('Error:', error));
`

// Example: Get system metrics (JavaScript)
const getSystemMetricsExample = `
// Using fetch
const period = '15m';

fetch(\`https://api.devoteme.com/api/monitoring/metrics?period=\${period}\`, {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_ACCESS_TOKEN'
  }
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));

// Using axios
import axios from 'axios';

const period = '15m';

axios.get('https://api.devoteme.com/api/monitoring/metrics', {
  params: {
    period
  },
  headers: {
    'Authorization': 'Bearer YOUR_ACCESS_TOKEN'
  }
})
.then(response => console.log(response.data))
.catch(error => console.error('Error:', error));
`

// Example: Handle Stripe webhook (Node.js)
const handleStripeWebhookExample = `
// Using Express
const express = require('express');
const app = express();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// This is your Stripe CLI webhook secret for testing
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

app.post('/webhooks/stripe', express.raw({type: 'application/json'}), (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    res.status(400).send(\`Webhook Error: \${err.message}\`);
    return;
  }

  // Handle the event
  switch (event.type) {
    case 'customer.subscription.created':
      const subscriptionCreated = event.data.object;
      // Handle subscription created
      console.log('Subscription created:', subscriptionCreated);
      break;
    case 'customer.subscription.updated':
      const subscriptionUpdated = event.data.object;
      // Handle subscription updated
      console.log('Subscription updated:', subscriptionUpdated);
      break;
    case 'customer.subscription.deleted':
      const subscriptionDeleted = event.data.object;
      // Handle subscription deleted
      console.log('Subscription deleted:', subscriptionDeleted);
      break;
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      // Handle successful payment
      console.log('Payment succeeded:', paymentIntent);
      break;
    default:
      console.log(\`Unhandled event type \${event.type}\`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.send({received: true});
});

app.listen(3000, () => console.log('Running on port 3000'));
`

export const examples = {
  trackEventExample,
  getAnalyticsSummaryExample,
  getTimeSeriesDataExample,
  getContentAnalyticsExample,
  exportAnalyticsDataExample,
  getSystemHealthExample,
  getSystemMetricsExample,
  handleStripeWebhookExample,
}

