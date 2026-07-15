import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import resumeReducer from './slices/resumeSlice';
import jobReducer from './slices/jobSlice';
import applicationReducer from './slices/applicationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    resumes: resumeReducer,
    jobs: jobReducer,
    applications: applicationReducer,
  },
});
