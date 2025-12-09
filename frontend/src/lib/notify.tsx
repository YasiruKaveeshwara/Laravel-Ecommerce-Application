"use client";

import { type ReactNode } from "react";
import { toast, type ExternalToast, type ToastT } from "sonner";
import { AlertTriangle, CheckCircle2, Info, Loader2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const BASE_CLASS = "bg-card text-text border shadow-card rounded-xl";
const KIND_CLASS: Record<ToastKind, string> = {
  success: "border-emerald-200",
  info: "border-sky-200",
  warning: "border-amber-200",
  error: "border-rose-200",
  loading: "border-slate-200",
};
const ICONS: Record<ToastKind, ReactNode> = {
  success: <CheckCircle2 className='h-5 w-5 text-emerald-600' />,
  info: <Info className='h-5 w-5 text-sky-600' />,
  warning: <AlertTriangle className='h-5 w-5 text-amber-600' />,
  error: <XCircle className='h-5 w-5 text-rose-600' />,
  loading: <Loader2 className='h-5 w-5 animate-spin text-slate-600' />,
};

type ToastKind = "success" | "info" | "warning" | "error" | "loading";
type NotifyOptions = Omit<ExternalToast, "description"> & { description?: ReactNode };

type ToastMethod = (message: string, options?: ExternalToast) => ToastT;
const METHOD_MAP: Record<Exclude<ToastKind, "loading">, ToastMethod> = {
  success: toast.success,
  info: toast.info,
  warning: toast.warning,
  error: toast.error,
};

function buildOptions(kind: ToastKind, options?: NotifyOptions): ExternalToast {
  return {
    ...options,
    description: options?.description,
    icon: options?.icon ?? ICONS[kind],
    className: cn(BASE_CLASS, KIND_CLASS[kind], options?.className),
  };
}

function notify(kind: Exclude<ToastKind, "loading">, title: string, options?: NotifyOptions) {
  return METHOD_MAP[kind](title, buildOptions(kind, options));
}

export function notifySuccess(title: string, description?: ReactNode, options?: NotifyOptions) {
  return notify("success", title, { ...options, description });
}

export function notifyInfo(title: string, description?: ReactNode, options?: NotifyOptions) {
  return notify("info", title, { ...options, description });
}

export function notifyWarning(title: string, description?: ReactNode, options?: NotifyOptions) {
  return notify("warning", title, { ...options, description });
}

export function notifyError(title: string, description?: ReactNode, options?: NotifyOptions) {
  return notify("error", title, { ...options, description });
}

export function notifyLoading(title: string, description?: ReactNode, options?: NotifyOptions) {
  return toast.loading(title, buildOptions("loading", { ...options, description }));
}

export const dismissToast = (id: ToastT) => toast.dismiss(id);
