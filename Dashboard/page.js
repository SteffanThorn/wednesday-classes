'use client';
// This is a client-side component - it can use browser interactivity like buttons

import Banner from '@/components/Banner';
// Import the Banner component to display the hero section

import Column from '@/components/Column';
// Import the Column component to display service cards in a grid

import Counter from '@/components/Counter';
// Import the Counter component to display the interactive counter

import bannerStock from '@/components/banner_stock.jpg';
// Import the banner stock image

import yogaVitality from '@/components/yoga_vitality.jpg';
// Import the yoga vitality image

/**
 * Home Page - The main landing page of the website
 * Displays a hero banner, services section, and interactive counter
 */
export default function Home() {
  // Function to handle button clicks - logs the action to console
  const handleAction = (action) => {
    console.log(`${action} clicked`);
  };

  // Array of column data - defines the services to display
  const columns = [
    {
      title: 'Mindfulness Classes',              // Card title
      imageSrc: yogaVitality,             // Imported yoga vitality image
      imageAlt: 'Mindfulness',                   // Accessibility text
      paragraph: 'Join our expert-led mindfulness sessions designed to strengthen your body and calm your mind.',  // Description
      buttonText: 'Book Now'              // Button label
    },
    {
      title: 'Meditation',
      imageSrc: '/globe.svg',
      imageAlt: 'Meditation',
      paragraph: 'Discover inner peace with our guided meditation programs to reduce stress.',
      buttonText: 'Start Free'
    },
    {
      title: 'Wellness',
      imageSrc: '/vercel.svg',
      imageAlt: 'Wellness',
      paragraph: 'Learn holistic wellness techniques from industry professionals.',
      buttonText: 'Learn More'
    }
  ];

  return (
    // Main container - full screen height, base background color
    <div className="min-h-screen bg-base-100">
      {/* Hero Banner Section */}
      <Banner
        title="Welcome to Wellness"
        miniTitle="Discover a path to better health and inner peace with our comprehensive wellness programs."
        imageSrc={bannerStock}
        imageAlt="Wellness banner"
      />
      
      {/* Services Section - with vertical padding and horizontal spacing */}
      <section className="py-16 px-4">
        {/* Section title - large, centered, with margin below */}
        <h2 className="text-4xl font-bold text-center mb-12">Our Services</h2>
        {/* Flex container - wraps columns, centered, with gap between cards */}
        <div className="flex flex-wrap justify-center gap-6 max-w-7xl mx-auto">
          {/* Map through columns array to create a Column component for each service */}
          {columns.map((col, index) => (
            <Column
              key={index}                    // Unique key for React to track each item
              title={col.title}
              imageSrc={col.imageSrc}
              imageAlt={col.imageAlt}
              paragraph={col.paragraph}
              buttonText={col.buttonText}
              onButtonClick={() => handleAction(col.title)}  // Pass click handler
            />
          ))}
        </div>
      </section>

      {/* Counter Section - with vertical padding */}
      <section className="py-16 px-4">
        {/* Counter component - starts at 0, minimum 0, maximum 100 */}
        <Counter initialValue={0} min={0} max={100} />
      </section>
    </div>
  );
}


