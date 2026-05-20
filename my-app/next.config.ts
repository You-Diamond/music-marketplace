import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",

        hostname: "images.unsplash.com",
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos', // Разрешаем ссылки от faker.image.url()
      },
    ],
  },
}

export default nextConfig