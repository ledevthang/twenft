import { CryptoHookFactory } from "@_types/hooks";
import { ethers } from "ethers";
import { useCallback } from "react";
import useSWR from "swr";
import { Nft } from "../../../types/nft";

import { withToast } from "../../../utils/toast";

type UseOwnedNftsResponse = {
  listNft: (tokenId: number, price: number) => void;
};
type OwnedNftsHookFactory = CryptoHookFactory<Nft[], UseOwnedNftsResponse>;

export type UseOwnedNftsHook = ReturnType<OwnedNftsHookFactory>;

export const hookFactory: OwnedNftsHookFactory =
  ({ signedContract }) =>
  () => {
    const { data, ...swr } = useSWR(
      signedContract ? "web3/useOwnedNfts" : null,
      async () => {
        const nfts = [] as Nft[];
        const coreNfts = await signedContract!.getOwnedNfts();
        for (let i = 0; i < coreNfts.length; i++) {
          const item = coreNfts[i];
          const tokenURI = await signedContract!.tokenURI(item.tokenId);
          const meta = await (await fetch(tokenURI)).json();
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
    const listNft = useCallback(
      async (tokenId: number, price: number) => {
        try {
          const result = await _contract?.placeNftOnSale(
            tokenId,
            ethers.utils.parseEther(price.toString()),
            {
              value: ethers.utils.parseEther((0.025).toString()),
            }
          );

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
      listNft: (tokenId: number, price: number) =>
        withToast(listNft(tokenId, price)),
      data: data || [],
    };
  };
