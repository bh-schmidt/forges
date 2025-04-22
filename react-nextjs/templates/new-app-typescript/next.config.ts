import type { NextConfig } from "next";

const nextConfig: NextConfig = {
{%- if template == "electron" %}
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  }
{%- endif %}
};

export default nextConfig;