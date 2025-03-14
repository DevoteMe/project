# DevoteMe API Documentation

## Overview

The DevoteMe API provides a comprehensive set of endpoints for interacting with the DevoteMe social media platform. This documentation covers all available endpoints, including authentication, user management, content management, subscriptions, notifications, chat, analytics, and monitoring.

## Base URL

- Development: `http://localhost:3000/api`
- Production: `https://api.devoteme.com/api`

## Authentication

Most endpoints require authentication using a JWT token. Include the token in the `Authorization` header of your requests:

