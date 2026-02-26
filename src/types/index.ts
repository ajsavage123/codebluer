export type UserRole = 'user' | 'verified' | 'paid' | 'admin';

export interface User {
  id: string;
  name?: string;
  role: UserRole;
  avatar?: string;
  createdAt: Date;
}

export type RoomType = 
  | 'general' 
  | 'salary' 
  | 'career' 
  | 'leadership' 
  | 'entrepreneurship' 
  | 'certifications' 
  | 'students' 
  | 'library';

export interface Room {
  id: string;
  name: string;
  description: string;
  type: RoomType;
  icon: string;
  isSystem: boolean;
  memberCount: number;
  messageCount: number;
  isAnonymous?: boolean;
  createdBy?: string;
}

export interface Message {
  id: string;
  roomId: string;
  userId: string;
  content: string;
  isAnonymous: boolean;
  likes: number;
  replies: number;
  isPinned: boolean;
  createdAt: Date;
  user?: User;
  replyTo?: string;
}

export interface TrendingPost {
  id: string;
  message: Message;
  room: Room;
  engagementScore: number;
  trendingAt: Date;
}

export interface SalaryPost {
  id: string;
  role: 'emt' | 'paramedic';
  location: string;
  experienceYears: number;
  workingHours: 8 | 12;
  sector: 'private' | 'government' | 'ngo';
  salary: number;
  currency: string;
  createdAt: Date;
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  type: 'internal' | 'external';
  url?: string;
  icon: string;
  category: 'salary' | 'drugs' | 'protocols' | 'ecg' | 'study' | 'guidelines';
}

export interface Topic {
  id: string;
  roomId: string;
  title: string;
  content?: string;
  createdBy?: string;
  isAnonymous: boolean;
  isPinned: boolean;
  isLocked: boolean;
  replyCount: number;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
}
