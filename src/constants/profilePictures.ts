export const PROFILE_PICTURES = [

  { id: 'lucia', url: '/images/avatars/lucia.png', label: 'Lucia' },
  { id: 'jason', url: '/images/avatars/jason.png', label: 'Jason' },
  { id: 'tommy', url: '/images/avatars/tommy.png', label: 'Tommy Vercetti' },
  { id: 'vicecity', url: '/images/avatars/vicecity.png', label: 'Vice City' },
  { id: 'vicecity2', url: '/images/avatars/vicecity2.png', label: 'Vice City 2' },
  { id: 'vicecity3', url: '/images/avatars/vicecity3.png', label: 'Vice City 3' },
  { id: 'vicecity4', url: '/images/avatars/vicecity4.png', label: 'Vice City 4' },
  { id: 'vicecity5', url: '/images/avatars/vicecity5.png', label: 'Vice City 5' },
  { id: 'vicecity6', url: '/images/avatars/vicecity6.png', label: 'Vice City 6' },
  { id: 'trevor', url: '/images/avatars/trevor.png', label: 'Trevor' },
  { id: 'trevor2', url: '/images/avatars/trevor2.png', label: 'Trevor 2' },
  { id: 'michael', url: '/images/avatars/michael.png', label: 'Michael' },
  { id: 'michael2', url: '/images/avatars/michael2.png', label: 'Michael 2' },
  { id: 'Woman1', url: '/images/avatars/woman1.png', label: 'Woman 1' },
  { id: 'chop', url: '/images/avatars/chop.png', label: 'Chop' },
  { id: 'franklin', url: '/images/avatars/franklin.png', label: 'Franklin' },
  { id: 'franklin2', url: '/images/avatars/franklin2.png', label: 'Franklin 2' },
  { id: 'niko', url: '/images/avatars/niko.png', label: 'Niko' },
  { id: 'sanandreas', url: '/images/avatars/sanandreas.png', label: 'San Andreas' },

] as const;

export const getRandomProfilePicture = () => {
  const randomIndex = Math.floor(Math.random() * PROFILE_PICTURES.length);
  return PROFILE_PICTURES[randomIndex].url;
}; 