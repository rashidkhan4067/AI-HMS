import { Route } from 'react-router-dom';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { ProfilePage } from '../pages/ProfilePage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { VerifyOtpPage } from '../pages/VerifyOtpPage';
import { ResetPasswordPage } from '../pages/ResetPasswordPage';
import { LockedPage } from '../pages/LockedPage';
import { CompleteProfilePage } from '../pages/CompleteProfilePage';
import { GuestRoute } from '../../../components/GuestRoute';

/**
 * Authentication Module Routes
 * Encapsulates all identity and profile routing.
 */
export const AuthRoutes = [
    <Route key="login" path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />,
    <Route key="auth-login" path="/auth/login" element={<GuestRoute><LoginPage /></GuestRoute>} />,
    <Route key="register" path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />,
    <Route key="auth-register" path="/auth/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />,
    <Route key="forgot-password" path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />,
    <Route key="verify-otp" path="/verify-otp" element={<GuestRoute><VerifyOtpPage /></GuestRoute>} />,
    <Route key="reset-password" path="/reset-password" element={<GuestRoute><ResetPasswordPage /></GuestRoute>} />,
    <Route key="locked" path="/locked" element={<GuestRoute><LockedPage /></GuestRoute>} />,
    // Complete profile — accessible to authenticated Google SSO users who need to finish setup
    <Route key="complete-profile" path="/auth/complete-profile" element={<CompleteProfilePage />} />,
];

export const ProtectedAuthRoutes = [
    <Route key="profile" path="/profile" element={<ProfilePage />} />
];
