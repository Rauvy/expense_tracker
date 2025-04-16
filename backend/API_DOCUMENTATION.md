# Expense Tracker API Documentation

## Authentication

### Register User

- **URL**: `/auth/register`
- **Method**: `POST`
- **Description**: Register a new user
- **Request Body**:

```json
{
  "email": "user@example.com",
  "password": "password123",
  "first_name": "John",
  "last_name": "Doe",
  "birth_date": "1990-01-01",
  "initial_balance": 0.0
}
```

- **Response**:

```json
{
  "id": 1,
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "birth_date": "1990-01-01",
  "balance": 0.0
}
```

### Login

- **URL**: `/auth/login`
- **Method**: `POST`
- **Description**: Authenticate user and get access token
- **Request Body**:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

- **Response**:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```

### Google Login

- **URL**: `/auth/google`
- **Method**: `POST`
- **Description**: Authenticate user using Google OAuth
- **Request Body**:

```json
{
  "id_token": "google_id_token"
}
```

- **Response**:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```

### Refresh Tokens

- **URL**: `/auth/refresh`
- **Method**: `POST`
- **Description**: Get new access and refresh tokens
- **Request Body**:

```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

- **Response**:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```

### Logout

- **URL**: `/auth/logout`
- **Method**: `POST`
- **Description**: Logout from current device
- **Request Body**:

