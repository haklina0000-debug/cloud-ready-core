/**
 * Landing Page - NTFLY Studio
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Zap, 
  Shield, 
  Code2, 
  Rocket, 
  Users, 
  Star,
  ArrowRight,
  Github,
  Moon,
  Sun
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';

const Index: React.FC = () => {
  const { toggleTheme, resolvedTheme } = useTheme();
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <div className="min-h-screen gradient-hero">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 gradient-glass border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-gradient">NTFLY Studio</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
            >
              {resolvedTheme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </Button>
            
            {isAuthenticated ? (
              <Link to={isAdmin ? '/admin' : '/dashboard'}>
                <Button className="gradient-primary text-primary-foreground shadow-glow">
                  لوحة التحكم
                </Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button className="gradient-primary text-primary-foreground shadow-glow">
                  تسجيل الدخول
                </Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6 animate-fade-in">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-medium">منصة تطوير متكاملة</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-slide-up">
            <span className="text-foreground">أنشئ مشاريعك</span>
            <br />
            <span className="text-gradient">بسرعة وذكاء</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-slide-up">
            NTFLY Studio منصة متكاملة لإنشاء وإدارة المشاريع بقوة الذكاء الاصطناعي.
            ابدأ الآن واحصل على تجربة مجانية لمدة شهر.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-16 animate-slide-up">
            <Link to="/auth?mode=signup">
              <Button size="lg" className="gradient-primary text-primary-foreground shadow-glow group">
                ابدأ مجاناً
                <ArrowRight className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/beta">
              <Button size="lg" variant="outline" className="border-primary/20 hover:bg-primary/5">
                تجربة Beta
              </Button>
            </Link>
          </div>
          
          {/* Hero Visual */}
          <div className="relative max-w-4xl mx-auto animate-float">
            <div className="aspect-video rounded-2xl gradient-card border border-border/50 shadow-xl overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center p-8">
                  <Code2 className="w-16 h-16 mx-auto mb-4 text-primary" />
                  <h3 className="text-2xl font-bold mb-2">بيئة تطوير متكاملة</h3>
                  <p className="text-muted-foreground">واجهة سهلة الاستخدام مع أدوات قوية</p>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-xl gradient-primary shadow-glow animate-pulse-glow" />
            <div className="absolute -top-4 -left-4 w-16 h-16 rounded-lg bg-accent/20 backdrop-blur-sm" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-card/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">مميزات قوية</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              كل ما تحتاجه لبناء مشاريع احترافية
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="p-6">
                <div className="text-4xl md:text-5xl font-bold text-gradient mb-2">
                  {stat.value}
                </div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto text-center p-12 rounded-3xl gradient-primary shadow-glow">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              ابدأ رحلتك الآن
            </h2>
            <p className="text-primary-foreground/80 mb-8">
              انضم إلى الآلاف من المطورين واحصل على تجربة مجانية لمدة شهر كامل
            </p>
            <Link to="/auth?mode=signup">
              <Button size="lg" variant="secondary" className="shadow-lg">
                إنشاء حساب مجاني
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border/50">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">NTFLY Studio</span>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link to="/beta" className="hover:text-foreground transition-colors">
                Beta
              </Link>
              <Link to="/donate" className="hover:text-foreground transition-colors">
                تبرع
              </Link>
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
            
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} NTFLY Studio. جميع الحقوق محفوظة.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Feature Card Component
interface FeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureProps> = ({ icon, title, description }) => (
  <div className="p-6 rounded-2xl gradient-card border border-border/50 hover:shadow-lg transition-all duration-300 group">
    <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground text-sm">{description}</p>
  </div>
);

// Features data
const features = [
  {
    icon: <Sparkles className="w-6 h-6 text-primary-foreground" />,
    title: 'ذكاء اصطناعي متقدم',
    description: 'استخدم قوة AI لإنشاء الأكواد والتصاميم بسرعة فائقة',
  },
  {
    icon: <Code2 className="w-6 h-6 text-primary-foreground" />,
    title: 'محرر كود متطور',
    description: 'بيئة تطوير متكاملة مع دعم لجميع اللغات الحديثة',
  },
  {
    icon: <Shield className="w-6 h-6 text-primary-foreground" />,
    title: 'أمان متقدم',
    description: 'حماية كاملة لمشاريعك مع فحص الملفات والتحقق من الهوية',
  },
  {
    icon: <Rocket className="w-6 h-6 text-primary-foreground" />,
    title: 'نشر سريع',
    description: 'انشر مشروعك بنقرة واحدة على Netlify أو Firebase',
  },
  {
    icon: <Users className="w-6 h-6 text-primary-foreground" />,
    title: 'تعاون فريق',
    description: 'اعمل مع فريقك في الوقت الحقيقي على نفس المشروع',
  },
  {
    icon: <Star className="w-6 h-6 text-primary-foreground" />,
    title: 'قوالب جاهزة',
    description: 'ابدأ بقوالب احترافية وخصصها حسب احتياجاتك',
  },
];

// Stats data
const stats = [
  { value: '10K+', label: 'مستخدم نشط' },
  { value: '50K+', label: 'مشروع منشأ' },
  { value: '99.9%', label: 'وقت التشغيل' },
  { value: '24/7', label: 'دعم فني' },
];

export default Index;
