import { supabase } from '@/lib/supabase';
import type { Channel, ChannelMember, ChannelMessage } from '@/types/channel';
import { getSupabaseClient } from '@/lib/supabase/client';

export async function getChannels() {
  const { data, error } = await supabase
    .from('channels')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Channel[];
}

export async function getChannelById(id: string) {
  const { data, error } = await supabase
    .from('channels')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Channel;
}

export async function createChannel(channel: Omit<Channel, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('channels')
    .insert(channel)
    .select()
    .single();

  if (error) throw error;

  // 自动将创建者添加为频道成员（所有者角色）
  await supabase
    .from('channel_members')
    .insert({
      channel_id: data.id,
      user_id: channel.owner_id,
      role: 'owner'
    });

  return data as Channel;
}

export async function updateChannel(id: string, updates: Partial<Omit<Channel, 'id' | 'created_at' | 'updated_at'>>) {
  const { data, error } = await supabase
    .from('channels')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Channel;
}

export async function deleteChannel(id: string) {
  const { error } = await supabase
    .from('channels')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

export async function joinChannel(channelId: string, userId: string) {
  const { data, error } = await supabase
    .from('channel_members')
    .insert({
      channel_id: channelId,
      user_id: userId,
      role: 'member'
    })
    .select()
    .single();

  if (error) throw error;
  return data as ChannelMember;
}

export async function leaveChannel(channelId: string, userId: string) {
  const { error } = await supabase
    .from('channel_members')
    .delete()
    .eq('channel_id', channelId)
    .eq('user_id', userId);

  if (error) throw error;
  return true;
}

export async function getChannelMembers(channelId: string) {
  // 1. 获取频道成员
  const { data: members, error: membersError } = await supabase
    .from('channel_members')
    .select('*')
    .eq('channel_id', channelId);

  if (membersError) throw membersError;

  if (!members || members.length === 0) {
    return [];
  }

  // 2. 获取所有相关用户的信息
  const userIds = members.map(member => member.user_id);

  // 尝试从 profiles 表获取用户信息
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles') // 使用 profiles 表而不是 users
    .select('id, username, avatar_url')
    .in('id', userIds);

  if (profilesError) {
    console.error("获取用户信息失败:", profilesError);

    // 尝试从 auth.users 获取基本信息
    try {
      const { data: authUsers } = await supabase.auth.admin.listUsers({
        perPage: 1000, // 设置一个足够大的值
      });

      const usersMap = new Map();
      authUsers?.users?.forEach(user => {
        usersMap.set(user.id, {
          id: user.id,
          username: user.user_metadata?.username || user.email?.split('@')[0] || '未知用户',
          avatar_url: user.user_metadata?.avatar_url || null
        });
      });

      return members.map(member => ({
        ...member,
        user: usersMap.get(member.user_id) || {
          id: member.user_id,
          username: '未知用户',
          avatar_url: null
        }
      }));
    } catch (authError) {
      console.error("获取 auth 用户信息失败:", authError);
      // 如果无法获取用户信息，返回没有用户信息的成员列表
      return members.map(member => ({
        ...member,
        user: {
          id: member.user_id,
          username: '未知用户',
          avatar_url: null
        }
      }));
    }
  }

  // 3. 合并数据
  const membersWithUsers = members.map(member => {
    const profile = profiles?.find(p => p.id === member.user_id);
    return {
      ...member,
      user: profile || {
        id: member.user_id,
        username: '未知用户',
        avatar_url: null
      }
    };
  });

  return membersWithUsers;
}

export async function getChannelMessages(channelId: string) {
  // 1. 获取频道消息
  const { data: messages, error: messagesError } = await supabase
    .from('channel_messages')
    .select('*')
    .eq('channel_id', channelId)
    .order('created_at', { ascending: true });

  if (messagesError) throw messagesError;

  if (!messages || messages.length === 0) {
    return [];
  }

  // 2. 获取所有相关用户的信息
  const userIds = [...new Set(messages.map(message => message.user_id))];

  const { data: profiles, error: profilesError } = await supabase
    .from('profiles') // 使用 profiles 表而不是 users
    .select('id, username, avatar_url')
    .in('id', userIds);

  if (profilesError) {
    console.error("获取用户信息失败:", profilesError);
    // 返回没有用户信息的消息列表
    return messages.map(message => ({
      ...message,
      user: {
        id: message.user_id,
        username: '未知用户',
        avatar_url: null
      }
    }));
  }

  // 3. 合并数据
  const messagesWithUsers = messages.map(message => {
    const profile = profiles?.find(p => p.id === message.user_id);
    return {
      ...message,
      user: profile || {
        id: message.user_id,
        username: '未知用户',
        avatar_url: null
      }
    };
  });

  return messagesWithUsers;
}

/**
 * 发送频道消息
 */
export async function sendChannelMessage(
  channelId: string,
  userId: string,
  content: string
): Promise<ChannelMessage> {
  try {
    const supabase = getSupabaseClient();

    // 插入消息
    const { data, error } = await supabase
      .from('channel_messages')
      .insert({
        channel_id: channelId,
        user_id: userId,
        content: content
      })
      .select('*')
      .single();

    if (error) {
      console.error('发送消息失败:', error);
      throw new Error(`发送消息失败: ${error.message}`);
    }

    if (!data) {
      throw new Error('发送消息失败: 未返回数据');
    }

    return data as ChannelMessage;
  } catch (error: unknown) {
    console.error('发送消息失败:', error);
    throw error;
  }
}

/**
 * 订阅频道消息的实时更新
 */
export function subscribeToChannelMessages(
  channelId: string,
  callback: (message: ChannelMessage) => void
) {
  // 直接使用 supabase 实例
  const channelName = `channel-messages-${channelId}`;

  const subscription = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'channel_messages',
        filter: `channel_id=eq.${channelId}`
      },
      (payload) => {
        // 当有新消息插入时，获取消息数据
        const newMessage = payload.new as ChannelMessage;

        // 为消息添加用户信息
        const messageWithUser = {
          ...newMessage,
          user: {
            id: newMessage.user_id,
            // 这里我们暂时使用占位符，实际用户信息会在页面组件中处理
            username: '加载中...',
            avatar_url: null
          }
        };

        // 调用回调函数，传递消息对象
        callback(messageWithUser);
      }
    )
    .subscribe((status) => {
      if (status !== 'SUBSCRIBED') {
        console.log(`实时订阅状态: ${status}`);
      }
    });

  return {
    unsubscribe: () => {
      supabase.removeChannel(subscription);
    }
  };
}

