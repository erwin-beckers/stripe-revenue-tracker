/** @type {import('next').NextConfig} */
const nextConfig = {
  // typedRoutes disabled: the factory composes dynamic paths (next=/foo, slugs from spec, etc.)
  // so strict string-literal route types cause friction without real safety.
};

export default nextConfig;
