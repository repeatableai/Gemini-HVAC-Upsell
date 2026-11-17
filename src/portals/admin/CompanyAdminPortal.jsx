import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { HomeIcon, ServiceIcon, UsersIcon, SettingsIcon, LogOutIcon, MenuIcon, ClockIcon } from '../../components/Icons';
import { DashboardScreen } from './DashboardScreen';
import { ServiceManagementScreen } from './ServiceManagementScreen';
import { TechnicianManagementScreen } from './TechnicianManagementScreen';
import { SettingsScreen } from './SettingsScreen';
import { FollowUpsScreen } from './FollowUpsScreen';
import { VideoStudioScreen } from '../shared/VideoStudioScreen';
import { TopBar } from '../../design/TopBar';

const VideoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="14" height="12" rx="2" /><path d="m22 8-6 4 6 4V8z" /></svg>
);

export const CompanyAdminPortal = () => {
    const [currentView, setCurrentView] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, logout } = useAuth();
    const navItems = [
        { name: 'Dashboard', icon: <HomeIcon />, view: 'dashboard' },
        { name: 'Services', icon: <ServiceIcon />, view: 'services' },
        { name: 'Technicians', icon: <UsersIcon />, view: 'technicians' },
        { name: 'Follow-Ups', icon: <ClockIcon />, view: 'followups' },
        { name: 'Videos', icon: <VideoIcon />, view: 'videos' },
        { name: 'Settings', icon: <SettingsIcon />, view: 'settings' },
    ];
    const renderView = () => {
        switch (currentView) {
            case 'dashboard': return <DashboardScreen />;
            case 'services': return <ServiceManagementScreen />;
            case 'technicians': return <TechnicianManagementScreen />;
            case 'followups': return <FollowUpsScreen />;
            case 'videos': return <VideoStudioScreen mode="company" companyId={user.company_id} requestedBy={user.full_name} />;
            case 'settings': return <SettingsScreen />;
            default: return <DashboardScreen />;
        }
    };
    const handleNavClick = (view) => {
        setCurrentView(view);
        setSidebarOpen(false);
    };
    const navHelp = {
        dashboard: 'Opens the Dashboard: Ask Rate, offers, approvals, declines, money left on the table and the leaderboard.',
        services: 'Opens the service catalog, where you add, edit, pause or delete the offers technicians present.',
        technicians: 'Opens your technicians: invite, edit, switch on or off, and see each one\'s results.',
        followups: 'Opens declined offers tagged for a follow-up, and the address history search.',
        videos: 'Opens Videos, where you dictate the videos you want made and track them.',
        settings: 'Opens settings for order routing, performance goals and notifications.',
    };
    return (
        <div className="flex flex-col h-screen bg-gray-100">
            <TopBar
                screen="admin"
                name={user.company.name}
                logoUrl={user.company.logo_url}
                leading={
                    <button onClick={() => setSidebarOpen(true)} className="rh-icon-btn md:hidden" aria-label="Open the menu" data-help="Opens the menu of admin pages.">
                        <MenuIcon />
                    </button>
                }
            />
            <div className="flex flex-1 min-h-0">
            {/* Mobile overlay */}
            {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />}

            {/* Sidebar */}
            <nav className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transform transition-transform md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <ul className="flex-grow px-4 pt-4">
                    {navItems.map(item => (
                        <li key={item.name}>
                            <button onClick={() => handleNavClick(item.view)} aria-current={currentView === item.view ? 'page' : undefined} data-help={navHelp[item.view]} className={`flex items-center w-full p-3 my-1 rounded-lg text-left text-gray-600 hover:bg-gray-100 transition-colors ${currentView === item.view ? 'bg-blue-50 text-blue-700 font-semibold' : ''}`}>
                                <span className="mr-4">{item.icon}</span>{item.name}
                            </button>
                        </li>
                    ))}
                </ul>
                <div className="p-4 border-t border-gray-200">
                    <p className="font-semibold">{user.full_name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <button onClick={logout} className="mt-4 w-full flex items-center justify-center p-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg" data-help="Signs you out and returns to the login screen.">
                        <LogOutIcon /> <span className="ml-2">Logout</span>
                    </button>
                </div>
            </nav>

            {/* Main content */}
            <main className="flex-1 overflow-y-auto">{renderView()}</main>
            </div>
        </div>
    );
};
