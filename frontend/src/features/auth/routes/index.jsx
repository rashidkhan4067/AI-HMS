import React from 'react';
import { Route } from 'react-router-dom';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { ProfilePage } from '../pages/ProfilePage';

/**
 * Authentication Module Routes
 * Encapsulates all identity and profile routing.
 */
export const AuthRoutes = [
    <Route key="login" path="/login" element={<LoginPage />} />,
    <Route key="register" path="/register" element={<RegisterPage />} />
];

export const ProtectedAuthRoutes = [
    <Route key="profile" path="/profile" element={<ProfilePage />} />
];
