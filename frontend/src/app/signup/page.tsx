"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/store/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { notifyError, notifySuccess } from "@/lib/notify";

export default function SignupPage() {
  const router = useRouter();
  const signup = useAuth((s) => s.signup);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [loading, setLoading] = useState(false);

  const updateField = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const data = await signup(form);
      const fallback = data.user.role === "administrator" ? "/admin/products" : "/";
      notifySuccess("Account created", `Welcome to Pulse Mobile, ${data.user.first_name}!`);
      router.push(data.redirect_to || fallback);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unable to sign up right now.";
      notifyError("Sign-up failed", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='mx-auto max-w-md space-y-6'>
      <div className='flex flex-col items-center gap-3 text-center'>
        <Image src='/logo.png' alt='Pulse Mobile logo' width={160} height={44} className='h-14 w-auto' />
        <div>
          <h1 className='text-3xl font-semibold text-slate-900'>Create your account</h1>
          <p className='text-sm text-muted'>Sign up to start shopping the latest Pulse Mobile drops.</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className='space-y-4'>
        <div className='flex gap-3'>
          <Input placeholder='First name' value={form.first_name} onChange={updateField("first_name")} required />
          <Input placeholder='Last name' value={form.last_name} onChange={updateField("last_name")} required />
        </div>
        <Input type='email' placeholder='Email address' value={form.email} onChange={updateField("email")} required />
        <Input
          type='password'
          placeholder='Password (min 8 characters)'
          value={form.password}
          onChange={updateField("password")}
          required
        />
        <Input
          type='password'
          placeholder='Confirm password'
          value={form.password_confirmation}
          onChange={updateField("password_confirmation")}
          required
        />
        <Button type='submit' disabled={loading} className='w-full'>
          {loading ? "Creating account..." : "Create account"}
        </Button>
      </form>

      <p className='text-center text-sm text-muted'>
        Already have an account?{" "}
        <Link href='/login' className='text-sky-600 underline-offset-2 hover:underline'>
          Sign in
        </Link>
      </p>
    </div>
  );
}
