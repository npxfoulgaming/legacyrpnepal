import { useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, ScrollTrigger, createBatchScrollTrigger } from '../../lib/gsap-config'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import siteConfig from '../../config/site.config.json'
import { getAssetUrl } from '../../utils/assetUrl'

// Gallery images from config
const galleryImages = siteConfig.gallery.images

export const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null)
  const containerRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    // Title animation
    gsap.from(titleRef.current, {
      y: 50,
      opacity: 0,
      duration: 1,
      scrollTrigger: {
        trigger: titleRef.current,
        start: 'top 80%',
        toggleActions: 'play none none reverse'
      }
    })

    // Use batch animation for better performance
    createBatchScrollTrigger(
      '.gallery-item',
      {
        scale: 1,
        opacity: 1,
        duration: 0.6,
        stagger: 0.05,
        ease: 'power2.out'
      },
      {
        start: 'top 90%',
        toggleActions: 'play none none reverse'
      }
    )
    
    // Initial state for batch animation
    gsap.set('.gallery-item', { scale: 0, opacity: 0 })
    
    // Setup hover effects
    const items = gsap.utils.toArray('.gallery-item') as Element[]
    items.forEach((item) => {

      const overlay = item.querySelector('.gallery-overlay')
      if (overlay) {
        item.addEventListener('mouseenter', () => {
          gsap.to(overlay, {
            opacity: 1,
            duration: 0.3
          })
          gsap.to(item, {
            scale: 1.05,
            duration: 0.3,
            ease: 'power2.out'
          })
        })

        item.addEventListener('mouseleave', () => {
          gsap.to(overlay, {
            opacity: 0,
            duration: 0.3
          })
          gsap.to(item, {
            scale: 1,
            duration: 0.3,
            ease: 'power2.out'
          })
        })
      }
    })

    // Cleanup function
    return () => {
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.trigger && containerRef.current?.contains(trigger.trigger as Element)) {
          trigger.kill()
        }
      })
    }
  }, { scope: containerRef })

  const handlePrevious = () => {
    if (selectedImage === null) return
    const prevIndex = selectedImage === 0 ? galleryImages.length - 1 : selectedImage - 1
    setSelectedImage(prevIndex)
  }

  const handleNext = () => {
    if (selectedImage === null) return
    const nextIndex = selectedImage === galleryImages.length - 1 ? 0 : selectedImage + 1
    setSelectedImage(nextIndex)
  }

  return (
    <>
      <section ref={containerRef} id="gallery" className="relative py-20 overflow-hidden">
        <div className="section-container">
          {/* Section Title */}
          <div className="text-center mb-12">
            <h2 
              ref={titleRef}
              className="text-4xl md:text-6xl font-gaming font-bold mb-4"
            >
              <span className="gradient-text">Gallery</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Capture the best moments from our server
            </p>
          </div>

          {/* Gallery Grid */}
          <div ref={gridRef} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {galleryImages.map((image, index) => (
              <div
                key={image.id}
                className="gallery-item relative aspect-video cursor-pointer overflow-hidden rounded-lg group"
                onClick={() => setSelectedImage(index)}
              >
                {/* Image */}
                <img 
                  src={getAssetUrl(image.src)} 
                  alt={image.alt}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                
                {/* Overlay */}
                <div className="gallery-overlay absolute inset-0 bg-gradient-to-t from-gta-black/90 via-transparent to-transparent opacity-0 transition-opacity flex items-end p-4">
                  <div>
                    <h3 className="text-lg font-bebas text-white">{image.title}</h3>
                    <p className="text-sm text-gta-light">
                      {image.alt}
                    </p>
                  </div>
                </div>

                {/* Border effect */}
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-gta-gold/50 rounded-lg transition-all duration-300" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {selectedImage !== null && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={(e) => {
              e.stopPropagation()
              handlePrevious()
            }}
            className="absolute left-4 p-2 text-white/70 hover:text-neon-cyan transition-colors"
          >
            <ChevronLeft size={32} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation()
              handleNext()
            }}
            className="absolute right-4 p-2 text-white/70 hover:text-neon-cyan transition-colors"
          >
            <ChevronRight size={32} />
          </button>

          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-neon-cyan transition-colors"
          >
            <X size={24} />
          </button>

          <div 
            className="max-w-5xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={getAssetUrl(galleryImages[selectedImage].src)}
              alt={galleryImages[selectedImage].alt}
              className="w-full h-auto rounded-lg"
            />
            <div className="mt-4 text-center">
              <h3 className="text-2xl font-bebas text-white mb-2">
                {galleryImages[selectedImage].title}
              </h3>
              <p className="text-gta-light">
                {galleryImages[selectedImage].alt}
              </p>
              <p className="text-gta-gold mt-2">
                {selectedImage + 1} / {galleryImages.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}