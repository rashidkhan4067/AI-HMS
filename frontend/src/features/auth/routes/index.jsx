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
    <Route key="guest-routes" element={<GuestRoute />}>
        <Route key="login" path="/login" element={<LoginPage />} />
        <Route key="auth-login" path="/auth/login" element={<LoginPage />} />
        <Route key="register" path="/register" element={<RegisterPage />} />
        <Route key="auth-register" path="/auth/register" element={<RegisterPage />} />
        <Route key="forgot-password" path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route key="verify-otp" path="/verify-otp" element={<VerifyOtpPage />} />
        <Route key="reset-password" path="/reset-password" element={<ResetPasswordPage />} />
        <Route key="locked" path="/locked" element={<LockedPage />} />
    </Route>,
    // Complete profile — accessible to authenticated Google SSO users who need to finish setup
    <Route key="complete-profile" path="/auth/complete-profile" element={<CompleteProfilePage />} />,
];

export const ProtectedAuthRoutes = [
    <Route key="profile" path="/profile" element={<ProfilePage />} />
];

