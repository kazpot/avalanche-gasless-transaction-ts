import * as ethSigUtil from "@metamask/eth-sig-util";
import { ethers } from "hardhat";
import { BigNumber } from "@ethersproject/bignumber";
import {
  SignTypedDataVersion,
  signTypedData,
  recoverTypedSignature,
} from "@metamask/eth-sig-util";
import axios from "axios";

import GaslessNftArtifact from "../artifacts/contracts/GaslessNft.sol/GaslessNft.json";

const DOMAIN_NAME = process.env.DOMAIN_NAME || "";
const DOMAIN_VERSION = "1";
const REQUEST_TYPE = "Message";
const REQUEST_SUFFIX_TYPE = process.env.REQUEST_SUFFIX_TYPE || "";
const REQUEST_SUFFIX = process.env.REQUEST_SUFFIX || "";
const SUFFIX = `${REQUEST_SUFFIX_TYPE} ${REQUEST_SUFFIX}`;
const REQUEST_SUFFIX_FIELD = REQUEST_SUFFIX.slice(0, -1);
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const FORWARDER_ADDRESS = process.env.FORWARDER_ADDRESS || "";
const RECIPIENT_CONTRACT_ADDRESS = process.env.RECIPIENT_CONTRACT_ADDRESS || "";
const RELAYER_URL = process.env.RELAYER_URL || "";

interface MessageTypeProperty {
  name: string;
  type: string;
}
interface MessageTypes {
  EIP712Domain: MessageTypeProperty[];
  [additionalProperties: string]: MessageTypeProperty[];
}

function getEIP712Message(
  domainName: string,
  domainVersion: string,
  chainId: number,
  forwarderAddress: string,
  data: string,
  from: string,
  to: string,
  gas: BigNumber,
  nonce: BigNumber
) {
  const types: MessageTypes = {
    EIP712Domain: [
      { name: "name", type: "string" },
      { name: "version", type: "string" },
      { name: "chainId", type: "uint256" },
      { name: "verifyingContract", type: "address" },
    ],
    Message: [
      { name: "from", type: "address" },
      { name: "to", type: "address" },
      { name: "value", type: "uint256" },
      { name: "gas", type: "uint256" },
      { name: "nonce", type: "uint256" },
      { name: "data", type: "bytes" },
      { name: "validUntilTime", type: "uint256" },
      { name: REQUEST_SUFFIX_FIELD, type: REQUEST_SUFFIX_TYPE },
    ],
  };

  const message = {
    from: from,
    to: to,
    value: String("0x0"),
    gas: gas.toHexString(),
    nonce: nonce.toHexString(),
    data,
    validUntilTime: String(
      "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
    ),
  };

  const result = {
    domain: {
      name: domainName,
      version: domainVersion,
      chainId: chainId,
      verifyingContract: forwarderAddress,
    },
    types: types,
    primaryType: REQUEST_TYPE,
    message: message,
  };

  return result;
}

async function main() {
  const [account] = await ethers.getSigners();

  // get network info from node
  const network = await ethers.provider.getNetwork();
  const hexChainId = ethers.utils.hexValue(network.chainId);

  // get forwarder contract
  const Forwarder = await ethers.getContractFactory("Forwarder");
  const forwarder = Forwarder.attach(FORWARDER_ADDRESS);
  console.log(`using chain id ${network.chainId}(${hexChainId})`);
  console.log(`using account ${await account.getAddress()}`);

  // get current nonce in forwarder contract
  const nonce = await forwarder.getNonce(account.getAddress());

  // get gaslessERC20 contract
  if (!RECIPIENT_CONTRACT_ADDRESS) {
    throw new Error(
      "RECIPIENT_CONTRACT_ADDRESS environment variable is not defined or empty"
    );
  }

  const gasLessNft = new ethers.Contract(
    RECIPIENT_CONTRACT_ADDRESS,
    GaslessNftArtifact.abi,
    account
  );

  // get function selector for mint method
  const fragment = gasLessNft.interface.getFunction("mint");
  const func = gasLessNft.interface.getSighash(fragment);

  const gasLimit = await gasLessNft.estimateGas.mint();
  console.log("estimated gasLimit for mint(): " + gasLimit);

  const eip712Message = getEIP712Message(
    DOMAIN_NAME,
    DOMAIN_VERSION,
    network.chainId,
    forwarder.address,
    func, // function mint() 0x1249c58b
    account.address,
    RECIPIENT_CONTRACT_ADDRESS,
    BigNumber.from(gasLimit),
    nonce
  );

  const dataToSign = {
    domain: eip712Message.domain,
    types: eip712Message.types,
    primaryType: eip712Message.primaryType,
    message: {
      ...eip712Message.message,
      [REQUEST_SUFFIX_FIELD]: Buffer.from(SUFFIX, "utf8"),
    },
  };

  console.log("dataToSign: " + JSON.stringify(dataToSign, null, 2));

  const signature = ethSigUtil.signTypedData({
    privateKey: Buffer.from(PRIVATE_KEY, "hex"),
    data: dataToSign,
    version: ethSigUtil.SignTypedDataVersion.V4,
  });

  // recover test locally. This may be always success.
  const recovered = ethSigUtil.recoverTypedSignature({
    data: dataToSign,
    signature,
    version: ethSigUtil.SignTypedDataVersion.V4,
  });

  if (recovered.toLowerCase() !== (await account.getAddress()).toLowerCase()) {
    throw new Error("Invalid signature");
  } else {
    console.log("valid signature: ", recovered);
  }

  if (!PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY not set");
  }

  const sig = signTypedData({
    privateKey: Buffer.from(PRIVATE_KEY, "hex"),
    data: dataToSign,
    version: SignTypedDataVersion.V4,
  });

  const ecRecover = recoverTypedSignature({
    data: dataToSign,
    signature: sig,
    version: SignTypedDataVersion.V4,
  });

  if (ethers.utils.getAddress(ecRecover) != account.address) {
    throw new Error("Fail sign and recover");
  }

  const tx = {
    forwardRequest: eip712Message,
    metadata: {
      signature: sig.substring(2),
    },
  };
  console.log(tx);

  const rawTx = "0x" + Buffer.from(JSON.stringify(tx)).toString("hex");

  // wrap relay tx with json rpc request format.
  const requestBody = {
    id: 1,
    jsonrpc: "2.0",
    method: "eth_sendRawTransaction",
    params: [rawTx],
  };

  const address = ethSigUtil.recoverTypedSignature({
    data: dataToSign,
    signature,
    version: SignTypedDataVersion.V4,
  });
  console.log("recovered address: ", address);

  // send relay tx to relay server
  try {
    const result = await axios.post(RELAYER_URL, requestBody, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    const txHash = result.data.result;
    console.log(`txHash : ${txHash}`);
    const receipt = await ethers.provider.waitForTransaction(txHash);
    console.log(`tx mined : ${JSON.stringify(receipt, null, 2)}`);
  } catch (e: any) {
    console.error(e.response.data);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
