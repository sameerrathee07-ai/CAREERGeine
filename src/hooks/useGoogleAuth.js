import { useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { signInWithGoogle as firebaseGoogleSignIn, getGoogleRedirectResult } from '../services/firebase.js';
import { loginWithGoogle, clearError, setAuthError } from '../store/slices/authSlice.js';

export function useGoogleAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector((state) => state.auth);
  const [googleLoading, setGoogleLoading] = useState(false);

  const signIn = useCallback(async () => {
    setGoogleLoading(true);
    dispatch(clearError());

    try {
      const result = await firebaseGoogleSignIn();

      const resultAction = await dispatch(loginWithGoogle(result.idToken));

      if (loginWithGoogle.fulfilled.match(resultAction)) {
        const payload = resultAction.payload;
        if (payload.roleSet && payload.role) {
          if (payload.role === 'admin') navigate('/admin', { replace: true });
          else if (payload.role === 'recruiter') navigate('/recruiter', { replace: true });
          else navigate('/dashboard', { replace: true });
        }
      } else if (loginWithGoogle.rejected.match(resultAction)) {
        dispatch(setAuthError(resultAction.payload || 'Google sign-in failed'));
      }
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user') {
        dispatch(setAuthError(null));
      } else if (err.code === 'auth/account-exists-with-different-credential') {
        dispatch(setAuthError('An account already exists with this email. Try signing in with email and password.'));
      } else if (err.code === 'auth/cancelled-popup-request') {
        dispatch(setAuthError(null));
      } else {
        dispatch(setAuthError(err.message || 'Google sign-in failed. Please try again.'));
      }
    } finally {
      setGoogleLoading(false);
    }
  }, [dispatch, navigate]);

  useEffect(() => {
    let cancelled = false;

    async function handleRedirect() {
      let result;
      try {
        result = await getGoogleRedirectResult();
        if (!result || cancelled) return;
      } catch (err) {
        if (!cancelled) dispatch(setAuthError(err.message || 'Google sign-in failed'));
        return;
      }

      setGoogleLoading(true);
      const resultAction = await dispatch(loginWithGoogle(result.idToken));

      if (loginWithGoogle.fulfilled.match(resultAction) && !cancelled) {
        const payload = resultAction.payload;
        if (payload.roleSet && payload.role) {
          if (payload.role === 'admin') navigate('/admin', { replace: true });
          else if (payload.role === 'recruiter') navigate('/recruiter', { replace: true });
          else navigate('/dashboard', { replace: true });
        }
      } else if (loginWithGoogle.rejected.match(resultAction) && !cancelled) {
        dispatch(setAuthError(resultAction.payload || 'Google sign-in failed'));
      }
      if (!cancelled) setGoogleLoading(false);
    }

    handleRedirect();
    return () => { cancelled = true; };
  }, [dispatch, navigate]);

  return {
    signIn,
    loading: loading || googleLoading,
    error,
    user,
  };
}
