/** @type {import('next').NextConfig} */
const nextConfig = {
    images:{
        domains: ['images.unsplash.com','as2.ftcdn.net','as1.ftcdn.net','plus.unsplash.com','utfs.io','res.cloudinary.com','example.com','cdn.pixabay.com']
    },
    eslint: {
        // Allow builds to complete even if there are ESLint errors
        ignoreDuringBuilds: true,
    },
};

export default nextConfig;
