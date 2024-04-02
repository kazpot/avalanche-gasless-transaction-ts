import * as dotenv from "dotenv"; // 環境構築時にこのパッケージはインストールしてあります。
import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";

// .envファイルから環境変数をロードします。
dotenv.config();

if (process.env.PRIVATE_KEY === undefined) {
  console.log("private key is missing");
}

const CHAIN_ID = process.env.CHAIN_ID || "";

const config: HardhatUserConfig = {
  solidity: "0.8.17",
  networks: {
    subnet: {
      url: process.env.CHAIN_RPC_URL,
      chainId: parseInt(CHAIN_ID),
      gasPrice: 700000000000,
      accounts: [process.env.PRIVATE_KEY || ""],
    },
  },
};

export default config;
