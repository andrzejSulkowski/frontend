import process from "node:process";
import { getWsProvider } from "polkadot-api/ws-provider/web";
import {
  createClient,
  type PolkadotClient,
  type SS58String,
} from "polkadot-api";
import { dot, people } from "@polkadot-api/descriptors";

function makeClient(endpoint: string): PolkadotClient {
  console.log(`Connecting to endpoint: ${endpoint}`);
  const provider = getWsProvider(endpoint);
  const client = createClient(provider);
  return client;
}

async function printChainInfo(client: PolkadotClient) {
  // **IMPORTANT NOTE:** This method is used in this tutorial, but it should not be used in production apps.
  const chain = await client.getChainSpecData();
  const finalizedBlock = await client.getFinalizedBlock();
  console.log(
    `Connected to ${chain.name} at block ${finalizedBlock.number}.\n`,
  );
}

async function getBalance(
  polkadotClient: PolkadotClient,
  address: SS58String,
): Promise<BigInt> {
  const dotApi = polkadotClient.getTypedApi(dot);
  const accountInfo = await dotApi.query.System.Account.getValue(address);
  const { free, reserved } = accountInfo.data;
  return free + reserved;
}

async function getDisplayName(
  peopleClient: PolkadotClient,
  address: SS58String,
): Promise<string | undefined> {
  const peopleApi = peopleClient.getTypedApi(people);
  const accountInfo =
    await peopleApi.query.Identity.IdentityOf.getValue(address);
  const displayName = accountInfo?.[0].info.display.value?.asText();
  return displayName;
}

async function main() {
  const polkadotClient = makeClient("wss://rpc.polkadot.io");
  await printChainInfo(polkadotClient);

  const peopleClient = makeClient("wss://polkadot-people-rpc.polkadot.io");
  await printChainInfo(peopleClient);

  const address = "15DCZocYEM2ThYCAj22QE4QENRvUNVrDtoLBVbCm5x4EQncr";
  const balance = await getBalance(polkadotClient, address);
  const displayName = await getDisplayName(peopleClient, address);
  console.log(`Balance of ${displayName} (${address}) is ${balance}.`);

  console.log(`Done!`);
  process.exit(0);
}

main();
