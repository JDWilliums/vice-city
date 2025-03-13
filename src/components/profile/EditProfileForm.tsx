import { useState } from 'react';
import { User, updateProfile } from 'firebase/auth';
import Image from 'next/image';
import InputField from '@/components/auth/InputField';
import AuthButton from '@/components/auth/AuthButton';
import { PROFILE_PICTURES } from '@/constants/profilePictures';

interface EditProfileFormProps {
  user: User;
  onClose: () => void;
  onUpdate: () => void;
}

export default function EditProfileForm({ user, onClose, onUpdate }: EditProfileFormProps) {
  const [displayName, setDisplayName] = useState(user.displayName || '');
  const [selectedPhotoURL, setSelectedPhotoURL] = useState(user.photoURL || PROFILE_PICTURES[0].url);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      setErrorMessage('');
      
      await updateProfile(user, {
        displayName: displayName.trim() || null,
        photoURL: selectedPhotoURL,
      });
      
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrorMessage('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMessage && (
        <div className="bg-red-900/40 border border-red-500 text-red-200 px-4 py-3 rounded-md">
          {errorMessage}
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
              onClick={() => setSelectedPhotoURL(picture.url)}
              className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                selectedPhotoURL === picture.url 
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
              {selectedPhotoURL === picture.url && (
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
      
      <div className="flex gap-4">
        <AuthButton
          provider="email"
          onClick={() => {}}
          isLoading={isLoading}
          label="Save Changes"
          type="submit"
        />
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          disabled={isLoading}
        >
          Cancel
        </button>
      </div>
    </form>
  );
} 