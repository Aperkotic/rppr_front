import { useState } from 'react'

const placeholderImage = 'https://source.unsplash.com/400x300/?hotel'

interface ImageWithFallbackProps {
  src: string
  alt: string
  className: string
}

export const ImageWithFallback = ({ src, alt, className }: ImageWithFallbackProps) => {
  const [imgSrc, setImgSrc] = useState(src)
  const handleError = () => setImgSrc(placeholderImage)
  return <img src={imgSrc} alt={alt} className={className} onError={handleError} />
}
