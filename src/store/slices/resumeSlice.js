import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { resumesApi } from '../../services/api';

function unwrap(res) {
  return res.data?.data ?? res.data;
}

export const uploadResume = createAsyncThunk('resumes/upload', async (formData, { rejectWithValue }) => {
  try {
    const res = await resumesApi.upload(formData);
    return unwrap(res);
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Upload failed');
  }
});

export const uploadResumeFromText = createAsyncThunk('resumes/uploadFromText', async ({ filename, text }, { rejectWithValue }) => {
  try {
    const res = await resumesApi.uploadFromText({ filename, text });
    return unwrap(res);
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Upload failed');
  }
});

export const fetchResumes = createAsyncThunk('resumes/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const res = await resumesApi.getAll();
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch');
  }
});

export const analyzeResume = createAsyncThunk('resumes/analyze', async (id, { rejectWithValue }) => {
  try {
    const res = await resumesApi.analyze(id);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Analysis failed');
  }
});

const resumeSlice = createSlice({
  name: 'resumes',
  initialState: { list: [], current: null, loading: false, analyzing: false, error: null },
  reducers: {
    setCurrentResume: (state, action) => { state.current = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadResume.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(uploadResume.fulfilled, (state, action) => { state.loading = false; state.list.unshift(action.payload); state.current = action.payload; })
      .addCase(uploadResume.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(uploadResumeFromText.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(uploadResumeFromText.fulfilled, (state, action) => { state.loading = false; state.list.unshift(action.payload); state.current = action.payload; })
      .addCase(uploadResumeFromText.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchResumes.pending, (state) => { state.loading = true; })
      .addCase(fetchResumes.fulfilled, (state, action) => { state.loading = false; state.list = action.payload; })
      .addCase(fetchResumes.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(analyzeResume.pending, (state) => { state.analyzing = true; })
      .addCase(analyzeResume.fulfilled, (state, action) => { state.analyzing = false; if (state.current) state.current.analysis = action.payload; })
      .addCase(analyzeResume.rejected, (state, action) => { state.analyzing = false; state.error = action.payload; });
  },
});

export const { setCurrentResume } = resumeSlice.actions;
export default resumeSlice.reducer;
