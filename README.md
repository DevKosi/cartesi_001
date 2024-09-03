# Carbon Credit Management dApp

This Cartesi dApp manages carbon credits, allowing users to create accounts, mint credits, transfer credits between accounts, and check account balances.

## Features

- Create user accounts
- Mint carbon credits
- Transfer carbon credits between accounts
- Check account balances
- View all accounts and credits (via inspect)

## Installation

1. Ensure you have the Cartesi environment set up. Follow the [Cartesi installation guide](https://docs.cartesi.io/cartesi-rollups/1.3/development/installation/).

2. Clone this repository:

   ```
   git clone <repository-url>
   cd carbon-credit-management
   ```

3. Build the dApp:
   ```
   cartesi build
   ```

## Running the dApp

1. Start the Cartesi node:

   ```
   cartesi run
   ```

2. In a new terminal, you can now interact with the dApp using the Cartesi CLI.

## Usage

### Sending Inputs (Advance Requests)

Use the Cartesi CLI to send inputs to the dApp:

1. Create an account:

   ```
   cartesi send generic
   ```

   When prompted, enter the following as the input string:

   ```json
   { "action": "create_account", "address": "<user-address>" }
   ```

2. Mint carbon credits:

   ```
   cartesi send generic
   ```

   Input string:

   ```json
   {"action": "mint_credits", "address": "<user-address>", "amount": <credit-amount>}
   ```

3. Transfer carbon credits:

   ```
   cartesi send generic
   ```

   Input string:

   ```json
   {"action": "transfer_credits", "from": "<sender-address>", "to": "<receiver-address>", "amount": <credit-amount>}
   ```

4. Check account balance:
   ```
   cartesi send generic
   ```
   Input string:
   ```json
   { "action": "get_balance", "address": "<user-address>" }
   ```

### Inspecting State

To view the current state without modifying it, use the following curl commands:

1. View all accounts:

   ```
   curl http://localhost:8080/inspect/accounts
   ```

2. View all carbon credits:
   ```
   curl http://localhost:8080/inspect/credits
   ```

## Viewing Results

After sending inputs or making inspect calls, you can view the results:

1. For advance requests (inputs), check the notices in the Cartesi Explorer or use the GraphQL API to query for notices.

2. For inspect requests, the response will be returned directly in the curl command output.

## GraphQL Interface

You can also use the GraphQL interface to query the dApp's state:

1. Open `http://localhost:8080/graphql` in your browser.

2. Use the following query to fetch notices:

   ```graphql
   query notices {
     notices {
       edges {
         node {
           index
           input {
             index
           }
           payload
         }
       }
     }
   }
   ```

## Development

To modify or extend the dApp:

1. Edit the `index.js` file to add new features or modify existing ones.
2. Rebuild the dApp using `cartesi build`.
3. Restart the Cartesi node to apply changes.
