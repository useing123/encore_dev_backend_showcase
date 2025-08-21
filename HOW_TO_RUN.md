# How to Run This Project

This document provides instructions on how to run the backend services for the Pennywise application locally.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Encore:** This project is built using the Encore framework. If you don't have it installed, follow the instructions for your operating system:
  - **macOS:** `brew install encoredev/tap/encore`
  - **Linux:** `curl -L https://encore.dev/install.sh | bash`
  - **Windows:** `iwr https://encore.dev/install.ps1 | iex`
- **Docker:** The project uses a PostgreSQL database that runs in a Docker container managed by Encore. Make sure you have Docker installed and running.

## Configuration

The AI Insights service uses the Google Gemini API. You need to provide an API key to run the application.

1.  **Obtain a Gemini API Key:** Get your API key from Google AI Studio.
2.  **Set the Environment Variable:** Set the `GEMINI_API_KEY` environment variable. You can do this by prefixing the `encore run` command:

    ```bash
    GEMINI_API_KEY="YOUR_API_KEY" encore run
    ```

    Replace `"YOUR_API_KEY"` with your actual Gemini API key.

## Running the Application

Once you have the prerequisites and configuration in place, you can run the application.

1.  **Navigate to the project root directory.**
2.  **Run the application:**

    ```bash
    GEMINI_API_KEY="YOUR_API_KEY" encore run
    ```

This command starts the application, sets up the database, and applies migrations.

### Accessing the API

While the application is running, you can interact with the API endpoints.

- **List all transactions:**
  ```bash
  curl http://localhost:4000/transactions
  ```

- **Get the account balance:**
  ```bash
  curl http://localhost:4000/transactions/balance
  ```

- **List available categories:**
  ```bash
  curl http://localhost:4000/categories
  ```

- **Add a new transaction:**
  ```bash
  curl -X POST http://localhost:4000/transactions -d '{
    "description": "Coffee",
    "amount": 5,
    "category": "Food"
  }'
  ```

### Local Development Dashboard

While `encore run` is running, you can access Encore's local developer dashboard at [http://localhost:9400/](http://localhost:9400/). This dashboard provides request tracing, an architecture diagram, and API documentation.

## Project Overview and Development Process

This section addresses the points mentioned in the project requirements.

### The app running with your features

The application can be run using the instructions above. The key features are:
- Transaction management (add, list, balance)
- Transaction categorization
- AI-powered financial insights (currently disabled in the documentation, but the code might be present)

### Your Encore.dev backend architecture

The backend is built with Encore and TypeScript, following a service-based architecture. The main services are:
- **`transactions`**: Manages financial transactions.
- **`categories`**: Manages transaction categories.
- **`ai-insights`**: Provides AI-powered financial analysis.
- **`goals`**: Manages financial goals.

The services communicate with each other and a shared PostgreSQL database named `pennywise`.

### Why your approach matters

This approach, using Encore, allows for rapid development of a microservices-based backend. Encore handles the boilerplate for setting up services, databases, and APIs, allowing the developer to focus on business logic. Using an AI assistant can further accelerate the development process.