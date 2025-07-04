/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@nova/ui"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.icons8.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
}

export default nextConfig
