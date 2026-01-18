import React from 'react';
import InbatamizhanProfile from '../components/InbatamizhanProfile';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';

const InbatamizhanPage: React.FC = () => {
  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleGoBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  INBATAMIZHAN P - CodeChef Profile
                </h1>
                <p className="text-sm text-gray-500">
                  Real-time CodeChef performance tracking
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Live Data
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <InbatamizhanProfile />
      </div>

      {/* Footer */}
      <div className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>
              Data automatically updated every hour via enhanced scraper system
            </p>
            <p className="mt-1">
              Roll Number: 711523BCB023 | CodeChef Username: kit27csbs23
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InbatamizhanPage;