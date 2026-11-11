import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    // Old single-shop URL from the first version of the kit
    return [{ source: "/inventory", destination: "/t/khalid-wire/inventory", permanent: false }];
  },
};

export default nextConfig;
