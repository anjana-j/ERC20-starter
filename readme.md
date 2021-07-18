# ERC20 Starter

ERC20 contract with a daily and globally mint limit.

## Install

Use [nodejs](https://nodejs.org/en/) to install relevant packages.

```bash
npm install
```

## Usage
Add .env to root and insert below details

```text
ADDRESS=YOUR_WALLET_ADDRESS
PRIVATE_KEY=YOUR_PRIVATE_KEY
```

## Testing
```javascript
hh test
```

## Deploy
```javascript
hh run scripts/deploy-script.js --network rinkeby
```
