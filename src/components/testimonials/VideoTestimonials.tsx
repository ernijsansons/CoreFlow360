'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Play, X, Star, Building2, TrendingUp } from 'lucide-react'
import Image from 'next/image'

interface Testimonial {
  id: string
  name: string
  role: string
  company: string
  industry: string
  thumbnail: string
  videoUrl: string
  stats: {
    revenueIncrease: string
    timeSaved: string
    efficiency: string
  }
  quote: string
}

const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    role: 'CEO',
    company: 'TechFlow Solutions',
    industry: 'Software Development',
    thumbnail: '/testimonials/sarah-chen-thumb.jpg',
    videoUrl: 'https://player.vimeo.com/video/123456789',
    stats: {
      revenueIncrease: '+312%',
      timeSaved: '42 hrs/week',
      efficiency: '85% automated'
    },
    quote: "CoreFlow360 transformed how we operate. What used to take days now happens automatically."
  },
  {
    id: '2',
    name: 'Mike Rodriguez',
    role: 'Operations Director',
    company: 'CoolAir HVAC',
    industry: 'HVAC Services',
    thumbnail: '/testimonials/mike-rodriguez-thumb.jpg',
    videoUrl: 'https://player.vimeo.com/video/123456790',
    stats: {
      revenueIncrease: '+247%',
      timeSaved: '35 hrs/week',
      efficiency: '3x faster dispatch'
    },
    quote: "Our field techs love it. Scheduling that used to take hours now takes minutes."
  },
  {
    id: '3',
    name: 'Jennifer Park',
    role: 'Managing Partner',
    company: 'Park & Associates Law',
    industry: 'Legal Services',
    thumbnail: '/testimonials/jennifer-park-thumb.jpg',
    videoUrl: 'https://player.vimeo.com/video/123456791',
    stats: {
      revenueIncrease: '+189%',
      timeSaved: '28 hrs/week',
      efficiency: '90% less admin'
    },
    quote: "Finally, software that understands how law firms actually work. Game-changing."
  }
]

export function VideoTestimonials() {
  const [selectedVideo, setSelectedVideo] = useState<Testimonial | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const handlePlayVideo = (testimonial: Testimonial) => {
    setSelectedVideo(testimonial)
    setIsPlaying(true)
  }

  const handleCloseVideo = () => {
    setSelectedVideo(null)
    setIsPlaying(false)
  }

  return (
    <section className="py-20 bg-gradient-to-b from-gray-900 to-black" data-section="testimonials">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Real Results from Real Businesses
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Watch how CoreFlow360 transformed these companies into revenue machines
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700/50 hover:border-violet-500/50 transition-all group"
            >
              {/* Video Thumbnail */}
              <div className="relative aspect-video bg-gray-900 cursor-pointer" onClick={() => handlePlayVideo(testimonial)}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-20 h-20 bg-violet-600/90 rounded-full flex items-center justify-center group-hover:bg-violet-500 transition-colors"
                  >
                    <Play className="w-8 h-8 text-white ml-1" fill="white" />
                  </motion.div>
                </div>
                {/* Placeholder for thumbnail */}
                <div className="w-full h-full bg-gradient-to-br from-violet-900/20 to-cyan-900/20" />
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Person Info */}
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-white">{testimonial.name}</h3>
                  <p className="text-gray-400">{testimonial.role} at {testimonial.company}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Building2 className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-500">{testimonial.industry}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-emerald-400">{testimonial.stats.revenueIncrease}</div>
                    <div className="text-xs text-gray-500">Revenue</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-cyan-400">{testimonial.stats.timeSaved}</div>
                    <div className="text-xs text-gray-500">Time Saved</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-violet-400">{testimonial.stats.efficiency}</div>
                    <div className="text-xs text-gray-500">Efficiency</div>
                  </div>
                </div>

                {/* Quote */}
                <blockquote className="text-gray-300 italic">
                  "{testimonial.quote}"
                </blockquote>

                {/* Rating */}
                <div className="flex items-center gap-1 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-8 text-gray-400">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <span>Average +247% revenue increase</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              <span>4.9/5 from 2,847+ businesses</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Video Modal */}
      {isPlaying && selectedVideo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
          onClick={handleCloseVideo}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative max-w-4xl w-full aspect-video bg-black rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleCloseVideo}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            
            {/* Video Player */}
            <iframe
              src={`${selectedVideo.videoUrl}?autoplay=1`}
              className="w-full h-full"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          </motion.div>
        </motion.div>
      )}
    </section>
  )
}