import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
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
