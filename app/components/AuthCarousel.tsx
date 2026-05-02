'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Zap, Target, FileText, Trophy } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface CarouselSlide {
  icon: React.ReactNode;
  image: string;
  title: string;
  description: string;
  highlight: string;
}

export function AuthCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  const slides: CarouselSlide[] = [
    {
      icon: <Zap className="w-12 h-12" />,
      image: '/images/hero/hero-1.jpg',
      title: 'Quick Apply',
      description: 'Apply to internships with just one click. Save your time and focus on finding the perfect opportunity.',
      highlight: 'Streamline Your Job Search',
    },
    {
      icon: <Target className="w-12 h-12" />,
      image: '/images/hero/hero-2.jpg',
      title: 'Smart Matching',
      description: 'Our AI-powered algorithm matches you with opportunities that align with your skills and career goals.',
      highlight: 'Find Your Perfect Fit',
    },
    {
      icon: <FileText className="w-12 h-12" />,
      image: '/images/hero/hero-3.jpg',
      title: 'Build Your Profile',
      description: 'Create a compelling profile that showcases your skills, experience, and achievements to employers.',
      highlight: 'Stand Out to Recruiters',
    },
    {
      icon: <Trophy className="w-12 h-12" />,
      image: '/images/hero/hero-4.jpg',
      title: 'Get Hired',
      description: 'Land your dream internship and kickstart your career with leading companies worldwide.',
      highlight: 'Start Your Journey Today',
    },
  ];

  useEffect(() => {
    if (!autoPlay) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(timer);
  }, [autoPlay, slides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setAutoPlay(false);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setAutoPlay(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setAutoPlay(false);
  };

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden flex flex-col justify-between">
      {/* Background images — cross-fade */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
          />
        </div>
      ))}

      {/* Dark gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/40" />

      {/* Content */}
      <div className="relative z-10 p-12 flex flex-col justify-between h-full">
          <Link href="/" className="flex items-center flex-shrink-0">
            <Image src="/images/internse-logo.png" alt="Internse" width={120} height={36} className="h-9 w-auto object-contain" priority />
        </Link>
          <div className='flex flex-col justify-end'>
                {/* Slide Content */}
                <div className="min-h-64 flex flex-col justify-center">
                <h2 className="text-4xl font-bold text-white mb-4">
                    {slides[currentSlide].title}
                </h2>
                <p className="text-white/90 text-lg mb-6 max-w-lg">
                    {slides[currentSlide].description}
                </p>
                <div className="w-[fit-content] bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                    <p className="text-white font-semibold">{slides[currentSlide].highlight}</p>
                </div>
                </div>

                {/* Navigation - Bottom */}
                <div className="flex items-center justify-between mt-12">
                {/* Dots */}
                <div className="flex gap-2">
                    {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`h-2 transition-all duration-300 rounded-full ${
                        index === currentSlide
                            ? 'bg-white w-8'
                            : 'bg-white/40 w-2 hover:bg-white/60'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                    ))}
                </div>

                {/* Arrow Buttons */}
                <div className="flex items-center gap-3">
                    <button
                    onClick={prevSlide}
                    onMouseEnter={() => setAutoPlay(false)}
                    onMouseLeave={() => setAutoPlay(true)}
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 rounded-lg transition-all duration-300"
                    aria-label="Previous slide"
                    >
                    <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-white/70 text-sm">{currentSlide + 1} / {slides.length}</span>
                    <button
                    onClick={nextSlide}
                    onMouseEnter={() => setAutoPlay(false)}
                    onMouseLeave={() => setAutoPlay(true)}
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 rounded-lg transition-all duration-300"
                    aria-label="Next slide"
                    >
                    <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
                </div>
          </div>
      </div>
    </div>
  );
}
