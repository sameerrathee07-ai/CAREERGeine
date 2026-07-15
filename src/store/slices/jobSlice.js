import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { jobsApi } from '../../services/api';

export const fetchJobs = createAsyncThunk('jobs/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const res = await jobsApi.getAll(params);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch jobs');
  }
});

export const fetchRecommendedJobs = createAsyncThunk('jobs/fetchRecommended', async (_, { rejectWithValue }) => {
  try {
    const res = await jobsApi.getRecommended();
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch');
  }
});

export const createJob = createAsyncThunk('jobs/create', async (data, { rejectWithValue }) => {
  try {
    const res = await jobsApi.create(data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create job');
  }
});

const jobSlice = createSlice({
  name: 'jobs',
  initialState: { list: [], recommended: [], current: null, loading: false, error: null },
  reducers: {
    setCurrentJob: (state, action) => { state.current = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => { state.loading = true; })
      .addCase(fetchJobs.fulfilled, (state, action) => { state.loading = false; state.list = action.payload; })
      .addCase(fetchJobs.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchRecommendedJobs.fulfilled, (state, action) => { state.recommended = action.payload; })
      .addCase(createJob.fulfilled, (state, action) => { state.list.unshift(action.payload); });
  },
});

export const { setCurrentJob } = jobSlice.actions;
export default jobSlice.reducer;
