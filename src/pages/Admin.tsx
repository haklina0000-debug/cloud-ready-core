/**
 * Admin Dashboard
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Users, FolderOpen, Star, LogOut, Sparkles, Activity, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { getLoginStats } from '@/services/loginLogger';
import { getAllUserQuotas } from '@/services/quotaService';

const AdminDashboard: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const loginStats = getLoginStats();
  const quotas = getAllUserQuotas();

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">غير مصرح</h1>
          <Link to="/"><Button>العودة</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold">NTFLY Admin</span>
          </Link>
          <Button variant="ghost" size="sm" onClick={logout}>
            <LogOut className="w-4 h-4 ml-2" /> خروج
          </Button>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">لوحة تحكم الأدمن</h1>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Users className="w-5 h-5" /> المستخدمون</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold">{quotas.length}</p></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><FolderOpen className="w-5 h-5" /> المشاريع</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold">0</p></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Activity className="w-5 h-5" /> تسجيلات اليوم</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold">{loginStats.last24Hours.total}</p></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Star className="w-5 h-5" /> التقييمات</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold">4.8</p></CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle><Bell className="w-5 h-5 inline ml-2" /> التحديثات القادمة</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2 text-muted-foreground">
              <li>• دعم المزيد من مزودي AI</li>
              <li>• تحسين أداء المعاينة</li>
              <li>• نظام إشعارات متقدم</li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminDashboard;
