# avalanche-gasless-transaction-ts for gas relayer on AvaCloud

The gas relayer service is a meta-transaction relayer that adheres to the [EIP-2771 standard](https://eips.ethereum.org/EIPS/eip-2771). This implementation is based on the [Gas Station Network](https://opengsn.org/). Once your gas relayer setup in AvaCloud is complete, you will have access to the following information in the dashboard:

- Gas relayer RPC URL
- Gas relayer wallet address
- Forwarder contract address
- Domain name
- Domain version
- Request type
- Request suffix

## Copy .env.sample to create .env

```
$ cp .env.sample .env
```

## Environment Variables

```
RELAYER_URL="Gas RelayerのURL"
CHAIN_RPC_URL="RPC APIのURL"
RECIPIENT_CONTRACT_ADDRESS="実行したいコントラクトアドレス"
PRIVATE_KEY="送信元のウォレットのprivate key"
DOMAIN_NAME="AvaCloudポータルから確認できるdomain name"
SUFFIX_TYPE="bytes32"
SUFFIX_NAME="AvaCloudポータルから確認できるsuffix name"
CHAIN_ID="ブロックチェーンのチェーンID"
```

SUFIX_TYPE と SUFFIX_NAME について
Request Type Suffix が`bytes32 ABCDEFGHIJKLMNOPQRSTGSN)`の場合

```
SUFFIX_TYPE = "bytes32"
SUFFIX_NAME = "ABCDEFGHIJKLMNOPQRSTGSN"
```

## Preparation

```
$ npm install --global yarn
$ yarn install
```

## Run

```
// deploy Gasless NFT
$ yarn deploy

// call mint function of Gasless NFT
$ yarn send
```
