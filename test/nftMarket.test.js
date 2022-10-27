const NFTMarket = artifacts.require("NFTMarket");
const { ethers } = require("ethers");
const truffleAssert = require("truffle-assertions");
contract("NFTMarket", (accounts) => {
  let contract = null;
  let nftPrice = ethers.utils.parseEther("0.3").toString();
  let listingPrice = ethers.utils.parseEther("0.025").toString();

  before(async () => {
    contract = await NFTMarket.deployed();
    console.log(accounts);
  });

  describe("Mint token", () => {
    const tokenURI = "https://test.com";
    before(async () => {
      await contract.mintToken(tokenURI, nftPrice, {
        from: accounts[0],
        value: listingPrice,
      });
    });

    it("owner of first token should be address[0]", async () => {
      const owner = await contract.ownerOf(1);
      assert(owner == accounts[0], "Owner of token is not matching address");
    });

    it("first token should point to the correct tokenURI", async () => {
      const actualTokenURI = await contract.tokenURI(1);
      assert(actualTokenURI === tokenURI, "tokenURI is not correctly");
    });

    it("should not be possible to create a NFT width used tokenURI", async () => {
      await truffleAssert.fails(
        contract.mintToken(tokenURI, nftPrice, {
          from: accounts[0],
          value: listingPrice,
        }),
        truffleAssert.ErrorType.REVERT,
        "Token URI already exists"
      );
    });

    it("should have one listed item", async () => {
      const listedItem = await contract.listedItemsCount();
      assert.equal(listedItem, 1, "Listed items count is not 1");
    });

    it("should have create NFT item", async () => {
      const nftItem = await contract.getNftItem(1);
      assert.equal(nftItem.tokenId, 1, "Token id is not 1");
      assert.equal(nftItem.price, nftPrice, "Nft price is not correct");
      assert.equal(nftItem.creator, accounts[0], "Creator is not accounts[0]");
      assert.equal(nftItem.isListed, true, "Listed is not true");
    });
  });

  describe("Buy NFT", async () => {
    before(async () => {
      await contract.buyNft(1, {
        from: accounts[1],
        value: nftPrice,
      });
    });

    it("should unlist the item", async () => {
      const nftItem = await contract.getNftItem(1);
      assert.equal(nftItem.isListed, false, "Item is still listed");
    });
    it("should decrease listed items count", async () => {
      const itemCount = await contract.listedItemsCount();
      assert.equal(itemCount, 0, "Item count is not");
    });
    it("should change the owner of item", async () => {
      const owner = await contract.ownerOf(1);
      assert.equal(owner, accounts[1], "Owner of item is not change");
    });
  });

  describe("Token transfer", async () => {
    const tokenURI = "https://test-json-2.com";
    before(async () => {
      await contract.mintToken(tokenURI, nftPrice, {
        from: accounts[0],
        value: listingPrice,
      });
    });

    it("should have two NFTs created", async () => {
      const total = await contract.totalSupply();
      assert.equal(total, 2, "Total supply of token incorrect");
    });

    it("should be able to retrieve nft by index", async () => {
      const nftId1 = await contract.tokenByIndex(0);
      const nftId2 = await contract.tokenByIndex(1);

      assert.equal(nftId1, 1, "Total supply of token incorrect");
      assert.equal(nftId2, 2, "Total supply of token incorrect");
    });

    it("should have one listed NFT", async () => {
      const allNFTs = await contract.getAllNftsOnSale();
      assert.equal(allNFTs[0].tokenId, 2, "NFT has a wrong id");
    });

    it("account[1] should have one owned NFT", async () => {
      const ownedNFTs = await contract.getOwnedNfts({ from: accounts[1] });

      assert.equal(ownedNFTs[0].tokenId, 1, "NFT has a wrong id");
    });
  });

  describe("Token transfer to new owner", () => {
    before(async () => {
      await contract.transferFrom(accounts[0], accounts[1], 2);

      it("accounts[0] should own 0 token", async () => {
        const ownedNFTs = await contract.getOwnedNfts({ from: accounts[0] });

        assert.equal(ownedNFTs.length, 0, "Invalid length token");
      });

      it("accounts[1] should own 2 token", async () => {
        const ownedNFTs = await contract.getOwnedNfts({ from: accounts[1] });

        assert.equal(ownedNFTs.length, 2, "Invalid length token");
      });
    });
  });

  describe("Burn Token", () => {
    const tokenURI = "https://test-1.com";
    before(async () => {
      await contract.mintToken(tokenURI, nftPrice, {
        from: accounts[2],
        value: listingPrice,
      });
    });

    it("accounts[2] should have one owned NFT", async () => {
      const ownedNFTs = await contract.getOwnedNfts({ from: accounts[2] });
      assert.equal(ownedNFTs[0].tokenId, 3, "Nft has a wrong id");
    });

    it("accounts[2] should have owned 0 NFT", async () => {
      await contract.burnToken(3, { from: accounts[2] });
      const ownedNFTs = await contract.getOwnedNfts({ from: accounts[2] });
      assert.equal(ownedNFTs.length, 0, "Nft has a wrong id");
    });
  });

  describe("List an Nft", () => {
    before(async () => {
      await contract.placeNftOnSale(1, nftPrice, {
        from: accounts[1],
        value: listingPrice,
      });
    });
    it("should have two listed items", async () => {
      const allNFTsOnSale = await contract.getAllNftsOnSale();
      const listedItems = allNFTsOnSale.filter((item) => item.isListed);
      assert.equal(listedItems.length, 2, "Invalid length token on sales");
    });

    it("should set new listing price", async () => {
      await contract.setListingPrice(listingPrice, { from: accounts[0] });

      const listPrice = await contract.listingPrice();

      assert.equal(listPrice.toString(), listingPrice, "Invalid listing price");
    });
  });
});
