"use client";

import { useState } from "react";
import { useAuth } from "@/store/auth";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("password");
  const [loading, setLoading] = useState(false);
  const login = useAuth((s) => s.login);
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(email, password);
      const fallback = data.user.role === "administrator" ? "/admin/products" : "/";
      router.push(data.redirect_to || fallback);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='max-w-sm mx-auto'>
      <h1 className='text-2xl font-semibold mb-4'>Sign in</h1>
      <form onSubmit={onSubmit} className='space-y-3'>
        <Input type='email' value={email} onChange={(e) => setEmail(e.target.value)} placeholder='Email' required />
        <Input
          type='password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder='Password'
          required
        />
        <Button disabled={loading} type='submit' className='w-full'>
          Login
        </Button>
      </form>
    </div>
  );
}
