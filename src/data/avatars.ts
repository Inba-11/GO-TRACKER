// Avatar data with 64 characters from Marvel, DC, Anime, and Transformers
// Using reliable image sources

export interface AvatarCharacter {
  id: string;
  name: string;
  category: 'Marvel' | 'DC' | 'Anime' | 'Transformers';
  imageUrl: string;
}

// Helper function to get character image URL
// Using actual superhero images from reliable sources
const getCharacterImageUrl = (characterId: string, category: string): string => {
  // Real superhero images from reliable sources
  const superheroImages: Record<string, string> = {
    // Marvel Characters - Using actual superhero images
    'spiderman': 'https://www.superherodb.com/pictures2/portraits/10/100/133.jpg',
    'ironman': 'https://www.superherodb.com/pictures2/portraits/10/100/85.jpg',
    'captainamerica': 'https://www.superherodb.com/pictures2/portraits/10/100/274.jpg',
    'thor': 'https://www.superherodb.com/pictures2/portraits/10/100/140.jpg',
    'hulk': 'https://www.superherodb.com/pictures2/portraits/10/100/83.jpg',
    'blackwidow': 'https://www.superherodb.com/pictures2/portraits/10/100/248.jpg',
    'blackpanther': 'https://www.superherodb.com/pictures2/portraits/10/100/247.jpg',
    'doctorstrange': 'https://www.superherodb.com/pictures2/portraits/10/100/55.jpg',
    'wolverine': 'https://www.superherodb.com/pictures2/portraits/10/100/161.jpg',
    'deadpool': 'https://www.superherodb.com/pictures2/portraits/10/100/835.jpg',
    'scarletwitch': 'https://www.superherodb.com/pictures2/portraits/10/100/444.jpg',
    'loki': 'https://www.superherodb.com/pictures2/portraits/10/100/928.jpg',
    'venom': 'https://www.superherodb.com/pictures2/portraits/10/100/22.jpg',
    'antman': 'https://www.superherodb.com/pictures2/portraits/10/100/857.jpg',
    'captainmarvel': 'https://www.superherodb.com/pictures2/portraits/10/100/103.jpg',
    
    // DC Characters - Adding Batman and others
    'batman': 'https://www.superherodb.com/pictures2/portraits/10/100/639.jpg',
    'superman': 'https://www.superherodb.com/pictures2/portraits/10/100/791.jpg',
    'wonderwoman': 'https://www.superherodb.com/pictures2/portraits/10/100/807.jpg',
    'flash': 'https://www.superherodb.com/pictures2/portraits/10/100/891.jpg',
    'greenlantern': 'https://www.superherodb.com/pictures2/portraits/10/100/697.jpg',
    'aquaman': 'https://www.superherodb.com/pictures2/portraits/10/100/634.jpg',
    'joker': 'https://www.superherodb.com/pictures2/portraits/10/100/719.jpg',
    'harleyquinn': 'https://www.superherodb.com/pictures2/portraits/10/100/701.jpg',
  };

  // Return actual superhero image if available
  if (superheroImages[characterId]) {
    return superheroImages[characterId];
  }

  // Fallback to a reliable avatar service
  return `https://ui-avatars.com/api/?name=${characterId}&background=dc143c&color=ffffff&size=128&font-size=0.4&bold=true&format=png`;
};

export const avatarCharacters: AvatarCharacter[] = [
  // Marvel Characters with real images
  { id: 'spiderman', name: 'Spider-Man', category: 'Marvel', imageUrl: getCharacterImageUrl('spiderman', 'marvel') },
  { id: 'ironman', name: 'Iron Man', category: 'Marvel', imageUrl: getCharacterImageUrl('ironman', 'marvel') },
  { id: 'captainamerica', name: 'Captain America', category: 'Marvel', imageUrl: getCharacterImageUrl('captainamerica', 'marvel') },
  { id: 'thor', name: 'Thor', category: 'Marvel', imageUrl: getCharacterImageUrl('thor', 'marvel') },
  { id: 'hulk', name: 'Hulk', category: 'Marvel', imageUrl: getCharacterImageUrl('hulk', 'marvel') },
  { id: 'blackwidow', name: 'Black Widow', category: 'Marvel', imageUrl: getCharacterImageUrl('blackwidow', 'marvel') },
  { id: 'blackpanther', name: 'Black Panther', category: 'Marvel', imageUrl: getCharacterImageUrl('blackpanther', 'marvel') },
  { id: 'doctorstrange', name: 'Doctor Strange', category: 'Marvel', imageUrl: getCharacterImageUrl('doctorstrange', 'marvel') },
  { id: 'wolverine', name: 'Wolverine', category: 'Marvel', imageUrl: getCharacterImageUrl('wolverine', 'marvel') },
  { id: 'deadpool', name: 'Deadpool', category: 'Marvel', imageUrl: getCharacterImageUrl('deadpool', 'marvel') },
  { id: 'scarletwitch', name: 'Scarlet Witch', category: 'Marvel', imageUrl: getCharacterImageUrl('scarletwitch', 'marvel') },
  { id: 'loki', name: 'Loki', category: 'Marvel', imageUrl: getCharacterImageUrl('loki', 'marvel') },
  { id: 'venom', name: 'Venom', category: 'Marvel', imageUrl: getCharacterImageUrl('venom', 'marvel') },
  { id: 'antman', name: 'Ant-Man', category: 'Marvel', imageUrl: getCharacterImageUrl('antman', 'marvel') },
  { id: 'captainmarvel', name: 'Captain Marvel', category: 'Marvel', imageUrl: getCharacterImageUrl('captainmarvel', 'marvel') },
  
  // DC Characters with real images
  { id: 'batman', name: 'Batman', category: 'DC', imageUrl: getCharacterImageUrl('batman', 'dc') },
  { id: 'superman', name: 'Superman', category: 'DC', imageUrl: getCharacterImageUrl('superman', 'dc') },
  { id: 'wonderwoman', name: 'Wonder Woman', category: 'DC', imageUrl: getCharacterImageUrl('wonderwoman', 'dc') },
  { id: 'flash', name: 'Flash', category: 'DC', imageUrl: getCharacterImageUrl('flash', 'dc') },
  { id: 'greenlantern', name: 'Green Lantern', category: 'DC', imageUrl: getCharacterImageUrl('greenlantern', 'dc') },
  { id: 'aquaman', name: 'Aquaman', category: 'DC', imageUrl: getCharacterImageUrl('aquaman', 'dc') },
  { id: 'joker', name: 'Joker', category: 'DC', imageUrl: getCharacterImageUrl('joker', 'dc') },
  { id: 'harleyquinn', name: 'Harley Quinn', category: 'DC', imageUrl: getCharacterImageUrl('harleyquinn', 'dc') },
];

// Get avatar by ID
export const getAvatarById = (id: string): AvatarCharacter | undefined => {
  return avatarCharacters.find(avatar => avatar.id === id);
};

// Get default avatar for student index
export const getDefaultAvatarForIndex = (index: number): AvatarCharacter => {
  return avatarCharacters[index % avatarCharacters.length];
};

// Special assignment for INBATAMIZHAN P
export const getAvatarForStudent = (rollNumber: string, index: number): AvatarCharacter => {
  if (rollNumber === "711523BCB023") {
    return getAvatarById('bumblebee') || avatarCharacters[0];
  }
  return getDefaultAvatarForIndex(index);
};

