# DevoteMe Webhook Integration Guide

This guide explains how to set up webhooks for various third-party services to integrate with DevoteMe.

## Table of Contents

1. [Introduction to Webhooks](#introduction-to-webhooks)
2. [Stripe Webhook Setup](#stripe-webhook-setup)
3. [PayPal Webhook Setup](#paypal-webhook-setup)
4. [Mailchimp Webhook Setup](#mailchimp-webhook-setup)
5. [Twilio Webhook Setup](#twilio-webhook-setup)
6. [Cloudinary Webhook Setup](#cloudinary-webhook-setup)
7. [Testing Webhooks Locally](#testing-webhooks-locally)
8. [Webhook Security Best Practices](#webhook-security-best-practices)
9. [Troubleshooting](#troubleshooting)

## Introduction to Webhooks

Webhooks are HTTP callbacks that are triggered by specific events in a source system and send data to a destination system. DevoteMe uses webhooks to receive real-time notifications from various third-party services.

## Stripe Webhook Setup

### 1. Log in to your Stripe Dashboard

Go to [https://dashboard.stripe.com/](https://dashboard.stripe.com/) and log in to your account.

### 2. Navigate to Webhooks

In the Stripe Dashboard, go to **Developers** > **Webhooks**.

### 3. Add Endpoint

Click **Add endpoint** and enter your webhook URL:

- **Production**: `https://api.devoteme.com/webhooks/stripe`
- **Development**: `https://dev-api.devoteme.com/webhooks/stripe`

### 4. Select Events

Select the following events to listen for:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `payment_intent.succeeded`
- `payment_intent.payment_failed`

### 5. Get Webhook Secret

After creating the webhook, Stripe will provide a signing secret. Add this to your environment variables:

