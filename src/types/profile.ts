export interface SocialLinks {
  github?: string;
  linkedin?: string;
  portfolio?: string;
  twitter?: string;
  fiverr?: string;
  slack?: string;
}

export interface UserProfile {
  id: string;
  displayName: string;
  username: string;
  brand: string;
  tagline: string;
  avatarUrl?: string;
  bio?: string;
  status: 'Online' | 'In the zone' | 'Coding' | 'In client meeting' | 'Away';
  socialLinks: SocialLinks;
  updatedAt: number;
}
