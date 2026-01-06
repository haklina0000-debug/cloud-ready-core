/**
 * User Dashboard
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Download, Eye, LogOut, Sparkles, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { canCreateProject } from '@/services/quotaService';
import { downloadDemoProject } from '@/services/downloadService';

const Dashboard: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const quota = canCreateProject(user?.uid || 'guest');

  const handleDownload = async () => {
    await downloadDemoProject('my-project');
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold">NTFLY Studio</span>
          </Link>
          <div className="flex items-center gap-4">
            {isAdmin && (
              <Link to="/admin">
                <Button variant="outline" size="sm">لوحة الأدمن</Button>
              </Link>
            )}
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="w-4 h-4 ml-2" />
              خروج
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">مرحباً، {user?.displayName || 'مستخدم'}</h1>
          <p className="text-muted-foreground">{quota.message}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><FolderOpen className="w-5 h-5" /> مشاريعي</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold">0</p></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>المتبقي اليوم</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold">{quota.remaining}/{quota.limit}</p></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>الحالة</CardTitle></CardHeader>
            <CardContent><span className="text-success font-medium">نشط</span></CardContent>
          </Card>
        </div>

        <div className="flex gap-4">
          <Button className="gradient-primary text-primary-foreground" disabled={!quota.allowed}>
            <Plus className="w-4 h-4 ml-2" /> مشروع جديد
          </Button>
          <Button variant="outline" onClick={handleDownload}>
            <Download className="w-4 h-4 ml-2" /> تحميل نموذج
          </Button>
          <Link to="/preview">
            <Button variant="outline"><Eye className="w-4 h-4 ml-2" /> معاينة</Button>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
