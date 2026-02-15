'use client';
// This is a client-side component - it needs to handle user interactions like button clicks

import Image from 'next/image';
// Import Next.js built-in Image component for optimized image loading

/**
 * Column Component - Displays a card with image, title, description, and action button
 * Used in grid layouts to show services or features
 * 
 * @param {string} title - The card title/heading
 * @param {string} imageSrc - Path to the image
 * @param {string} imageAlt - Alt text for accessibility
 * @param {string} paragraph - Description text
 * @param {string} buttonText - Text to display on the button
 * @param {function} onButtonClick - Function to call when button is clicked
 */
export default function Column({ title, imageSrc, imageAlt, paragraph, buttonText, onButtonClick }) {
  // Destructures all parameters passed from parent component
  
  return (
    // Card container with white background and shadow, max-width of 16rem (384px)
    <div className="card bg-base-100 shadow-xl w-full max-w-sm">
      {/* Image container at top of card with fixed height */}
      <figure className="px-4 pt-4 h-48 relative">
        {/* Next.js optimized image component */}
        <Image
          src={imageSrc}                    // Image source path
          alt={imageAlt || title}           // Use provided alt or fallback to title
          fill                              // Fill the container
          className="object-cover rounded-xl"  // Cover fit with rounded corners
        />
      </figure>
      
      {/* Card body - contains text and button, centered */}
      <div className="card-body items-center text-center">
        {/* Card title */}
        <h2 className="card-title text-2xl">{title}</h2>
        
        {/* Description paragraph */}
        <p className="text-base mt-2">{paragraph}</p>
        
        {/* Button section - only renders if buttonText is provided */}
        {buttonText && (
          <div className="card-actions mt-4">
            <button 
              onClick={onButtonClick}  // Click handler function
              className="btn btn-primary"  // Primary styled button
            >
              {buttonText}  // Button label
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

