import { CryptoHookFactory } from "@_types/hooks";
import { ethers } from "ethers";
import { useCallback } from "react";
import useSWR from "swr";
import { Nft } from "../../../types/nft";

import { withToast } from "../../../utils/toast";

type UseListedNftsResponse = {
  buyNft: (tokenId: number, value: number) => void;
};
type ListedNftsHookFactory = CryptoHookFactory<any, UseListedNftsResponse>;

export type UseListedNftsHook = ReturnType<ListedNftsHookFactory>;

export const hookFactory: ListedNftsHookFactory =
  ({ contract, signedContract }) =>
  () => {
    const { data, ...swr } = useSWR(
      contract ? "web3/useListedNfts" : null,
      async () => {
        const nfts = [] as Nft[];

        const coreNfts = await contract!.getAllNftsOnSale();
        for (let i = 0; i < coreNfts.length; i++) {
          const item = coreNfts[i];
          const tokenURI = await contract!.tokenURI(item.tokenId);
          const meta = await (await fetch(tokenURI, {
  mode: 'no-cors',
  headers: {
    'Access-Control-Allow-Origin':'*'
  }
})).json();
          nfts.push({
            price: parseFloat(ethers.utils.formatEther(item.price)),
            tokenId: item.tokenId.toNumber(),
            creator: item.creator,
            isListed: item.isListed,
            meta,
          });
        }

        return nfts;
      }
    );
    const _contract = signedContract;

    const buyNft = useCallback(
      async (tokenId: number, value: number) => {
        try {
          const result = await _contract?.buyNft(tokenId, {
            value: ethers.utils.parseEther(value.toString()),
          });

          return result;
        } catch (error: any) {
          let message;
          if (error.code === -32603) {
            message = error?.data?.message;
          } else {
            message = error.message;
          }
          throw new Error(message);
        }
      },
      [_contract]
    );

    return {
      ...swr,
      buyNft: (tokenId: number, value: number) =>
        withToast(buyNft(tokenId, value)),
      data: data || [],
    };
  };
