import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import JobHouse from '@/components/jobs/JobHouse';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const JobHousePage = () => {
  const navigate = useNavigate();

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-everwo-light via-white to-everwo-light/30">
        <Header />
        
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-6" data-tour="job-house">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Job House</h1>
              <p className="text-gray-600 mt-1">Discover opportunities and post your own</p>
            </div>
            <Button 
              onClick={() => navigate('/post-job')}
              className="bg-gradient-to-r from-white to-gray-200 hover:from-gray-100 hover:to-gray-300 text-black"
            >
              <Plus className="w-4 h-4 mr-2" />
              Post Job
            </Button>
          </div>
          
          <JobHouse />
        </div>
      </div>
    </>
  );
};

export default JobHousePage;
