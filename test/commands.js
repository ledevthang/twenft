const instance = await NFTMarket.deployed();

instance.mintToken(
  "https://gateway.pinata.cloud/ipfs/Qmb4aom5xNRE5CBRHZsxCsYSdcmX8zfHXgM7ovZxLp3CqL",
  "500000000000000000",
  { value: "25000000000000000", from: accounts[0] }
);

instance.mintToken(
  "https://gateway.pinata.cloud/ipfs/QmWwMtiPU534bJ8jr9Jjf1EjtSknt1aJm2XYVoUDJTh4H7",
  "500000000000000000",
  { value: "25000000000000000", from: accounts[0] }
);
