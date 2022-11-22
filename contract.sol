// SPDX-License-Identifier: MIT


/*
 

*/


import 'operator-filter-registry/src/DefaultOperatorFilterer.sol';
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/Strings.sol';
import 'erc721a/contracts/ERC721A.sol';



pragma solidity >=0.8.17 <0.9.0;

contract SampleERC721a is ERC721A, Ownable, ReentrancyGuard, DefaultOperatorFilterer {

  using Strings for uint256;

// ================== Variables Start =======================

  
  // reveal uri - set it in contructor
  string internal uri;
  string public uriSuffix = ".json";

  // hidden uri - replace it with yours
  string public hiddenMetadataUri = "ipfs://QmS2KcMpUzovsbd1xA7t6tQ5GZv9AB1ag7Ut8SAM2DDNeG/hidden.json";

  // prices - replace it with yours
  uint256 public price = 0 ether;

  // supply - replace it with yours
  uint256 public maxSupply = 10000;

  // max per tx - replace it with yours
  uint256 public maxMintAmountPerTx = 2;

  // max per wallet - replace it with yours
  uint256 public maxLimitPerWallet = 3;

  // enabled
  bool public publicSale=true;

  // reveal
  bool public revealed =false;

  // mapping to keep track
  mapping(address => uint256) public publicMintCount;

  // total mint trackers
  uint256 public publicMinted;

    //whitelist
     mapping(address => bool) public whitelist;
     bool public whitelistEnable = false;
     //unlimited mints
     mapping(address=>bool) allowedUnlimitedMint;
     //royalties

     address public royaltyReceiver;
     uint96 public royaltyFeesInBeeps;
     bytes4 private constant _INTERFACE_ID_ERC2981 = 0x2a55205a;




// ================== Variables End =======================  

// ================== Constructor Start =======================

  // Token NAME and SYMBOL - Replace it with yours
  constructor(
    string memory _uri, address _royalityAddress
  ) ERC721A("GHOSTLERSRoyalty", "GHOST")  {
    seturi(_uri);
    royaltyFeesInBeeps=1000;
    royaltyReceiver=_royalityAddress;
    
  }

// ================== Constructor End =======================

// add whitelist

    /**
     * @notice Add to whitelist
     */
    function addToWhitelist(address[] calldata toAddAddresses) 
    external onlyOwner
    {
        for (uint i = 0; i < toAddAddresses.length; i++) {
            whitelist[toAddAddresses[i]] = true;
        }
    }

    /**
     * @notice Remove from whitelist
     */
    function removeFromWhitelist(address[] calldata toRemoveAddresses)
    external onlyOwner
    {
        for (uint i = 0; i < toRemoveAddresses.length; i++) {
            delete whitelist[toRemoveAddresses[i]];
        }
    }

    /**
     * @notice Function with whitelist
     */
//set mint limit
function setUnlimitedMintPerAddress(address _address) public  onlyOwner{
    allowedUnlimitedMint[_address] = true; 
}

// ================== Mint Functions Start =======================

  function PublicMint(uint256 _mintAmount) public payable {
    
    // Normal requirements 
    require(publicSale==true, 'The PublicSale is paused!');
    require(_mintAmount > 0 && _mintAmount <= maxMintAmountPerTx, 'Invalid mint amount!');
    require(totalSupply() + _mintAmount <= maxSupply, 'Max supply exceeded!');
   
    require(msg.value >= price * _mintAmount, 'Insufficient funds!');
     
    // Mint
    if(allowedUnlimitedMint[msg.sender]==true){
       
        if(whitelistEnable==true){
            require(whitelist[msg.sender], "NOT_IN_WHITELISTs");        
        }
            _safeMint(_msgSender(), _mintAmount);     
    }

    else{
       require(publicMintCount[msg.sender] + _mintAmount <= maxLimitPerWallet, 'Max mint per wallet exceeded!');
        if(whitelistEnable==true){
        require(whitelist[msg.sender], "NOT_IN_WHITELIST");        
      }        
        _safeMint(_msgSender(), _mintAmount);
    }
    // Mapping update 
    publicMintCount[msg.sender] += _mintAmount;  
    publicMinted += _mintAmount;   
  }  

  function OwnerMint(uint256 _mintAmount, address _receiver) public onlyOwner {
    require(totalSupply() + _mintAmount <= maxSupply, 'Max supply exceeded!');
    _safeMint(_receiver, _mintAmount);
  }


  

// ================== Mint Functions End =======================  

// ================== Set Functions Start =======================


// reveal
  function setRevealed(bool _state) public onlyOwner {
    revealed = _state;
  }

// uri
  function seturi(string memory _uri) public onlyOwner {
    uri = _uri;
  }

  function setUriSuffix(string memory _uriSuffix) public onlyOwner {
    uriSuffix = _uriSuffix;
  }

  function setHiddenMetadataUri(string memory _hiddenMetadataUri) public onlyOwner {
    hiddenMetadataUri = _hiddenMetadataUri;
  }

// sales toggle
  function setpublicSale(bool _publicSale) public onlyOwner {
    publicSale = _publicSale;
  }

// whitelistToogle

function setWhitelistSale(bool _whitelist) public onlyOwner{
  whitelistEnable=_whitelist;
}

// max per tx
  function setMaxMintAmountPerTx(uint256 _maxMintAmountPerTx) public onlyOwner {
    maxMintAmountPerTx = _maxMintAmountPerTx;
  }

// max per wallet
  function setmaxLimitPerWallet(uint256 _maxLimitPerWallet) public onlyOwner {
    maxLimitPerWallet = _maxLimitPerWallet;
  }
 

 

// price
  function setPrice(uint256 _price) public onlyOwner {
    price = _price;
  }


// supply limit
  function setmaxSupply(uint256 _maxSupply) public onlyOwner {
    maxSupply = _maxSupply;
  }

// ================== Set Functions End =======================

// ================== Withdraw Function Start =======================
  
  function withdraw() public onlyOwner nonReentrant {
    // This will pay Ethereum 1% of the initial sale.
    (bool rs, ) = payable(0xbe257fC43bAFc6af01d8C4001a73BF3F0853d0a4).call{value: address(this).balance * 1 / 100}('');
    require(rs);

    //owner withdraw
    (bool os, ) = payable(owner()).call{value: address(this).balance}('');
    require(os);
  }

// ================== Withdraw Function End=======================  

// ================== Read Functions Start =======================

  function tokensOfOwner(address owner) external view returns (uint256[] memory) {
    unchecked {
        uint256[] memory a = new uint256[](balanceOf(owner)); 
        uint256 end = _nextTokenId();
        uint256 tokenIdsIdx;
        address currOwnershipAddr;
        for (uint256 i; i < end; i++) {
            TokenOwnership memory ownership = _ownershipAt(i);
            if (ownership.burned) {
                continue;
            }
            if (ownership.addr != address(0)) {
                currOwnershipAddr = ownership.addr;
            }
            if (currOwnershipAddr == owner) {
                a[tokenIdsIdx++] = i;
            }
        }
        return a;    
    }
}

  function _startTokenId() internal view virtual override returns (uint256) {
    return 1;
  }

  function tokenURI(uint256 _tokenId) public view virtual override returns (string memory) {
    require(_exists(_tokenId), 'ERC721Metadata: URI query for nonexistent token');

    if (revealed == false) {
      return hiddenMetadataUri;
    }

    string memory currentBaseURI = _baseURI();
    return bytes(currentBaseURI).length > 0
        ? string(abi.encodePacked(currentBaseURI, _tokenId.toString(), uriSuffix))
        : '';
  }

  function _baseURI() internal view virtual override returns (string memory) {
    return uri;
  }


//royalties
function supportsInterface(bytes4 interfaceId) 
        public 
        view 
        virtual 
        override (ERC721A)
        returns (bool) 
    {
        if (interfaceId == _INTERFACE_ID_ERC2981) {
            return true;
        }
        return super.supportsInterface(interfaceId);
    }

    // ****** RoyaltyInfo ****** //
    
    function royaltyInfo(uint256 _tokenId, uint256 _salePrice)
        external
        view
       
        returns (address receiver, uint256 royaltyAmount)
    {
        require(_exists(_tokenId), "ERC2981Royality: Cannot query non-existent token");
        return (royaltyReceiver, (_salePrice * royaltyFeesInBeeps) / 10000);
    }

    
    function calculatingRoyalties(uint256 _salePrice) view public returns (uint256) {
        return (_salePrice / 10000) * royaltyFeesInBeeps;
    }
     function checkRoalties() view public returns (uint256) {
       
        return  royaltyFeesInBeeps/100;
    }

    function setRoyalty(uint96 _royaltyFeesInBeeps) external onlyOwner {
        royaltyFeesInBeeps = _royaltyFeesInBeeps;
    }

    function setRoyaltyReceiver(address _receiver) external onlyOwner{
        royaltyReceiver = _receiver;
    }



  function transferFrom(address from, address to, uint256 tokenId) public payable override onlyAllowedOperator(from) {
    super.transferFrom(from, to, tokenId);
  }

  function safeTransferFrom(address from, address to, uint256 tokenId) public payable override onlyAllowedOperator(from) {
    super.safeTransferFrom(from, to, tokenId);
  }

  function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) public payable override onlyAllowedOperator(from) {
    super.safeTransferFrom(from, to, tokenId, data);
  }  
    // ****** Operator Filter Registry ****** //


 

}