// 更新成员角色
export async function updateMemberRole(memberId: string, role: 'owner' | 'admin' | 'member') {
  const { data, error } = await supabase
    .from('channel_members')
    .update({ role })
    .eq('id', memberId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// 移除成员
export async function removeMember(memberId: string) {
  const { error } = await supabase
    .from('channel_members')
    .delete()
    .eq('id', memberId);

  if (error) throw error;
  return true;
}

type InviteUserParams = {
  email?: string;
  username?: string;
};

/**
 * 邀请用户加入频道
 */
export async function inviteUserToChannel(
  channelId: string,
  params: InviteUserParams
) {
  try {
    const { email, username } = params;

    if (!email && !username) {
      throw new Error("必须提供电子邮件或用户名");
    }

    // 获取要邀请的用户ID
    let userId: string | null = null;

    if (email) {
      // 暂时不支持通过邮箱邀请
      throw new Error("暂不支持通过邮箱邀请用户，请使用用户名");
    } else if (username) {
      // 通过用户名查找用户
      const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username)
        .single();

      if (userError) {
        if (userError.code === "PGRST116") {
          throw new Error(`用户 "${username}" 不存在`);
        }
        throw new Error(`查找用户失败: ${userError.message}`);
      }

      userId = userData.id;
    }

    if (!userId) {
      throw new Error("未找到用户");
    }

    // 检查用户是否已经是频道成员
    const { data: existingMember, error: memberCheckError } = await supabase
      .from("channel_members")
      .select("id")
      .eq("channel_id", channelId)
      .eq("user_id", userId)
      .single();

    if (memberCheckError && memberCheckError.code !== "PGRST116") {
      throw new Error(`检查成员状态失败: ${memberCheckError.message}`);
    }

    if (existingMember) {
      throw new Error("该用户已经是频道成员");
    }

    // 添加用户为频道成员
    const { error: addMemberError } = await supabase
      .from("channel_members")
      .insert({
        channel_id: channelId,
        user_id: userId,
        role: "member", // 默认角色
      });

    if (addMemberError) {
      throw new Error(`添加成员失败: ${addMemberError.message}`);
    }

    return { success: true };
  } catch (error: unknown) {
    console.error("邀请用户失败:", error);
    throw error;
  }
}

// 转让频道所有权
export async function transferChannelOwnership(channelId: string, newOwnerId: string, currentOwnerId: string) {
  // 开始事务
  const { error: transactionError } = await supabase.rpc('transfer_channel_ownership', {
    p_channel_id: channelId,
    p_new_owner_id: newOwnerId,
    p_current_owner_id: currentOwnerId
  });

  if (transactionError) throw transactionError;
  return true;
} 