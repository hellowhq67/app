import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'PedagogistsPTE',
        short_name: 'PTE AI',
        description: 'Advanced AI-Powered PTE Practice Platform',
        start_url: '/',
        display: 'standalone',
        background_color: '#0a0a0c',
        theme_color: '#6366f1',
        icons: [
            {
                src: '/icon.png',
                sizes: 'any',
                type: 'image/png',
            },
        ],
    }
}
