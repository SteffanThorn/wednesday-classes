/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // Old landing page, removed; send old links and bookmarks to the classes page
      { source: '/wednesday-classes', destination: '/classes', permanent: true },
    ];
  },
};

export default nextConfig;
