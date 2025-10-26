import { useEffect, useState } from 'react'

export default function Media({ src, alt, className = '' }: { src: string; alt: string; className?: string }) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => { setLoaded(false); setError(false) }, [src])

  return (
    <div className={`image-wrap ${className}`}>
      {!loaded && <div className="image-ph" />}
      {!error && (
        <img
          src={src}
          alt={alt}
          className={`img-progressive ${loaded ? 'is-loaded' : ''}`}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          loading="eager"
          decoding="async"
        />
      )}
      {error && <div className="image-fallback">No image</div>}
    </div>
  )
}