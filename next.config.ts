import type { NextConfig } from "next";

const getStorageRemotePattern = () => {
  const rawUrl =
    process.env.S3_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_S3_BASE_URL ||
    process.env.AWS_ENDPOINT_URL_S3;

  if (!rawUrl) return [];

  try {
    const parsed = new URL(rawUrl);
    return [
      {
        protocol: parsed.protocol.replace(":", "") as "http" | "https",
        hostname: parsed.hostname,
        port: parsed.port || undefined,
        pathname: "/**",
      },
    ];
  } catch (_e) {
    return [];
  }
};

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: getStorageRemotePattern(),
  },
  async redirects() {
    return [
      {
        source: "/forms/new",
        destination: "/faculty-admin/forms/new",
        permanent: false,
      },
      {
        source: "/forms/:id/responses",
        destination: "/faculty-admin/forms/:id/responses",
        permanent: false,
      },
      {
        source: "/forms",
        destination: "/faculty-admin/forms",
        permanent: false,
      },
      {
        source: "/surveys/:id",
        destination: "/student/surveys/:id",
        permanent: false,
      },
      {
        source: "/surveys",
        destination: "/student/surveys",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
