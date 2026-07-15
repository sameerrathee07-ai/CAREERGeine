import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loginWithEmail, registerWithEmail, logoutUser } from '../../services/firebase.js';
import { authApi } from '../../services/api.js';

export const loginUser = createAsyncThunk('auth/login', async ({ email, password }, { rejectWithValue }) => {
  try {
    const { user, idToken } = await loginWithEmail(email, password);
    const res = await authApi.verifyToken(idToken);
    const data = { ...res.data.data, idToken };
    localStorage.setItem('user', JSON.stringify(data));
    return data;
  } catch (err) {
    const code = err.code || '';
    if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
      return rejectWithValue('Invalid email or password');
    }
    if (code === 'auth/too-many-requests') return rejectWithValue('Too many attempts. Try again later.');
    if (code === 'auth/user-disabled') return rejectWithValue('Account disabled. Contact support.');
    return rejectWithValue(err.response?.data?.error?.message || err.message || 'Login failed');
  }
});

export const signupUser = createAsyncThunk('auth/signup', async ({ email, password, name, role }, { rejectWithValue }) => {
  try {
    const { user, idToken } = await registerWithEmail(email, password);
    const res = await authApi.signup({ email, password, name, role });
    const data = { uid: user.uid, email, name, role, idToken };
    localStorage.setItem('user', JSON.stringify(data));
    return data;
  } catch (err) {
    const code = err.code || '';
    if (code === 'auth/email-already-in-use') return rejectWithValue('Email already in use');
    if (code === 'auth/weak-password') return rejectWithValue('Password too weak. Minimum 8 characters.');
    return rejectWithValue(err.response?.data?.error?.message || err.message || 'Signup failed');
  }
});

export const loginWithGoogle = createAsyncThunk('auth/loginWithGoogle', async (idToken, { rejectWithValue }) => {
  try {
    const res = await authApi.googleSignIn(idToken);
    const data = { ...res.data.data, idToken };
    localStorage.setItem('user', JSON.stringify(data));
    return data;
  } catch (err) {
    if (err.response?.status === 401) {
      return rejectWithValue('Session expired. Please try again.');
    }
    return rejectWithValue(err.response?.data?.error?.message || err.message || 'Google sign-in failed');
  }
});

export const saveUserRole = createAsyncThunk('auth/saveUserRole', async ({ role, user }, { rejectWithValue }) => {
  try {
    await authApi.setRole(role);
    const updated = { ...user, role };
    localStorage.setItem('user', JSON.stringify(updated));
    return updated;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error?.message || 'Failed to save role');
  }
});

export const fetchProfile = createAsyncThunk('auth/fetchProfile', async (_, { rejectWithValue }) => {
  try {
    const res = await authApi.getProfile();
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error?.message || 'Failed to fetch profile');
  }
});

const initialState = {
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.error = null;
      localStorage.removeItem('user');
      logoutUser().catch(() => {});
    },
    clearError: (state) => { state.error = null; },
    setUser: (state, action) => {
      state.user = action.payload;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
    setAuthError: (state, action) => {
      state.error = action.payload;
    },
    clearGoogleState: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginUser.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; })
      .addCase(loginUser.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(signupUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(signupUser.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; })
      .addCase(signupUser.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(loginWithGoogle.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginWithGoogle.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; })
      .addCase(loginWithGoogle.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(saveUserRole.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(saveUserRole.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; })
      .addCase(saveUserRole.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem('user', JSON.stringify(state.user));
      });
  },
});

export const { logout, clearError, setUser, setAuthError, clearGoogleState } = authSlice.actions;
export const selectUser = (state) => state.auth.user;
export const selectIsAuth = (state) => {
  const user = state.auth.user;
  return !!(user && user.token);
};
export const selectUserRole = (state) => state.auth.user?.role || null;
export const selectRoleSet = (state) => {
  const user = state.auth.user;
  return !!(user && user.token && user.role);
};
export default authSlice.reducer;
