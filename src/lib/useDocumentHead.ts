import { useEffect } from 'react'

interface DocumentHeadProps {
    title?: string
    description?: string
    keywords?: string
    ogTitle?: string
    ogDescription?: string
    ogImage?: string
    ogUrl?: string
    canonical?: string
    noindex?: boolean
}

export function useDocumentHead({
    title,
    description,
    keywords,
    ogTitle,
    ogDescription,
    ogImage,
    ogUrl,
    canonical,
    noindex = false
}: DocumentHeadProps) {
    useEffect(() => {
        // Update title
        if (title) {
            document.title = title
        }

        // Update meta tags
        const updateMetaTag = (name: string, content: string) => {
            let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement
            if (!meta) {
                meta = document.createElement('meta')
                meta.name = name
                document.head.appendChild(meta)
            }
            meta.content = content
        }

        const updatePropertyTag = (property: string, content: string) => {
            let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement
            if (!meta) {
                meta = document.createElement('meta')
                meta.setAttribute('property', property)
                document.head.appendChild(meta)
            }
            meta.content = content
        }

        // Update description
        if (description) {
            updateMetaTag('description', description)
        }

        // Update keywords
        if (keywords) {
            updateMetaTag('keywords', keywords)
        }

        // Update Open Graph tags
        if (ogTitle) {
            updatePropertyTag('og:title', ogTitle)
        } else if (title) {
            updatePropertyTag('og:title', title)
        }

        if (ogDescription) {
            updatePropertyTag('og:description', ogDescription)
        } else if (description) {
            updatePropertyTag('og:description', description)
        }

        if (ogImage) {
            updatePropertyTag('og:image', ogImage)
        }

        if (ogUrl) {
            updatePropertyTag('og:url', ogUrl)
        }

        // Update canonical URL
        if (canonical) {
            let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement
            if (!link) {
                link = document.createElement('link')
                link.rel = 'canonical'
                document.head.appendChild(link)
            }
            link.href = canonical
        }

        // Handle noindex
        if (noindex) {
            updateMetaTag('robots', 'noindex, nofollow')
        }

        // Cleanup function to restore original title if needed
        return () => {
            // You could store the original title and restore it here if needed
        }
    }, [title, description, keywords, ogTitle, ogDescription, ogImage, ogUrl, canonical, noindex])
}

// Component wrapper for easier use
export function DocumentHead(props: DocumentHeadProps) {
    useDocumentHead(props)
    return null
} 