/**
 * Admin Portal
 * 
 * Main entry point for the staff/admin portal.
 */

import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import CaseList from './CaseList';
import CaseEditor from './CaseEditor';
import { Users, FileText, Activity, BarChart3 } from 'lucide-react';

type Page = 'dashboard' | 'cases' | 'case-edit' | 'case-create' | 'users' | 'audit' | 'settings';

interface User {
  id: string;
  name: string;
  role: string;
}

const AdminPortal: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState({
    totalCases: 0,
    draftCases: 0,
    finalizedCases: 0,
    totalPatients: 0
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

  useEffect(() => {
    fetchUser();
    fetchDashboardStats();
  }, []);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const response = await fetch(`${API_URL}/auth/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        window.location.href = '/login';
        return;
      }

      const data = await response.json();
      setUser(data.user || data);

      // Check if user is staff
      if (data.user?.role === 'patient' || data.role === 'patient') {
        window.location.href = '/';
        return;
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/dashboard/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setStats({
          totalCases: data.stats?.cases?.total || 0,
          draftCases: data.stats?.cases?.draft || 0,
          finalizedCases: data.stats?.cases?.finalized || 0,
          totalPatients: data.stats?.users?.patients || 0
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const navigateTo = (page: string) => {
    setCurrentPage(page as Page);
    setSelectedCaseId(null);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.name}</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title="Total Cases"
                value={stats.totalCases}
                icon={FileText}
                color="blue"
              />
              <StatsCard
                title="Draft Cases"
                value={stats.draftCases}
                icon={Activity}
                color="yellow"
              />
              <StatsCard
                title="Finalized Cases"
                value={stats.finalizedCases}
                icon={BarChart3}
                color="green"
              />
              <StatsCard
                title="Total Patients"
                value={stats.totalPatients}
                icon={Users}
                color="purple"
              />
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              <div className="flex gap-4">
                <button
                  onClick={() => setCurrentPage('case-create')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create New Case
                </button>
                <button
                  onClick={() => setCurrentPage('cases')}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  View All Cases
                </button>
              </div>
            </div>
          </div>
        );

      case 'cases':
        return (
          <CaseList
            onCreateCase={() => setCurrentPage('case-create')}
            onViewCase={(id) => {
              setSelectedCaseId(id);
              setCurrentPage('case-edit');
            }}
            onEditCase={(id) => {
              setSelectedCaseId(id);
              setCurrentPage('case-edit');
            }}
          />
        );

      case 'case-create':
        return (
          <CaseEditor
            onBack={() => setCurrentPage('cases')}
            onSaved={() => {
              setCurrentPage('cases');
              fetchDashboardStats();
            }}
          />
        );

      case 'case-edit':
        return (
          <CaseEditor
            caseId={selectedCaseId || undefined}
            onBack={() => setCurrentPage('cases')}
            onSaved={() => {
              setCurrentPage('cases');
              fetchDashboardStats();
            }}
          />
        );

      case 'users':
        return (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">User Management</h1>
            <p className="text-gray-600">User management interface coming soon...</p>
          </div>
        );

      case 'audit':
        return <AuditLogs />;

      default:
        return null;
    }
  };

  return (
    <AdminLayout
      currentPage={currentPage.includes('case') ? 'cases' : currentPage}
      onNavigate={navigateTo}
      user={user || undefined}
      onLogout={handleLogout}
    >
      {renderPage()}
    </AdminLayout>
  );
};

// Stats Card Component
interface StatsCardProps {
  title: string;
  value: number;
  icon: React.FC<{ className?: string }>;
  color: 'blue' | 'green' | 'yellow' | 'purple';
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    purple: 'bg-purple-100 text-purple-600'
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

// Audit Logs Component
const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/audit-logs?limit=50`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
        <p className="text-gray-600">Track all changes and actions</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No audit logs found
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resource</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(log.createdAt).toLocaleString('th-TH')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {log.userName || 'System'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      log.action === 'CREATE' ? 'bg-green-100 text-green-800' :
                      log.action === 'UPDATE' ? 'bg-blue-100 text-blue-800' :
                      log.action === 'DELETE' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.resourceType}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {log.details ? JSON.stringify(log.details) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminPortal;

