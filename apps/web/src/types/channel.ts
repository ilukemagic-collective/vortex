export interface Channel {
  id: string;
  name: string;
  description: string | null;
  is_private: boolean;
  created_at: string;
  updated_at: string;
  owner_id: string;
}

export interface ChannelMember {
  id: string;
  channel_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
}

export interface ChannelMessage {
  id: string;
  channel_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
} 