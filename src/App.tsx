import React from 'react';
import TaxCalculator from './components/TaxCalculator';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <main>
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <TaxCalculator />
        </div>
      </main>
    </div>
  );
};

export default App;
