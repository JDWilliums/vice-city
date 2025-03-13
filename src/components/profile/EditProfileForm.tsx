import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { updateProfile } from 'firebase/auth';
import Image from 'next/image';
import InputField from '@/components/auth/InputField';
import AuthButton from '@/components/auth/AuthButton';
import { PROFILE_PICTURES } from '@/constants/profilePictures';
import { updateUserProfile, getUserData, updateUserPreferences } from '@/lib/userService';

export default function EditProfileForm() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [selectedPicture, setSelectedPicture] = useState(user?.photoURL || '');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load user data from Firestore
  useEffect(() => {
    async function loadUserData() {
      if (!user) return;
      
      try {
        const userData = await getUserData(user.uid);
        if (userData) {
          setDisplayName(userData.displayName || '');
          setSelectedPicture(userData.photoURL || '');
          setEmailNotifications(userData.preferences.emailNotifications);
          setTheme(userData.preferences.theme);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        setError('Failed to load user data. Please refresh the page.');
      }
    }

    loadUserData();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Update Firebase Auth profile
      await updateProfile(user, {
        displayName: displayName,
        photoURL: selectedPicture
      });

      // Update Firestore user data
      await updateUserProfile(user.uid, {
        displayName: displayName,
        photoURL: selectedPicture
      });

      // Update user preferences
      await updateUserPreferences(user.uid, {
        emailNotifications,
        theme
      });

      setSuccess('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-900/40 border border-red-500 text-red-200 px-4 py-3 rounded-md">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-900/40 border border-green-500 text-green-200 px-4 py-3 rounded-md">
          {success}
        </div>
      )}
      
      <InputField
        id="displayName"
        label="Display Name"
        type="text"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        placeholder="Your display name"
        autoComplete="name"
      />
      
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-200">
          Choose Profile Picture
        </label>
        <div className="grid grid-cols-4 gap-4">
          {PROFILE_PICTURES.map((picture) => (
            <button
              key={picture.id}
              type="button"
              onClick={() => setSelectedPicture(picture.url)}
              className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                selectedPicture === picture.url 
                  ? 'border-gta-pink shadow-lg shadow-gta-pink/20' 
                  : 'border-gray-700 hover:border-gray-500'
              }`}
            >
              <Image
                src={picture.url}
                alt={picture.label}
                fill
                className="object-cover"
              />
              {selectedPicture === picture.url && (
                <div className="absolute inset-0 bg-gta-pink/20 flex items-center justify-center">
                  <div className="bg-gta-pink text-white text-xs px-2 py-1 rounded-full">
                    Selected
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-200">Preferences</h3>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="emailNotifications"
            checked={emailNotifications}
            onChange={(e) => setEmailNotifications(e.target.checked)}
            className="h-4 w-4 rounded border-gray-700 bg-gray-800 text-gta-pink focus:ring-gta-pink"
          />
          <label htmlFor="emailNotifications" className="ml-2 text-sm text-gray-300">
            Receive email notifications
          </label>
        </div>

        <div className="space-y-2">
          <label htmlFor="theme" className="block text-sm text-gray-300">
            Theme Preference
          </label>
          <select
            id="theme"
            value={theme}
            onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}
            className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-gray-300 shadow-sm focus:border-gta-pink focus:ring-gta-pink sm:text-sm"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System (Auto)</option>
          </select>
        </div>
      </div>
      
      <div className="flex gap-4">
        <AuthButton
          provider="email"
          onClick={() => {}}
          isLoading={isLoading}
          label="Save Changes"
          type="submit"
        />
      </div>
    </form>
  );
} 