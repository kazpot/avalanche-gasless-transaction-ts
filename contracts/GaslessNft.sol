// SPDX-License-Identifier: UNLICENSED
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@opengsn/contracts/src/ERC2771Recipient.sol";

pragma solidity ^0.8.0;

contract GaslessNft is ERC721, ERC2771Recipient {
    uint256 public number;
    address public last;
    address immutable _trustedForwarder;

    event Minted(address indexed _from, uint256 _tokenId);

    constructor(address trustedForwarder) ERC721("GaslessNft", "GNFT") {
        _trustedForwarder = trustedForwarder;
    }

    function setNumber(uint256 newNumber) public {
        number = newNumber;
        last = _msgSender();
    }

    function mint() public returns (uint256) {
        uint256 tokenId = number;
        address msgSender = _msgSender();
        _safeMint(msgSender, tokenId);

        emit Minted(msgSender, tokenId);

        number++;
        last = _msgSender();

        return tokenId;
    }

    function getNumber() public view returns (uint256) {
        return number;
    }

    function getLast() public view returns (address) {
        return last;
    }

    function isTrustedForwarder(
        address forwarder
    ) public view override returns (bool) {
        return forwarder == _trustedForwarder;
    }

    function _msgSender()
        internal
        view
        override(Context, ERC2771Recipient)
        returns (address ret)
    {
        return ERC2771Recipient._msgSender();
    }

    function _msgData()
        internal
        view
        override(Context, ERC2771Recipient)
        returns (bytes calldata ret)
    {
        return ERC2771Recipient._msgData();
    }
}
