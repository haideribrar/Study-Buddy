const { createClient } = require('@supabase/supabase-js');
const config = require('../config/config');

const isPlaceholder = (val) => {
  return !val || val.includes('your_') || val.includes('_here');
};

// Initialize the administrative Supabase client only if keys are present and configured.
let supabaseAdmin = null;
if (!isPlaceholder(config.supabaseUrl) && !isPlaceholder(config.supabaseServiceRoleKey)) {
  supabaseAdmin = createClient(config.supabaseUrl, config.supabaseServiceRoleKey);
} else {
  console.warn('[Supabase Service Warning] Supabase keys are not configured in .env. Database operations will be unavailable.');
}

/**
 * Factory function to create a Supabase client that runs in the context of the authenticated user.
 * This client respects Row Level Security (RLS) policies by passing the user's JWT token.
 */
const getSupabaseUserClient = (userToken) => {
  if (isPlaceholder(config.supabaseUrl) || isPlaceholder(config.supabaseAnonKey)) {
    throw new Error('Supabase integration is not configured. Please supply valid credentials in backend/.env.');
  }
  return createClient(config.supabaseUrl, config.supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${userToken}`
      }
    }
  });
};

const signUpUser = async (email, password, fullName, resetHint) => {
  if (!supabaseAdmin) {
    throw new Error('Supabase integration is not configured. Please supply valid credentials in backend/.env.');
  }

  // Sign up user in Supabase auth with display_name metadata
  const { data, error } = await supabaseAdmin.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: fullName
      }
    }
  });

  if (error) {
    throw error;
  }

  const user = data.user;
  if (!user) {
    throw new Error('User creation failed: No user returned');
  }

  // Create profile in the public.profiles table using the admin client.
  // This ensures the profile exists immediately.
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .insert([
      {
        id: user.id,
        full_name: fullName,
        email: email,
        reset_hint: resetHint,
        updated_at: new Date()
      }
    ]);

  if (profileError) {
    console.error('[Supabase Service] Failed to create profile record:', profileError.message);
    // Note: User is signed up, but profile record failed. We'll throw the error so the API can handle it.
    throw profileError;
  }

  return { user };
};

/**
 * Handles user login and returns the session details (JWT token and user info).
 */
const signInUser = async (email, password) => {
  if (!supabaseAdmin) {
    throw new Error('Supabase integration is not configured. Please supply valid credentials in backend/.env.');
  }

  const { data, error } = await supabaseAdmin.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    throw error;
  }

  return {
    session: data.session,
    user: data.user
  };
};

/**
 * Fetches user profile. Enforces RLS by querying via the user-specific client.
 */
const getUserProfile = async (userId, userToken) => {
  const userClient = getSupabaseUserClient(userToken);
  
  const { data, error } = await userClient
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    throw error;
  }

  return data;
};

/**
 * Updates user profile name. Enforces RLS by updating via the user-specific client.
 */
const updateUserProfile = async (userId, fullName, userToken) => {
  const userClient = getSupabaseUserClient(userToken);

  const { data, error } = await userClient
    .from('profiles')
    .update({
      full_name: fullName,
      updated_at: new Date()
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

/**
 * Fetches all study events for a specific user. Enforces RLS.
 */
const getUserEvents = async (userId, userToken) => {
  const userClient = getSupabaseUserClient(userToken);
  const { data, error } = await userClient
    .from('events')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  // Map fields for camelCase subTasks frontend compatibility
  return (data || []).map(event => ({
    id: event.id,
    title: event.title,
    date: event.date,
    category: event.category,
    progress: event.progress,
    subTasks: event.sub_tasks
  }));
};

/**
 * Creates a study event for a user. Enforces RLS.
 */
const createUserEvent = async (userId, eventData, userToken) => {
  const userClient = getSupabaseUserClient(userToken);
  const { data, error } = await userClient
    .from('events')
    .insert([{
      user_id: userId,
      title: eventData.title,
      date: eventData.date,
      category: eventData.category,
      progress: eventData.progress || 0,
      sub_tasks: eventData.subTasks || []
    }])
    .select()
    .single();

  if (error) throw error;
  
  return {
    id: data.id,
    title: data.title,
    date: data.date,
    category: data.category,
    progress: data.progress,
    subTasks: data.sub_tasks
  };
};

/**
 * Updates progress or subtasks of a study event. Enforces RLS.
 */
const updateUserEvent = async (userId, eventId, eventData, userToken) => {
  const userClient = getSupabaseUserClient(userToken);
  const updateData = {};
  if (eventData.progress !== undefined) updateData.progress = eventData.progress;
  if (eventData.subTasks !== undefined) updateData.sub_tasks = eventData.subTasks;

  const { data, error } = await userClient
    .from('events')
    .update(updateData)
    .eq('id', eventId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  
  return {
    id: data.id,
    title: data.title,
    date: data.date,
    category: data.category,
    progress: data.progress,
    subTasks: data.sub_tasks
  };
};

/**
 * Deletes a study event. Enforces RLS.
 */
const deleteUserEvent = async (userId, eventId, userToken) => {
  const userClient = getSupabaseUserClient(userToken);
  const { error } = await userClient
    .from('events')
    .delete()
    .eq('id', eventId)
    .eq('user_id', userId);

  if (error) throw error;
  return true;
};

/**
 * Fetches the rolling chat history (last 50 messages) for a user.
 */
const getChatHistory = async (userId, userToken) => {
  const userClient = getSupabaseUserClient(userToken);
  const { data, error } = await userClient
    .from('chat_messages')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  
  return (data || []).reverse();
};

/**
 * Saves a chat message and enforces the 50-message rolling limit.
 */
const saveChatMessage = async (userId, sender, text, userToken) => {
  const userClient = getSupabaseUserClient(userToken);
  const { data, error } = await userClient
    .from('chat_messages')
    .insert([{
      user_id: userId,
      sender,
      text
    }])
    .select()
    .single();

  if (error) throw error;

  try {
    const { data: allMsgs } = await userClient
      .from('chat_messages')
      .select('id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (allMsgs && allMsgs.length > 50) {
      const idsToDelete = allMsgs.slice(50).map(m => m.id);
      await userClient
        .from('chat_messages')
        .delete()
        .in('id', idsToDelete);
    }
  } catch (err) {
    console.error('[Supabase Service] Failed to enforce rolling cap:', err.message);
  }

  return data;
};

/**
 * Checks if an email exists in the profiles database (registered user check).
 */
const checkEmailExists = async (email) => {
  if (!email) return false;
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('email', email.trim().toLowerCase())
    .maybeSingle();

  if (error) {
    console.error('[Supabase Service] checkEmailExists error:', error.message);
    return false;
  }
  return !!data;
};

/**
 * Resets a user's password if the hint matches (case-insensitive).
 */
const resetPasswordWithHint = async (email, hint, newPassword) => {
  if (!email || !hint || !newPassword) {
    throw new Error('Missing email, hint, or new password.');
  }

  // 1. Get user profile
  const { data: profile, error: fetchError } = await supabaseAdmin
    .from('profiles')
    .select('id, reset_hint')
    .eq('email', email.trim().toLowerCase())
    .maybeSingle();

  if (fetchError || !profile) {
    throw new Error('User not found.');
  }

  // 2. Validate hint (cleaned, case-insensitive match)
  const dbHint = (profile.reset_hint || '').trim().toLowerCase();
  const inputHint = (hint || '').trim().toLowerCase();

  if (!dbHint || dbHint !== inputHint) {
    throw new Error('Incorrect password reset hint.');
  }

  // 3. Update the password via the auth admin API
  const { error: resetError } = await supabaseAdmin.auth.admin.updateUserById(
    profile.id,
    { password: newPassword }
  );

  if (resetError) {
    throw resetError;
  }

  return true;
};

/**
 * Counts user messages sent today (sender = 'user').
 */
const getUserMessageCountToday = async (userId, userToken) => {
  const userClient = getSupabaseUserClient(userToken);
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const { count, error } = await userClient
    .from('chat_messages')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('sender', 'user')
    .gte('created_at', startOfToday.toISOString());

  if (error) {
    console.error('[Supabase Service] getUserMessageCountToday error:', error.message);
    throw error;
  }
  return count || 0;
};

module.exports = {
  supabaseAdmin,
  getSupabaseUserClient,
  signUpUser,
  signInUser,
  getUserProfile,
  updateUserProfile,
  getUserEvents,
  createUserEvent,
  updateUserEvent,
  deleteUserEvent,
  getChatHistory,
  saveChatMessage,
  checkEmailExists,
  resetPasswordWithHint,
  getUserMessageCountToday
};

