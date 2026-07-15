import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    sidebarOpen: false,
    theme: typeof window !== 'undefined' ? localStorage.getItem('theme') || 'light' : 'light',
    toasts: [],
  },
  reducers: {
    toggleSidebar: (state) => { state.sidebarOpen = !state.sidebarOpen; },
    setSidebarOpen: (state, action) => { state.sidebarOpen = action.payload; },
    setTheme: (state, action) => { state.theme = action.payload; },
    addToast: (state, action) => { state.toasts.push({ id: Date.now(), ...action.payload }); },
    removeToast: (state, action) => { state.toasts = state.toasts.filter((t) => t.id !== action.payload); },
  },
});

export const { toggleSidebar, setSidebarOpen, setTheme, addToast, removeToast } = uiSlice.actions;
export default uiSlice.reducer;
