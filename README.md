# avalanche-gasless-transaction-ts for gas relayer on AvaCloud

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
