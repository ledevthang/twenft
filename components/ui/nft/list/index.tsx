import React, { FunctionComponent } from "react";
import { useListedNfts } from "@hooks/web3";
import NFTItem from "../item";
import { NftMeta, NftCore } from "@_types/nft";
import { useAccount } from "../../../hooks/web3/index";

const NFTList: FunctionComponent = () => {
  const { nfts } = useListedNfts();
  const { account } = useAccount();

  console.log(nfts);

  return (
    <div className="mt-12 max-w-lg mx-auto grid gap-5 lg:grid-cols-3 lg:max-w-none md:grid-cols-2 sm:gap-8">
      {nfts.data &&
        nfts.data.map((nft: { meta: NftMeta } & NftCore) => (
          <div
            key={nft.tokenId}
            className="flex flex-col rounded-lg shadow-lg overflow-hidden "
          >
            <NFTItem
              item={nft}
              buyNft={nfts.buyNft}
              isAccount={account.data ? true : false}
            />
          </div>
        ))}
    </div>
  );
};

export default NFTList;
