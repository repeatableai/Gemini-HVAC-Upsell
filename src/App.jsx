import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Loader } from './components/Loader';
import { LoginScreen } from './LoginScreen';
import { TechnicianPortal } from './portals/technician/TechnicianPortal';
import { CompanyAdminPortal } from './portals/admin/CompanyAdminPortal';

const AppRouter = () => {
    const { user } = useAuth();
    switch (user?.role) {
        case 'technician': return <TechnicianPortal />;
        case 'admin': return <CompanyAdminPortal />;
        default: return <div>Error: Invalid user role.</div>;
    }
};

function AppContent() {
    const { isAuthenticated, loading } = useAuth();
    if (loading) {
        return <div className="flex items-center justify-center h-screen"><Loader /></div>;
    }
    return <div className="font-sans">{isAuthenticated ? <AppRouter /> : <LoginScreen />}</div>;
}

export default function MlnDemoApp() {
    return (<AuthProvider><AppContent /></AuthProvider>);
}