```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

- **Response**:

```json
{
  "detail": "Successfully logged out"
}
```

### Logout All Devices

- **URL**: `/auth/logout-all`
- **Method**: `POST`
- **Description**: Logout from all devices
- **Response**:

```json
{
  "detail": "Logged out from all devices"
}
```

## Transactions

### Get All Transactions

- **URL**: `/transactions/all`
- **Method**: `GET`
- **Description**: Get all transactions with pagination and filters
- **Query Parameters**:
  - `source_filter` (optional): Filter by source ("manual" or "plaid")
  - `transaction_type` (optional): Filter by type ("income" or "expense")
  - `limit` (optional): Number of items per page (default: 20)
  - `offset` (optional): Page offset (default: 0)
- **Response**:

```json
{
  "transactions": [
    {
      "id": 1,
      "amount": 100.0,
      "description": "Grocery shopping",
      "date": "2024-04-16",
      "category": "Groceries",
      "payment_method": "Credit Card",
      "type": "expense",
      "source": "manual"
    }
  ],
  "total": 100,
  "limit": 20,
  "offset": 0
}
```

### Get Transaction by ID

- **URL**: `/transactions/{transaction_id}`
- **Method**: `GET`
- **Description**: Get a specific transaction by ID
- **Response**:

```json
{
  "id": 1,
  "amount": 100.0,
  "description": "Grocery shopping",
  "date": "2024-04-16",
  "category": "Groceries",
  "payment_method": "Credit Card",
  "type": "expense",
  "source": "manual"
}
```

### Create Transaction

- **URL**: `/transactions/`
- **Method**: `POST`
- **Description**: Create a new transaction
- **Request Body**:

```json
{
  "amount": 100.0,
  "description": "Grocery shopping",
  "date": "2024-04-16",
  "category": "Groceries",
  "payment_method": "Credit Card",
  "type": "expense"
}
```

- **Response**:

```json
{
  "id": 1,
  "amount": 100.0,
  "description": "Grocery shopping",
  "date": "2024-04-16",
  "category": "Groceries",
  "payment_method": "Credit Card",
  "type": "expense",
  "source": "manual"
}
```

### Update Transaction

- **URL**: `/transactions/{transaction_id}`
- **Method**: `PUT`
- **Description**: Update an existing transaction
- **Request Body**:

```json
{
  "amount": 150.0,
  "description": "Grocery shopping",
  "date": "2024-04-16",
  "category": "Groceries",
  "payment_method": "Credit Card",
  "type": "expense"
}
```

- **Response**:

```json
{
  "message": "Transaction updated successfully"
}
```

### Delete Transaction

- **URL**: `/transactions/{transaction_id}`
- **Method**: `DELETE`
- **Description**: Delete a transaction
- **Response**:

```json
{
  "message": "Transaction deleted successfully"
}
```

## Categories

### Get All Categories

- **URL**: `/categories/`
- **Method**: `GET`
- **Description**: Get all categories (global and user-specific)
- **Response**:

```json
{
  "categories": [
    {
      "id": 1,
      "name": "Groceries",
      "icon": "shopping-cart",
      "color": "#FF0000",
      "is_default": false
    }
  ]
}
```

### Get Category by ID

- **URL**: `/categories/{category_id}`
- **Method**: `GET`
- **Description**: Get a specific category by ID
- **Response**:

```json
{
  "id": 1,
  "name": "Groceries",
  "icon": "shopping-cart",
  "color": "#FF0000",
  "is_default": false
}
```

### Create Category

- **URL**: `/categories/`
- **Method**: `POST`
- **Description**: Create a new category
- **Request Body**:

```json
{
  "name": "Groceries",
  "icon": "shopping-cart",
  "color": "#FF0000"
}
```

- **Response**:

```json
{
  "id": 1,
  "name": "Groceries",
  "icon": "shopping-cart",
  "color": "#FF0000",
  "is_default": false
}
```

### Update Category

- **URL**: `/categories/{category_id}`
- **Method**: `PUT`
- **Description**: Update a category
- **Request Body**:

```json
{
  "name": "Groceries",
  "icon": "shopping-cart",
  "color": "#FF0000"
}
```

- **Response**:

```json
{
  "id": 1,
  "name": "Groceries",
  "icon": "shopping-cart",
  "color": "#FF0000",
  "is_default": false
}
```

### Delete Category

- **URL**: `/categories/{category_id}`
- **Method**: `DELETE`
- **Description**: Delete a category
- **Response**:

```json
{
  "detail": "Category deleted successfully"
}
```

## Payment Methods

### Get All Payment Methods

- **URL**: `/payment-methods/`
- **Method**: `GET`
- **Description**: Get all payment methods
- **Response**:

```json
{
  "payment_methods": [
    {
      "id": 1,
      "name": "Credit Card",
      "bank": "Chase",
      "card_type": "Visa",
      "last4": "1234",
      "icon": "credit-card"
    }
  ]
}
```

### Get Payment Method by ID

- **URL**: `/payment-methods/{method_id}`
- **Method**: `GET`
- **Description**: Get a specific payment method by ID
- **Response**:

```json
{
  "id": 1,
  "name": "Credit Card",
  "bank": "Chase",
  "card_type": "Visa",
  "last4": "1234",
  "icon": "credit-card"
}
```

### Create Payment Method

- **URL**: `/payment-methods/`
- **Method**: `POST`
- **Description**: Create a new payment method
- **Request Body**:

```json
{
  "name": "Credit Card",
  "bank": "Chase",
  "card_type": "Visa",
  "last4": "1234",
  "icon": "credit-card"
}
```

- **Response**:

```json
{
  "id": 1,
  "name": "Credit Card",
  "bank": "Chase",
  "card_type": "Visa",
  "last4": "1234",
  "icon": "credit-card"
}
```

### Update Payment Method

- **URL**: `/payment-methods/{method_id}`
- **Method**: `PUT`
- **Description**: Update a payment method
- **Request Body**:

```json
{
  "name": "Credit Card",
  "bank": "Chase",
  "card_type": "Visa",
  "last4": "1234",
  "icon": "credit-card"
}
```

- **Response**:

```json
{
  "id": 1,
  "name": "Credit Card",
  "bank": "Chase",
  "card_type": "Visa",
  "last4": "1234",
  "icon": "credit-card"
}
```

### Delete Payment Method

- **URL**: `/payment-methods/{method_id}`
- **Method**: `DELETE`
- **Description**: Delete a payment method
- **Response**:

```json
{
  "detail": "Payment method deleted"
}
```

## Budget

### Get All Budgets

- **URL**: `/budgets/`
- **Method**: `GET`
- **Description**: Get all budgets
- **Response**:

```json
{
  "budgets": [
    {
      "category": "Groceries",
      "limit": 500.0,
      "spent": 300.0
    }
  ]
}
```

### Create Budget

- **URL**: `/budgets/`
- **Method**: `POST`
- **Description**: Create a new budget
- **Request Body**:

```json
{
  "category": "Groceries",
  "limit": 500.0
}
```

- **Response**:

```json
{
  "category": "Groceries",
  "limit": 500.0,
  "spent": 0.0
}
```

### Update Budget

- **URL**: `/budgets/{category}`
- **Method**: `PUT`
- **Description**: Update a budget
- **Request Body**:

```json
{
  "limit": 600.0
}
```

- **Response**:

```json
{
  "category": "Groceries",
  "limit": 600.0,
  "spent": 300.0
}
```

### Delete Budget

- **URL**: `/budgets/{category}`
- **Method**: `DELETE`
- **Description**: Delete a budget
- **Response**: 204 No Content

## Plaid Integration

### Create Link Token

- **URL**: `/plaid/link-token`
- **Method**: `POST`
- **Description**: Create a Plaid link token for bank connection
- **Response**:

```json
{
  "link_token": "link-sandbox-123"
}
```

### Exchange Public Token

- **URL**: `/plaid/exchange-public-token`
- **Method**: `POST`
- **Description**: Exchange Plaid public token for access token
- **Request Body**:

```json
{
  "public_token": "public-sandbox-123"
}
```

- **Response**:

```json
{
  "status": "success",
  "message": "Bank account connected",
  "item_id": "item-123",
  "institution_name": "Chase"
}
```

### Get Bank Accounts

- **URL**: `/plaid/accounts`
- **Method**: `GET`
- **Description**: Get and save bank accounts
- **Response**:

```json
[
  {
    "account_id": "acc-123",
    "name": "Checking Account",
    "official_name": "Chase Checking",
    "type": "depository",
    "subtype": "checking",
    "mask": "0000",
    "current_balance": 1000.0,
    "available_balance": 1000.0,
    "iso_currency_code": "USD"
  }
]
```

### Get Transactions

- **URL**: `/plaid/transactions`
- **Method**: `GET`
- **Description**: Sync and get bank transactions
- **Query Parameters**:
  - `account_type` (optional): Filter by account type
- **Response**:

```json
[
  {
    "transaction_id": "txn-123",
    "account_id": "acc-123",
    "amount": 100.0,
    "date": "2024-04-16",
    "name": "Grocery Store",
    "merchant_name": "Walmart",
    "category": ["Shopping", "Groceries"],
    "pending": false
  }
]
```

### Delete Bank Connection

- **URL**: `/plaid/connection/{connection_id}`
- **Method**: `DELETE`
- **Description**: Delete a bank connection
- **Response**:

```json
{
  "message": "Bank connection deleted successfully"
}
```

### Sync Latest Transactions

- **URL**: `/plaid/transactions/sync-latest`
- **Method**: `GET`
- **Description**: Sync latest transactions from all connected accounts
- **Response**:

```json
{
  "status": "success",
  "message": "Transactions synced successfully",
  "new_transactions": 10
}
```

## AI Features

### Get AI Tips

- **URL**: `/ai/tips`
- **Method**: `GET`
- **Description**: Get AI-powered spending tips
- **Response**:

```json
{
  "model": "gpt-4-turbo",
  "tips": [
    "Consider meal planning to reduce grocery expenses",
    "Review your subscription services",
    "Set up automatic transfers to savings"
  ]
}
```

## Analytics

### Get Spending Analytics

- **URL**: `/analytics/spending`
- **Method**: `GET`
- **Description**: Get spending analytics
- **Query Parameters**:
  - `start_date` (optional): Start date for analysis
  - `end_date` (optional): End date for analysis
  - `group_by` (optional): Group by day/week/month
- **Response**:

```json
{
  "total_spent": 1500.0,
  "by_category": [
    {
      "category_id": 1,
      "amount": 500.0,
      "percentage": 33.33
    }
  ],
  "by_date": [
    {
      "date": "2024-04-16",
      "amount": 100.0
    }
  ]
}
```

## Account

### Get User Profile

- **URL**: `/account/profile`
- **Method**: `GET`
- **Description**: Get user profile information
- **Response**:

```json
{
  "id": 1,
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "created_at": "2024-04-16T10:00:00Z"
}
```

### Update User Profile

- **URL**: `/account/profile`
- **Method**: `PUT`
- **Description**: Update user profile information
- **Request Body**:

```json
{
  "first_name": "John",
  "last_name": "Doe"
}
```

- **Response**:

```json
{
  "id": 1,
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "created_at": "2024-04-16T10:00:00Z"
}
```
