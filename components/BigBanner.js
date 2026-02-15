'use client';
// This is a client-side component - it handles user interactions like button clicks

import Image from 'next/image';
// Import Next.js built-in Image component for optimized image loading

/**
 * BigBanner Component - Displays a full-screen hero banner with background image
 * Features overlay text and optional action button
 * 
 * @param {string} imageSrc - Path to the background image
 * @param {string} imageAlt - Alt text for accessibility (default: 'Big banner')
 * @param {string} text - Text to display over the image
 * @param {string} buttonText - Optional button label
 * @param {function} onButtonClick - Optional function to call when button is clicked
 */
export default function BigBanner({ imageSrc, imageAlt = 'Big banner', text, buttonText, onButtonClick }) {
  // Main component function - receives all data from parent component
  
  return (
    // Hero container - 80% of viewport height, relative positioning for overlays
    <div className="hero min-h-[80vh] relative">
      {/* Background image - fills container, prioritized for faster loading */}
      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        className="object-cover"
        priority
      />
      {/* Dark overlay - makes text readable over the image (60% opacity) */}
      <div className="hero-overlay bg-opacity-60"></div>
      {/* Content container - centered text, absolute positioned at bottom */}
      <div className="hero-content text-center text-neutral-content w-full">
        {/* Bottom section with gradient fade from black to transparent */}
        <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent">
          <div className="max-w-4xl mx-auto">
            {/* Main text displayed over the banner */}
            <p className="text-2xl mb-4">{text}</p>
            {/* Button section - only shows if buttonText is provided */}
            {buttonText && (
              <button 
                onClick={onButtonClick}
                className="btn btn-primary btn-lg"
              >
                {buttonText}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

