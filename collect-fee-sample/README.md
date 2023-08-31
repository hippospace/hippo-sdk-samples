Hippo aggregator allows integrators to charge a fee when they direct user transaction through the aggregator.

`src/index.ts` is a self-contained example of how to use that fee interface.

To run the example:
1. use aptos cli to create a `.aptos/config.yaml` file if you don't already have one
2. make sure the account you are using inside the `config.yaml` has some APT balance
3. `yarn install`
4. `yarn build`
5. `node dist/index.js -c PATH_TO_CONFIG.yaml swap-with-fee APT zUSDC 0.1`

Note that the sample code collects 0.1% fee and sends the fee to the hippo aggregator's contract address.


Note that this sample uses these versions:
- aptos: 1.10.0
- hippo-sdk: 6.1.8

It is important to make sure the version of `aptos` used in your project matches with the version of `aptos` used by 
`hippo-sdk` or various runtime type errors might occur.