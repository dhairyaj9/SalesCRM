'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthLayout } from '@/components/layouts/auth-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Zap, Mail, Lock, User } from 'lucide-react';

export default function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success('Account created! Please sign in.');
        router.push('/login');
      } else {
        const data = await res.json();
        toast.error(data?.error ?? 'Failed to create account');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create account" description="Get started with your Sales CRM account">
      <div className="flex justify-center mb-8">
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25">
          <Zap className="h-8 w-8 text-white" />
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-blue-100 text-sm">Full Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-200/30" />
            <Input
              id="name"
              placeholder="John Smith"
              value={form.name}
              onChange={(e: any) => setForm({ ...form, name: e.target.value })}
              required
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-blue-200/30 focus:border-blue-400/50 focus:ring-blue-400/20"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-blue-100 text-sm">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-200/30" />
            <Input
              id="email"
              type="email"
              placeholder="you@company.com"
              value={form.email}
              onChange={(e: any) => setForm({ ...form, email: e.target.value })}
              required
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-blue-200/30 focus:border-blue-400/50 focus:ring-blue-400/20"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-blue-100 text-sm">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-200/30" />
            <Input
              id="password"
              type="password"
              placeholder="Create a password"
              value={form.password}
              onChange={(e: any) => setForm({ ...form, password: e.target.value })}
              required
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-blue-200/30 focus:border-blue-400/50 focus:ring-blue-400/20"
            />
          </div>
        </div>
        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 h-11 text-sm font-semibold"
          loading={loading}
        >
          Create Account
        </Button>
      </form>
      <p className="text-center text-sm text-blue-100/40 mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-blue-300 hover:text-blue-200 font-semibold transition-colors">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
