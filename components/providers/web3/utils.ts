import { ReactNode } from "react";
import { MetaMaskInpageProvider } from "@metamask/providers";
import { ethers, providers } from "ethers";
import { setupHooks, Web3Hook } from "@hooks/web3/setupHooks";
import { Web3Dependencies } from "@_types/hooks";
import { NftMarketContract } from "../../../types/nftMarketContract";

declare global {
  interface Window {
    ethereum: MetaMaskInpageProvider;
  }
}

export type Web3Type = {
  children: ReactNode;
};

type Nullable<T> = {
  [P in keyof T]: T[P] | null;
};

export type Web3State = {
  isLoading: boolean;
  hooks: Web3Hook;
} & Nullable<Web3Dependencies>;
export const createDefaultState = () => {
  return {
    ethereum: null,
    provider: null,
    contract: null,
    signedContract: null,
    isLoading: true,
    hooks: setupHooks({ isLoading: true } as any),
  };
};

export const createWeb3State = ({
  ethereum,
  provider,
  contract,
  signedContract,
  isLoading,
}: Web3Dependencies) => {
  return {
    ethereum,
    provider,
    contract,
    isLoading,
    signedContract,
    hooks: setupHooks({
      ethereum,
      provider,
      contract,
      signedContract,
      isLoading,
    }),
  };
};

const NETWORK_ID = process.env.NEXT_PUBLIC_NETWORK_ID;

export const loadContract = async (
  name: string,
  provider: providers.Web3Provider
): Promise<NftMarketContract> => {
  if (!NETWORK_ID) return Promise.reject("Network ID is not defined!");

  const res = await fetch(`/contracts/${name}.json`);

  const Artifact = await res.json();

  if (Artifact.networks[NETWORK_ID].address) {
    const contract = new ethers.Contract(
      Artifact.networks[NETWORK_ID].address,
      Artifact.abi,
      provider
    );

    return contract as unknown as NftMarketContract;
  } else {
    return Promise.reject(`Contract: [${name}] cannot be loaded!`);
  }
};
