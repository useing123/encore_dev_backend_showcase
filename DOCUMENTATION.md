# Backend Documentation

This document provides a comprehensive overview of the backend services for the Pennywise application.

## Architecture Overview

The backend is built using the Encore framework and TypeScript. It follows a service-based architecture, with distinct services for handling transactions, categories, and AI-powered financial insights. Each service exposes a set of API endpoints for interacting with the application's features.

The core services are:
- **Transactions Service**: Manages financial transactions, including adding, listing, and calculating balances.
- **Categories Service**: Provides a list of predefined categories for transactions.
- **AI Insights Service**: Generates financial insights based on transaction data (currently disabled).

The backend uses a PostgreSQL database named `pennywise` to store transaction data.
## Transactions Service

The Transactions service is responsible for managing all financial transactions.

### API Endpoints

#### `POST /transactions`

Adds a new transaction to the database.

- **Request Body**:
  ```json
  {
    "description": "string",
    "amount": "number",
    "category": "string"
  }
  ```

#### `GET /transactions`

Retrieves a list of all transactions, ordered by timestamp in descending order.

- **Response Body**:
  ```json
  {
    "transactions": [
      {
        "id": "number",
        "description": "string",
        "amount": "number",
        "category": "string",
        "timestamp": "string"
      }
    ]
  }
  ```

#### `GET /transactions/balance`

Calculates and returns the total balance of all transactions.

- **Response Body**:
  ```json
  {
    "balance": "number"
  }
  ```

### Data Structures

#### `Transaction`

| Field       | Type     | Description                                  |
|-------------|----------|----------------------------------------------|
| `id`        | `number` | The unique identifier for the transaction.   |
| `description` | `string` | A description of the transaction.            |
| `amount`    | `number` | The transaction amount.                      |
| `category`  | `string` | The category of the transaction.             |
| `timestamp` | `string` | The timestamp of when the transaction was created. |
## Categories Service

The Categories service provides a list of predefined categories for transactions.

### API Endpoints

#### `GET /categories`

Retrieves a list of all available categories.

- **Response Body**:
  ```json
  {
    "categories": [
      "Food",
      "Transport",
      "Shopping",
      "Utilities",
      "Health",
      "Entertainment"
    ]
  }
  ```

## AI Insights Service

The AI Insights service is responsible for generating financial insights based on transaction data.

**Note**: This service is currently disabled and will return a static message.

### API Endpoints

#### `GET /insights`

Generates a financial insight.

- **Response Body**:
  ```json
  {
    "insight": "string"
  }
  ```
## Database Schema

The backend uses a PostgreSQL database named `pennywise`.

### `transactions` Table

| Column      | Type        | Description                                  |
|-------------|-------------|----------------------------------------------|
| `id`        | `SERIAL`    | The unique identifier for the transaction.   |
| `description` | `TEXT`      | A description of the transaction.            |
| `amount`    | `INTEGER`   | The transaction amount in cents.             |
| `category`  | `TEXT`      | The category of the transaction.             |
| `timestamp` | `TIMESTAMPTZ` | The timestamp of when the transaction was created. |