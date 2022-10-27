import { withIronSessionApiRoute, withIronSessionSsr } from "iron-session/next";
import type { NextApiRequest, NextApiResponse } from "next";
import contract from "../../public/contracts/NFTMarket.json";
import { NftMarketContract } from "@_types/nftMarketContract";
import * as util from "ethereumjs-util";
import { ethers } from "ethers";

const NETWORKS = {
  "5777": "Ganache",
  "97": "Smart Chain Test",
};

type NETWORK = typeof NETWORKS;

const targetNetwork = process.env.NEXT_PUBLIC_NETWORK_ID as keyof NETWORK;

export const contractAddress = contract["networks"][targetNetwork]["address"];

export const pinataApiKey = process.env.PINATA_API_KEY as string;
export const pinataSecretApiKey = process.env.PINATA_SECRET_API_KEY as string;

const abi = contract.abi;
const password = process.env.SECRET_COOKIE_PASSWORD!.toString() as string;

export function withSession(handle: any) {
  return withIronSessionApiRoute(handle, {
    password: password,
    cookieName: "nft-auth-session",
    cookieOptions: {
      secure: process.env.NODE_ENV === "production" ? true : false,
    },
  });
}

const url =
  process.env.NODE_ENV === "production"
    ? process.env.SMART_CHAIN_TEST
    : "https://127.0.0.1:7545";

export function addressCheckMiddleware(
  req: NextApiRequest & { session: any },
  res: NextApiResponse
) {
  return new Promise((resolve, reject) => {
    const message = req.session.messageSession;
    const provider = new ethers.providers.JsonRpcProvider(url);
    const contract = new ethers.Contract(
      contractAddress,
      abi,
      provider
    ) as unknown as NftMarketContract;

    let nonce: string | Buffer =
      "\x19Ethereum Signed Message:\n" +
      JSON.stringify(message).length +
      JSON.stringify(message);

    nonce = util.keccak(Buffer.from(nonce, "utf-8"));
    const { v, r, s } = util.fromRpcSig(req.body.signature);
    const pubKey = util.ecrecover(util.toBuffer(nonce), v, r, s);
    const addrBuffer = util.pubToAddress(pubKey);
    const address = util.bufferToHex(addrBuffer);

    if (address === req.body.address) {
      resolve("Correct Message");
    } else {
      reject("Wrong Message");
    }
  });
}
