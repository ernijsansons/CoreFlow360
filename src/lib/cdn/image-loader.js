/**
 * CoreFlow360 - Custom CDN Image Loader
 * Next.js image optimization with CloudFront CDN
 */

export default function cloudFrontLoader({ src, width, quality }) {
  const cdnDomain = process.env.CLOUDFRONT_DOMAIN || 'localhost:3000'
  const params = new URLSearchParams()
  
  if (width) params.set('w', width.toString())
  if (quality) params.set('q', quality.toString())
  
  // Add WebP format for modern browsers
  params.set('format', 'webp')
  
  const queryString = params.toString()
  const baseUrl = `https://${cdnDomain}${src}`
  
  return queryString ? `${baseUrl}?${queryString}` : baseUrl
}