import {
  addressCheckMiddleware,
  pinataApiKey,
  pinataSecretApiKey,
  withSession,
} from "./utils";
import FormData from "form-data";
import { NextApiRequest, NextApiResponse } from "next";
import { FileReq } from "@_types/nft";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";

const infuraId = process.env.NEXT_PUBLIC_INFURA_ID;
const infuraSecretKey = process.env.NEXT_PUBLIC_INFURA_SECRET_KEY;

const auth =
  "Basic " + Buffer.from(infuraId + ":" + infuraSecretKey).toString("base64");

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

export default withSession(
  async (req: NextApiRequest & { session: any }, res: NextApiResponse) => {
    if (req.method === "POST") {
      const { bytes, fileName, contentType, file } = req.body as FileReq;
      if (!bytes || !fileName || !contentType) {
        return res.status(422).send({ message: "Image data are missing" });
      }

      await addressCheckMiddleware(req, res);

      const buffer = Buffer.from(Object.values(bytes));
      const formData = new FormData();
      formData.append("file", buffer, {
        contentType,
        filename: fileName + "-" + uuidv4(),
      });

      const fileRes = await axios.post(
        "https://ipfs.infura.io:5001/api/v0/add",
        formData,
        {
          maxBodyLength: Infinity,
          headers: {
            "content-type": `multipart/form-data; boundary=${formData.getBoundary()}`,
            Authorization: auth,
          },
        }
      );

      // const fileRes = await axios.post(
      //   "https://api.pinata.cloud/pinning/pinFileToIPFS",
      //   formData,
      //   {
      //     maxBodyLength: Infinity,
      //     headers: {
      //       "content-type": `multipart/form-data; boundary=${formData.getBoundary()} `,
      //       pinata_api_key: pinataApiKey,
      //       pinata_secret_api_key: pinataSecretApiKey,
      //     },
      //   }
      // );

      return res.status(200).send(fileRes.data);
    } else {
      return res.status(422).send({ message: "Cannot create JSON " });
    }
  }
);
