import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { HomeIcon, ServiceIcon, UsersIcon, SettingsIcon, LogOutIcon, MenuIcon, ClockIcon } from '../../components/Icons';
import { DashboardScreen } from './DashboardScreen';
import { ServiceManagementScreen } from './ServiceManagementScreen';
import { TechnicianManagementScreen } from './TechnicianManagementScreen';
import { SettingsScreen } from './SettingsScreen';
import { FollowUpsScreen } from './FollowUpsScreen';

export const CompanyAdminPortal = () => {
    const [currentView, setCurrentView] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, logout } = useAuth();
    const navItems = [
        { name: 'Dashboard', icon: <HomeIcon />, view: 'dashboard' },
        { name: 'Services', icon: <ServiceIcon />, view: 'services' },
        { name: 'Technicians', icon: <UsersIcon />, view: 'technicians' },
        { name: 'Follow-Ups', icon: <ClockIcon />, view: 'followups' },
        { name: 'Settings', icon: <SettingsIcon />, view: 'settings' },
    ];
    const renderView = () => {
        switch (currentView) {
            case 'dashboard': return <DashboardScreen />;
            case 'services': return <ServiceManagementScreen />;
            case 'technicians': return <TechnicianManagementScreen />;
            case 'followups': return <FollowUpsScreen />;
            case 'settings': return <SettingsScreen />;
            default: return <DashboardScreen />;
        }
    };
    const handleNavClick = (view) => {
        setCurrentView(view);
        setSidebarOpen(false);
    };
    return (
        <div className="flex h-screen bg-gray-100">
            {/* Mobile overlay */}
            {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />}

            {/* Sidebar */}
            <nav className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transform transition-transform md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6">{user.company.logo_url
                        ? <img src={user.company.logo_url} alt="Company Logo" className="h-12 object-contain" />
                        : <span className="font-bold text-xl text-gray-800">{user.company.name}</span>
                    }</div>
                <ul className="flex-grow px-4">
                    {navItems.map(item => (
                        <li key={item.name}>
                            <button onClick={() => handleNavClick(item.view)} className={`flex items-center w-full p-3 my-1 rounded-lg text-left text-gray-600 hover:bg-gray-100 transition-colors ${currentView === item.view ? 'bg-blue-50 text-blue-700 font-semibold' : ''}`}>
                                <span className="mr-4">{item.icon}</span>{item.name}
                            </button>
                        </li>
                    ))}
                </ul>
                <div className="p-4 border-t border-gray-200">
                    <p className="font-semibold">{user.full_name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <button onClick={logout} className="mt-4 w-full flex items-center justify-center p-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-lg">
                        <LogOutIcon /> <span className="ml-2">Logout</span>
                    </button>
                </div>
            </nav>

            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Mobile header */}
                <div className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center">
                    <button onClick={() => setSidebarOpen(true)} className="mr-4"><MenuIcon /></button>
                    {user.company.logo_url
                        ? <img src={user.company.logo_url} alt="Company Logo" className="h-8 object-contain" />
                        : <span className="font-bold text-gray-800">{user.company.name}</span>
                    }
                </div>
                <main className="flex-1 overflow-y-auto">{renderView()}</main>
            </div>
        </div>
    );
};
