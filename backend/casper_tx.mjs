import { CasperClient, DeployUtil, CLPublicKey, Keys } from "casper-js-sdk";
import { readFileSync } from "fs";

const [,, caseHash, strength, claimType] = process.argv;

const PRIVATE_KEY_PEM = process.env.CASPER_PRIVATE_KEY;
const RPC_URL = "https://node.testnet.cspr.cloud/rpc";
const AUTH_TOKEN = process.env.CSPR_CLOUD_API_KEY;

async function sendTransaction() {
  try {
    // Load key pair from PEM
    const keyPair = Keys.Ed25519.parsePrivateKey(
      Keys.Ed25519.readBase64WithPEM(PRIVATE_KEY_PEM)
    );
    const publicKey = keyPair.publicKey;

    const client = new CasperClient(RPC_URL, {
      headers: { Authorization: AUTH_TOKEN }
    });

    // Build a transfer deploy to self with case hash as memo
    const deployParams = new DeployUtil.DeployParams(
      publicKey,
      "casper-test",
      1,
      1800000
    );

    const deploy = DeployUtil.makeDeploy(
      deployParams,
      DeployUtil.ExecutableDeployItem.newTransfer(
        2500000000, // 2.5 CSPR minimum
        publicKey,  // send to self
        null,
        parseInt(caseHash.slice(0, 8), 16) // use hash as transfer ID
      ),
      DeployUtil.standardPayment(100000000)
    );

    const signedDeploy = deploy.sign([keyPair]);
    const deployHash = await client.putDeploy(signedDeploy);

    console.log(JSON.stringify({ success: true, deployHash }));
  } catch (err) {
    console.log(JSON.stringify({ success: false, error: err.message }));
  }
}

sendTransaction();