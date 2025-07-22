import { AtSign } from 'lucide-react';

const NoCommunitiesPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black">
      <AtSign className="w-32 h-32 text-white mb-6" />
      <h1 className="text-white font-bold text-xl md:text-2xl mb-2 text-center">No active community created</h1>
      <p className="text-gray-400 text-base md:text-lg text-center">There are currently no active communities.<br />Be the first to create one!</p>
    </div>
  );
};

export default NoCommunitiesPage; 