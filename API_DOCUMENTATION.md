# API Documentation

This document provides instructions for interacting with the backend API.

## Base URL

The API is running at `http://127.0.0.1:4000`.

---

## Transactions

### 1. Add a new transaction

*   **Method:** `POST`
*   **Path:** `/transactions`
*   **Description:** Creates a new financial transaction.
*   **Request Body:**
    ```json
    {
        "description": "string",
        "amount": "number",
        "category": "string",
        "timestamp": "string (optional, e.g., '2025-08-21T01:04:33.931Z')"
    }
    ```
*   **Example Response (200 OK):**
    ```json
    {
        "id": 1,
        "description": "Coffee",
        "amount": 4.50,
        "category": "Food",
        "timestamp": "2025-08-21T01:04:33.931Z"
    }
    ```

### 2. List all transactions

*   **Method:** `GET`
*   **Path:** `/transactions`
*   **Description:** Retrieves a list of all transactions, ordered by the most recent.
*   **Example Response (200 OK):**
    ```json
    {
        "transactions": [
            {
                "id": 1,
                "description": "Coffee",
                "amount": 4.50,
                "category": "Food",
                "timestamp": "2025-08-21T01:04:33.931Z"
            },
            {
                "id": 2,
                "description": "Groceries",
                "amount": 75.20,
                "category": "Food",
                "timestamp": "2025-08-20T18:30:00.000Z"
            }
        ]
    }
    ```

### 3. Get total balance

*   **Method:** `GET`
*   **Path:** `/transactions/balance`
*   **Description:** Calculates and returns the sum of all transactions.
*   **Example Response (200 OK):**
    ```json
    {
        "balance": 79.70
    }
    ```

### 4. Update a transaction

*   **Method:** `PUT`
*   **Path:** `/transactions/:id`
*   **Description:** Updates the details of a specific transaction. You can provide one or more fields to update.
*   **Path Parameters:**
    *   `id` (number, required): The ID of the transaction to update.
*   **Request Body:**
    ```json
    {
        "description": "string (optional)",
        "amount": "number (optional)",
        "category": "string (optional)",
        "timestamp": "string (optional, e.g., '2025-08-21T01:04:33.931Z')"
    }
    ```
*   **Example Response (200 OK):**
    ```json
    {
        "id": 1,
        "description": "Morning Coffee",
        "amount": 4.75,
        "category": "Food",
        "timestamp": "2025-08-21T01:04:33.931Z"
    }
    ```

### 5. Delete a transaction

*   **Method:** `DELETE`
*   **Path:** `/transactions/:id`
*   **Description:** Deletes a transaction by its ID.
*   **Path Parameters:**
    *   `id` (number, required): The ID of the transaction to delete.
*   **Example Response (200 OK):**
    ```json
    {
        "status": "deleted"
    }
    ```

---

## Categories

### 1. Add a new category

*   **Method:** `POST`
*   **Path:** `/categories`
*   **Description:** Creates a new category for transactions.
*   **Request Body:**
    ```json
    {
        "name": "string"
    }
    ```
*   **Example Response (200 OK):**
    ```json
    {
        "id": 1,
        "name": "Groceries"
    }
    ```

### 2. List all categories

*   **Method:** `GET`
*   **Path:** `/categories`
*   **Description:** Retrieves a list of all available categories.
*   **Example Response (200 OK):**
    ```json
    {
        "categories": [
            {
                "id": 1,
                "name": "Groceries"
            },
            {
                "id": 2,
                "name": "Transport"
            }
        ]
    }
    ```

### 3. Delete a category

*   **Method:** `DELETE`
*   **Path:** `/categories/:name`
*   **Description:** Deletes a category by its name.
*   **Path Parameters:**
    *   `name` (string, required): The name of the category to delete.
*   **Example Response (200 OK):**
    ```json
    {
        "status": "deleted"
    }
    ```

---

## AI Insights Chat

### 1. Chat with the financial assistant

*   **Method:** `POST`
*   **Path:** `/insights/chat`
*   **Description:** Sends a message to the AI chat agent and gets a response. The agent has memory and can access your transaction data.
*   **Request Body:**
    ```json
    {
        "message": "string",
        "sessionId": "string"
    }
    ```
*   **Example Response (200 OK):**
    ```json
    {
        "response": "You spent $79.70 on Food this month."
    }
    ```

---

## Weekly Goals

### 1. Set or update weekly goal

*   **Method:** `POST`
*   **Path:** `/goals`
*   **Description:** Sets or updates the spending goal for the current week.
*   **Request Body:**
    ```json
    {
        "amount": "number"
    }
    ```
*   **Example Response (200 OK):**
    ```json
    {
        "id": 1,
        "week_start_date": "2025-08-18",
        "amount": 500
    }
    ```

### 2. Get weekly goal status

*   **Method:** `GET`
*   **Path:** `/goals`
*   **Description:** Retrieves the spending goal for the current week and tracks progress.
*   **Example Response (200 OK):**
    ```json
    {
        "goal": 500,
        "spent": 79.70,
        "remaining": 420.30
    }