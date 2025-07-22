
import { ProfilePage as ProfilePageComponent } from '@/components/profile/ProfilePage';
import { useParams } from 'react-router-dom';

const ProfilePage = () => {
  const { profileId } = useParams();
  const safeProfileId = typeof profileId === 'string' ? profileId : '';
  console.log('profileId from URL:', safeProfileId);
  return (
    <>
      <div className="min-h-screen bg-[#000000]">
        <ProfilePageComponent profileId={safeProfileId} />
      </div>
    </>
  );
};

export default ProfilePage;
