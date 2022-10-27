import { ethers } from "ethers";
import { MetaMaskInpageProvider } from "@metamask/providers";
import { NftMarketContract } from "../../../types/nftMarketContract";

import React, {
  createContext,
  FunctionComponent,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  Web3State,
  createDefaultState,
  Web3Type,
  loadContract,
  createWeb3State,
} from "./utils";

function pageReload() {
  window.location.reload();
}

const Web3Context = createContext<Web3State>(createDefaultState());

const Web3Provider: FunctionComponent<Web3Type> = ({ children }) => {
  const [web3Api, setWeb3Api] = useState<Web3State>(createDefaultState());

  useEffect(() => {
    async function initWeb3() {
      try {
        const provider = new ethers.providers.Web3Provider(
          window.ethereum as any
        );

        const contract = await loadContract("NFTMarket", provider);
        const signer = provider!.getSigner();
        const signedContract = contract.connect(
          signer
        ) as unknown as NftMarketContract;
        setGlobalListeners(window.ethereum);

        setWeb3Api(
          createWeb3State({
            ethereum: window.ethereum,
            provider,
            contract,
            signedContract,
            isLoading: false,
          })
        );
      } catch (error: any) {
        console.log(error?.message);
        setWeb3Api((api) =>
          createWeb3State({ ...(api as any), isLoading: false })
        );
      }
    }

    initWeb3();
    return () => removeGlobalListeners(window.ethereum);
  }, []);

  const setGlobalListeners = (ethereum: MetaMaskInpageProvider) => {
    ethereum?.on("chainChanged", pageReload);
  };

  const removeGlobalListeners = (ethereum: MetaMaskInpageProvider) => {
    ethereum?.removeListener("chainChanged", pageReload);
  };

  return (
    <Web3Context.Provider value={web3Api}>{children}</Web3Context.Provider>
  );
};

export function useWeb3() {
  return useContext(Web3Context);
}

export function useHooks() {
  const { hooks } = useWeb3();
  return hooks;
}

export default Web3Provider;
