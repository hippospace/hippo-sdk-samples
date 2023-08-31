import { AptosAccount, AptosClient, HexString, Types } from "aptos";
import * as yaml from "yaml";
import * as fs from "fs";
import { Command } from "commander";
import { TradeAggregator } from "@manahippo/hippo-sdk";

const cmd = new Command('swap-with-fee')
  .requiredOption('-c, --config <path>', 'path to your aptos config.yml (generated with "aptos init")')
  .option('-p, --profile <PROFILE>', 'aptos config profile to use', 'default');

/*
This just reads the .aptos/config.yaml file
You need to generate this yaml file using aptos cli before running this sample
*/
export const readConfig = () => {
  const { config, profile } = cmd.opts();
  const ymlContent = fs.readFileSync(config, { encoding: 'utf-8' });
  const result = yaml.parse(ymlContent);
  const url = result.profiles[profile].rest_url;
  const privateKeyStr = result.profiles[profile].private_key;
  const privateKey = new HexString(privateKeyStr);

  const account = new AptosAccount(privateKey.toUint8Array());
  const client = new AptosClient(url);
  return { client, account };
};

const swapWithFee = async (from: string, to: string, inputAmt: string) => {
  const {client, account} = readConfig();
  const agg = await TradeAggregator.create(client);
  const coinlist = agg.coinListClient;
  const inputCoinInfo = coinlist.getCoinInfoBySymbol(from)[0];
  const toCoinInfo = coinlist.getCoinInfoBySymbol(to)[0];
  const quotes = await agg.getQuotes(parseFloat(inputAmt), inputCoinInfo, toCoinInfo);
  if (quotes.length === 0) {
    console.log('No route available');
    return;
  }
  const payload = quotes[0].route.makeSwapWithFeesPayload(
    parseFloat(inputAmt), 
    0, // min output
    new HexString("89576037b3cc0b89645ea393a47787bb348272c76d6941c574b053672b848039"),  // send fee to address
    0.001, // amount of fee to charge
    true // make json payload
  ) as Types.TransactionPayload_EntryFunctionPayload;

  const txn = await client.generateTransaction(account.address(), payload);
  const txid = await client.signAndSubmitTransaction(account, txn);
  console.log(txid);
}

cmd.command("swap-with-fee")
  .argument('<InputSymbol>')
  .argument('<OutputSymbol>')
  .argument('<InputAmount>')
  .action(swapWithFee);

cmd.parse();