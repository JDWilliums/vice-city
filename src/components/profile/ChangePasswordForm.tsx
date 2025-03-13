import { useState } from 'react';
import { User, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import InputField from '@/components/auth/InputField';
import AuthButton from '@/components/auth/AuthButton';

interface ChangePasswordFormProps {
  user: User;
  onClose: () => void;
}

export default function ChangePasswordForm({ user, onClose }: ChangePasswordFormProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMessage('Please fill in all fields');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setErrorMessage('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters long');
      return;
    }
    
    try {
      setIsLoading(true);
      setErrorMessage('');
      setSuccessMessage('');
      
      // Re-authenticate user before changing password
      const credential = EmailAuthProvider.credential(
        user.email!,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);
      
      // Update password
      await updatePassword(user, newPassword);
      
      setSuccessMessage('Password updated successfully');
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error: any) {
      console.error('Error changing password:', error);
      switch (error.code) {
        case 'auth/wrong-password':
          setErrorMessage('Current password is incorrect');
          break;
        case 'auth/weak-password':
          setErrorMessage('New password is too weak. Use at least 6 characters');
          break;
        case 'auth/requires-recent-login':
          setErrorMessage('Please sign in again before changing your password');
          break;
        default:
          setErrorMessage('Failed to change password. Please try again');
      }
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
      
      {successMessage && (
        <div className="bg-green-900/40 border border-green-500 text-green-200 px-4 py-3 rounded-md">
          {successMessage}
        </div>
      )}
      
      <InputField
        id="currentPassword"
        label="Current Password"
        type="password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        required
        placeholder="••••••••"
        autoComplete="current-password"
      />
      
      <InputField
        id="newPassword"
        label="New Password"
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        required
        placeholder="••••••••"
        autoComplete="new-password"
      />
      
      <InputField
        id="confirmPassword"
        label="Confirm New Password"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
        placeholder="••••••••"
        autoComplete="new-password"
      />
      
      <div className="flex gap-4">
        <AuthButton
          provider="email"
          onClick={() => {}}
          isLoading={isLoading}
          label="Change Password"
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