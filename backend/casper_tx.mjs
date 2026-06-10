import { CasperClient, DeployUtil, CLPublicKey, Keys } from "casper-js-sdk";

const [,, caseHash, strength, claimType] = process.argv;

const PRIVATE_KEY_PEM = process.env.CASPER_PRIVATE_KEY;
const PUBLIC_KEY_HEX  = process.env.CASPER_PUBLIC_KEY;
const RPC_URL         = "https://node.testnet.cspr.cloud/rpc";

async function sendTransaction() {
  try {
    if (!PRIVATE_KEY_PEM || !PUBLIC_KEY_HEX) {
      throw new Error("CASPER_PRIVATE_KEY or CASPER_PUBLIC_KEY not set");
    }

    // Reconstruct the PEM (Railway stores \n as literal backslash-n)
    const pem = PRIVATE_KEY_PEM.replace(/\\n/g, "\n");

    // Casper wallet exports secp256k1 (BEGIN EC PRIVATE KEY)
    // Extract raw 32-byte private key from the DER-encoded PEM
    const b64 = pem
      .split("\n")
      .filter(l => l.length > 0 && !l.startsWith("---"))
      .join("");
    const der = Buffer.from(b64, "base64");

    // DER structure for EC private key: 30 77 02 01 01 04 20 <32 bytes key> ...
    // The 32-byte private key starts at offset 7
    const privateKeyBytes = der.slice(7, 39);

    const keyPair   = Keys.Secp256K1.parsePrivateKey(privateKeyBytes, "raw");
    const publicKey = CLPublicKey.fromHex(PUBLIC_KEY_HEX);

    const client = new CasperClient(RPC_URL);

    const deployParams = new DeployUtil.DeployParams(
      publicKey,
      "casper-test",
      1,
      1800000
    );

    const deploy = DeployUtil.makeDeploy(
      deployParams,
      DeployUtil.ExecutableDeployItem.newTransfer(
        "2500000000",
        publicKey,
        null,
        parseInt(caseHash.slice(0, 8), 16)
      ),
      DeployUtil.standardPayment("100000000")
    );

    const signedDeploy = DeployUtil.signDeploy(deploy, keyPair);
    const deployHash   = await client.putDeploy(signedDeploy);

    console.log(JSON.stringify({
      success: true,
      deployHash,
      explorerUrl: `https://testnet.cspr.live/deploy/${deployHash}`
    }));

  } catch (err) {
    console.log(JSON.stringify({ success: false, error: err.message }));
    process.exit(0);
  }
}

sendTransaction();
