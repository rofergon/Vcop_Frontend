import React from 'react';

export default function StatsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header section with glass effect */}
      <div className="relative flex flex-col md:flex-row justify-between items-center mb-8 p-6 bg-gradient-to-r from-blue-600/10 to-blue-400/10 backdrop-blur-sm rounded-2xl border border-blue-100/50 shadow-lg">
        <h1 className="text-3xl font-bold text-blue-900 mb-4 md:mb-0">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-800 to-blue-500">VCOP Statistics</span>
        </h1>
        <p className="text-blue-600/80">View detailed statistics and analytics of the VCOP protocol</p>
      </div>

      {/* Stats Content - Coming Soon */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-blue-100/50 shadow-lg p-8 text-center">
        <div className="max-w-md mx-auto">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-blue-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h2 className="text-2xl font-bold text-blue-900 mb-4">Statistics Coming Soon</h2>
          <p className="text-blue-600/80">
            We're working on bringing you detailed statistics and analytics for the VCOP protocol.
            Check back soon for insights into protocol usage, reserves, and more.
          </p>
        </div>
      </div>
    </div>
  );
} 