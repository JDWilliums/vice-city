export const PROFILE_PICTURES = [

  { id: 'lucia', url: '/images/avatars/lucia.png', label: 'Lucia' },
  { id: 'jason', url: '/images/avatars/jason.png', label: 'Jason' },
  { id: 'trevor', url: '/images/avatars/trevor.png', label: 'Trevor' },
  { id: 'micheal', url: '/images/avatars/micheal.png', label: 'Micheal' },
  { id: 'Woman1', url: '/images/avatars/woman1.png', label: 'Woman1' },

] as const;

export const getRandomProfilePicture = () => {
  const randomIndex = Math.floor(Math.random() * PROFILE_PICTURES.length);
  return PROFILE_PICTURES[randomIndex].url;
}; 