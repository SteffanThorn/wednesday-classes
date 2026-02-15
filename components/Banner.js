'use client';
// This is a client-side component - it can use browser interactivity like buttons and events

import Image from 'next/image';
// Import Next.js built-in Image component for optimized image loading

/**
 * Banner Component - Displays a hero section with title, description, and image
 * 
 * @param {string} title - Main heading text
 * @param {string} miniTitle - Subtitle/description text
 * @param {string} imageSrc - Path to the image to display
 * @param {string} imageAlt - Alt text for accessibility (default: 'Banner image')
 */
export default function Banner({ title, miniTitle, imageSrc, imageAlt = 'Banner image' }) {
  // Main component function that receives data from parent
  
  return (
    // Outer container - hero section with 50% viewport height, base-200 background color
    <div className="hero min-h-[50vh] bg-base-200 relative">
      {/* Inner container - flexbox layout that switches to row on large screens */}
      <div className="hero-content flex-col lg:flex-row gap-8 w-full max-w-6xl">
        
        {/* Left side - Text content */}
        <div className="flex-1 text-center lg:text-left">
          {/* Main title - large bold text */}
          <h1 className="text-5xl font-bold">{title}</h1>
          {/* Subtitle paragraph with padding */}
          <p className="py-6 text-lg">{miniTitle}</p>
        </div>
        
        {/* Right side - Image container */}
        <div className="flex-1 relative w-full h-64 lg:h-80">
          {/* Next.js Image component - optimized for performance */}
          <Image
            src={imageSrc}              // Image source path
            alt={imageAlt}              // Accessibility text
            fill                        // Makes image fill its container
            className="object-cover rounded-lg shadow-xl"  // Styling for cover fit and shadow
          />
        </div>
      </div>
    </div>
  );
}

