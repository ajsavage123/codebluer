/** 
 * Refined 'Apple-style' 3D-ish Avatars.
 * Uses Lorelei (premium claymorphic look) with gender support.
 */
export const getClayAvatar = (userId: string, gender?: 'male' | 'female', name?: string) => {
    // Medical-themed background color palettes (calm blues, teals, slates)
    const medicalBgs = ['b6e3f4', 'c0aede', 'd1d4f9', '94a3b8', 'e2e8f0'];

    // Deterministic color based on user ID string
    const seedNum = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const bgColor = medicalBgs[seedNum % medicalBgs.length];

    // Lorelei setup - clean, professional, and high-quality 3D feel
    const style = 'lorelei';
    const seed = name || userId;

    // If gender is specified, we use variations of the seed that DiceBear's Lorelei 
    // generally associates with those aesthetics.
    const genderPrefix = gender === 'female' ? 'f-' : gender === 'male' ? 'm-' : '';

    // We add 'radius=20' for a slightly rounded look that feels more 'app-like' 
    // and 'translateY=5' to center the faces better in circle containers.
    return `https://api.dicebear.com/7.x/${style}/svg?seed=${genderPrefix}${seed}&backgroundColor=${bgColor}&radius=15&translateY=5`;
};
