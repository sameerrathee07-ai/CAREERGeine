import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { applicationsApi } from '../../services/api';

export const fetchApplications = createAsyncThunk('applications/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const res = await applicationsApi.getAll(params);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch');
  }
});

export const updateApplicationStatus = createAsyncThunk('applications/updateStatus', async ({ id, status }, { rejectWithValue }) => {
  try {
    const res = await applicationsApi.updateStatus(id, status);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update');
  }
});

const applicationSlice = createSlice({
  name: 'applications',
  initialState: { list: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchApplications.pending, (state) => { state.loading = true; })
      .addCase(fetchApplications.fulfilled, (state, action) => { state.loading = false; state.list = action.payload; })
      .addCase(fetchApplications.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(updateApplicationStatus.fulfilled, (state, action) => {
        const idx = state.list.findIndex((a) => a._id === action.payload._id);
        if (idx !== -1) state.list[idx] = action.payload;
      });
  },
});

export default applicationSlice.reducer;
