import { ethers } from "hardhat";

const FORWARDER_ADDRESS = process.env.FORWARDER_ADDRESS;

if (!FORWARDER_ADDRESS) {
  console.error(
    "FORWARDER_ADDRESS is not provided. Please provide a valid address."
  );
  process.exit(1);
}

async function main() {
  const factory = await ethers.getContractFactory("GaslessNft");
  const [owner] = await ethers.getSigners();
  const contract = await factory.deploy(FORWARDER_ADDRESS);

  await contract.deployed();

  console.log("Contract address: ", contract.address);
  console.log("Contract deployed by: ", owner.address, "\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
