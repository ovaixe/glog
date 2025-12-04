import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {}, // Empty config to silence Turbopack warning
};

export default withPWA({
  dest: "public",
  register: true,
})(nextConfig);
