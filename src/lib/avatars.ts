/** 
 * Professional 'Official' Icons.
 * Inspired by minimalist high-end illustrations (Notion-style). 
 * These look much 'nicer' than letters while staying strictly professional.
 */
export const getClayAvatar = (userId: string, gender?: 'male' | 'female', name?: string) => {
    // Soft, Modern Medical Palette (Clean and Premium)
    const professionalBgs = [
        'f8fafc', // Slate 50
        'f1f5f9', // Slate 100
        'eff6ff', // Blue 50
        'f0fdf4', // Green 50
        'f5f3ff', // Violet 50
        'ecfeff', // Cyan 50
    ];

    const seed = name || userId;
    const seedNum = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const bgColor = professionalBgs[seedNum % professionalBgs.length];

    // 'Notionists' are clean, minimalist, and look like official profile icons.
    // They are unique per name and feel much higher-end than plain text.
    const style = 'notionists';
    
    // Using a refined rounded square (radius 15) and clean professional gestures.
    return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}&backgroundColor=${bgColor}&radius=15&gesture=ok,wave,paper&neck=short`;
};
