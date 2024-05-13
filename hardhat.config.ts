import * as dotenv from "dotenv";
import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";

dotenv.config();

const CHAIN_ID = process.env.CHAIN_ID || "";
const CHAIN_RPC_URL = process.env.CHAIN_RPC_URL || "";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";

const config: HardhatUserConfig = {
  solidity: "0.8.17",
  networks: {
    subnet: {
      url: CHAIN_RPC_URL,
      chainId: parseInt(CHAIN_ID),
      accounts: [PRIVATE_KEY],
    },
  },
};

export default config;
