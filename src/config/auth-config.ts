import type { AuthTexts, AuthErrorTexts } from '@sudobility/auth-components';
import { getFirebaseErrorMessage } from '@sudobility/auth_lib';

export function createAuthTexts(): AuthTexts {
  return {
    signInTitle: 'Sign In',
    signInWithEmail: 'Sign in with email',
    createAccount: 'Create Account',
    resetPassword: 'Reset Password',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    logout: 'Log Out',
    login: 'Log In',
    continueWithGoogle: 'Continue with Google',
    continueWithApple: 'Continue with Apple',
    continueWithEmail: 'Continue with Email',
    sendResetLink: 'Send Reset Link',
    backToSignIn: 'Back to Sign In',
    close: 'Close',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    displayName: 'Display Name',
    emailPlaceholder: 'you@example.com',
    passwordPlaceholder: 'Enter your password',
    confirmPasswordPlaceholder: 'Confirm your password',
    displayNamePlaceholder: 'Your name',
    forgotPassword: 'Forgot password?',
    noAccount: "Don't have an account?",
    haveAccount: 'Already have an account?',
    or: 'or',
    resetEmailSent: 'Reset email sent',
    resetEmailSentDesc: 'Check your inbox for a password reset link.',
    passwordMismatch: 'Passwords do not match',
    passwordTooShort: 'Password must be at least 6 characters',
    loading: 'Loading...',
  };
}

export function createAuthErrorTexts(): AuthErrorTexts {
  return {
    'auth/user-not-found': getFirebaseErrorMessage('auth/user-not-found'),
    'auth/wrong-password': getFirebaseErrorMessage('auth/wrong-password'),
    'auth/invalid-email': getFirebaseErrorMessage('auth/invalid-email'),
    'auth/invalid-credential': getFirebaseErrorMessage('auth/invalid-credential'),
    'auth/email-already-in-use': getFirebaseErrorMessage('auth/email-already-in-use'),
    'auth/weak-password': getFirebaseErrorMessage('auth/weak-password'),
    'auth/too-many-requests': getFirebaseErrorMessage('auth/too-many-requests'),
    'auth/network-request-failed': getFirebaseErrorMessage('auth/network-request-failed'),
    'auth/popup-closed-by-user': getFirebaseErrorMessage('auth/popup-closed-by-user'),
    'auth/popup-blocked': getFirebaseErrorMessage('auth/popup-blocked'),
    'auth/account-exists-with-different-credential': getFirebaseErrorMessage(
      'auth/account-exists-with-different-credential'
    ),
    'auth/operation-not-allowed': getFirebaseErrorMessage('auth/operation-not-allowed'),
    default: getFirebaseErrorMessage(''),
  };
}
