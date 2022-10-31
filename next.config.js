/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ["eincode.mypinata.cloud", "gateway.pinata.cloud", "ipfs.io"],
  },
};

module.exports = nextConfig;
