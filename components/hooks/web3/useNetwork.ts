import { CryptoHookFactory } from "@_types/hooks";
import useSWR from "swr";

const NETWORKS: { [k: string]: string } = {
  1: "Ethereum Main Network",
  3: "Ropsten Test Network",
  4: "Rinkeby Test Network",
  5: "Goerli Test Network",
  42: "Kovan Test Network",
  56: "Binance Smart Chain",
  97: "Binance Smart Chain Test Network",
  1337: "Ganache",
};

type UseNetworkResponse = {
  isLoading: boolean;
  isSupported: boolean;
  targetNetwork: string;
  isConnectedToNetwork: boolean;
  switchToCorrectChain: () => Promise<void>;
};

const targetId = process.env.NEXT_PUBLIC_TARGET_CHAIN_ID as string;
const targetRpc = process.env.NEXT_PUBLIC_TARGET_CHAIN_RPC as string;
const targetNetwork = NETWORKS[targetId];

type NetworkHookFactory = CryptoHookFactory<string, UseNetworkResponse>;

export type UseNetworkHook = ReturnType<NetworkHookFactory>;

export const hookFactory: NetworkHookFactory =
  ({ provider, isLoading, ethereum }) =>
  () => {
    const { data, isValidating, ...rest } = useSWR(
      provider ? "web3/useNetwork" : null,
      async () => {
        const chainId = (await provider!.getNetwork()).chainId;

        if (!chainId) {
          throw "Cannot retrieve network. Please, refresh your browser or connect to other network ";
        }
        return NETWORKS[chainId];
      },
      {
        revalidateOnFocus: false,
      }
    );

    const isSupported = data === targetNetwork;
    const hexString = (+targetId).toString(16);
    const switchToCorrectChain = async () => {
      try {
        console.log(hexString);
        await ethereum?.request({
          method: "wallet_switchEthereumChain",
          // chainId must be in hexadecimal numbers
          params: [{ chainId: `0x${hexString}` }],
        });
      } catch (error: any) {
        // This error code indicates that the chain has not been added to MetaMask
        // if it is not, then install it into the user MetaMask
        if (error.code === 4902) {
          try {
            await ethereum?.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: `${hexString}`,
                  rpcUrl: targetRpc,
                },
              ],
            });
          } catch (addError) {
            console.error(addError);
          }
        } else {
          console.error(error);
        }
      }
    };

    return {
      ...rest,
      data,
      isValidating,
      targetNetwork,
      isSupported,
      isConnectedToNetwork: !isLoading && isSupported,
      isLoading: isLoading as boolean,
      switchToCorrectChain,
    };
  };
