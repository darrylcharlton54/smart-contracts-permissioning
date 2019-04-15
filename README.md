# Permissioning Smart Contracts

## Requirements
1. [NodeJS](https://nodejs.org/en/) v8.9.4 or later
1. A [Pantheon node](https://github.com/PegaSysEng/pantheon) running with a [permissioning enabled genesis](genesis.json) file (genesis file with the Ingress contract embedded).
1. [Truffle installed](https://truffleframework.com/docs/truffle/getting-started/installation)

## Initial setup
1. Run `npm install`.
1. Open `truffle-config.js`.
1. Create the following environment variables:
    - `PANTHEON_NODE_PERM_ACCOUNT` - Set the value to the adress of the account used to interact with the permissioning contracts.
    - `PANTHEON_NODE_PERM_KEY` - Set the value to the private key associated with the account.
1. If your node is not using the default JSON-RPC host and port (`http://127.0.0.1:8545`), create a environment variable named `PANTHEON_NODE_PERM_ENDPOINT` and set its value to match your node endpoint.


## How to deploy and setup contracts
1. Run `truffle migrate`

After this step, you should have your Rules contract deployed on the network. This will also update the Ingress contract with the name and version of the Rules contract.

## Add and Remove Enodes to the whitelist
1. Run `truffle console`
1. Open https://permissioning-tools.pegasys.tech/
1. Type the enode that you want to include in the whitelist in the input box.
1. Click "Process".
1. Copy the truffe command output.
1. Paste the truffle command into the console and press enter.

Example output:
```
$ truffle console
$ truffle(development)> Rules.deployed().then(function(instance) {instance.addEnode("0x6f8a80d14311c39f35f516fa664deaaaa13e85b2f7493f37f6144d86991ec012", "0x937307647bd3b9a82abe2974e1407241d54947bbb39763a4cac9f77166ad92a0", "0x0a033a06", "30303").then(function(tx) {console.log(tx)});});
undefined
truffle(development)> { tx: '0xaecbc376089d8eba7154f93d08c6be3bdf7fa13bfe2d8dbdfe4cd323fec77160',
  receipt:
   { blockHash: '0x553007bb40a52e3f37f3c9b8e559816d029c9e272590efac69b96926431ebfdd',
     blockNumber: 22264,
     contractAddress: null,
     cumulativeGasUsed: 596203,
     from: '0xfe3b557e8fb62b89f4916b721be55ceb828dbd73',
     gasUsed: 596203,
     logs: [],
     logsBloom: '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
     status: true,
     to: '0xa86eb77c09ae0f2164065ab14094565011b0bfca',
     transactionHash: '0xaecbc376089d8eba7154f93d08c6be3bdf7fa13bfe2d8dbdfe4cd323fec77160',
     transactionIndex: 0,
     rawLogs: [] },
  logs: [] }

undefined
```

After this step, you should have the enode added to your whitelist. Please repeat this step for each enode that you want to add to the whitelist.

## Add and Remove Admin accounts

When you first deploy the Rules smart contract, the account used to deploy it will automatically be set as an Admin. Only Admin accounts can add or remove nodes from the whitelist.

If you want to add or remove accounts as Admins, use the following commands in `truffle console`:

**Add account `0x627306090abaB3A6e1400e9345bC60c78a8BEf57` to Admin list**
```
Rules.deployed().then(function(instance) {instance.addAdmin("0x627306090abaB3A6e1400e9345bC60c78a8BEf57").then(function(tx) {console.log(tx)});});
```

**Remove acccount `0x627306090abaB3A6e1400e9345bC60c78a8BEf57` from Admin list**
```
Rules.deployed().then(function(instance) {instance.removeAdmin("0x627306090abaB3A6e1400e9345bC60c78a8BEf57").then(function(tx) {console.log(tx)});});
```

## Development

### Linting
Linting is set up using solium. To run it over your code execute `npm run lint`.

### Testing
`npm test`
