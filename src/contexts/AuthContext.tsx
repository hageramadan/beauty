"use client";

// contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { 
  getToken, 
  getUserData, 
  logout, 
  saveToken, 
  saveUserData,
  loginWithEmail,
  loginWithPhone,
  registerWithEmail,
  registerWithPhone,
  resendOTP,
} from '../services/api';

// نوع بيانات المستخدم
interface User {
  id: number;
  name: string;
  email?: string;
  phone?: string;
}

// نوع بيانات سياق المصادقة
interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  loginWithEmail: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  loginWithPhone: (phone: string, password: string, country_code: string) => Promise<{ success: boolean; message: string }>;
  registerWithEmail: (name: string, email: string, password: string) => Promise<{ success: boolean; message: string }>;
  registerWithPhone: (name: string, phone: string, password: string, country_code: string) => Promise<{ success: boolean; message: string }>;
  logoutUser: () => Promise<void>;
  // دوال إضافية للـ OTP
  verifyOTPWithEmail: (otp: string, email: string) => Promise<{ success: boolean; message: string; token?: string }>;
  verifyOTPWithPhone: (otp: string, phone: string) => Promise<{ success: boolean; message: string; token?: string }>;
  resendOTPToEmail: (email: string) => Promise<{ success: boolean; message: string }>;
  resendOTPToPhone: (phone: string) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // تعريف checkAuthStatus أولاً باستخدام useCallback
  const checkAuthStatus = useCallback(() => {
    const token = getToken();
    const userData = getUserData();
    
    if (token && userData?.user) {
      setIsAuthenticated(true);
      setUser(userData.user);
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
    setLoading(false);
  }, []);

  // التحقق من حالة المستخدم عند تحميل التطبيق
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // تسجيل الدخول بالبريد الإلكتروني - لا نقوم بتسجيل الدخول تلقائياً لأن API يطلب OTP
  const handleLoginWithEmail = useCallback(async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      const result = await loginWithEmail({ email, password });
      
      // ✅ لا نقوم بتسجيل الدخول تلقائياً هنا، لأن API يطلب OTP أولاً
      // فقط نعيد النتيجة للمكون ليتعامل معها
      if (result.result) {
        return { success: true, message: result.message };
      } else {
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'حدث خطأ أثناء تسجيل الدخول' };
    }
  }, []);

  // تسجيل الدخول برقم الهاتف - لا نقوم بتسجيل الدخول تلقائياً لأن API يطلب OTP
  const handleLoginWithPhone = useCallback(async (
    phone: string, 
    password: string, 
    country_code: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const result = await loginWithPhone({ phone, password, country_code });
      
      // ✅ لا نقوم بتسجيل الدخول تلقائياً هنا، لأن API يطلب OTP أولاً
      if (result.result) {
        return { success: true, message: result.message };
      } else {
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'حدث خطأ أثناء تسجيل الدخول' };
    }
  }, []);

  // إنشاء حساب بالبريد الإلكتروني
  const handleRegisterWithEmail = useCallback(async (
    name: string, 
    email: string, 
    password: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const result = await registerWithEmail({ name, email, password });
      
      if (result.result) {
        return { success: true, message: result.message };
      } else {
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, message: 'حدث خطأ أثناء إنشاء الحساب' };
    }
  }, []);

  // إنشاء حساب برقم الهاتف
  const handleRegisterWithPhone = useCallback(async (
    name: string,
    phone: string,
    password: string,
    country_code: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const result = await registerWithPhone({ name, phone, password, country_code });
      
      if (result.result) {
        return { success: true, message: result.message };
      } else {
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, message: 'حدث خطأ أثناء إنشاء الحساب' };
    }
  }, []);

  // التحقق من OTP للبريد الإلكتروني - بعد التحقق يتم تسجيل الدخول
  const handleVerifyOTPWithEmail = useCallback(async (otp: string, email: string): Promise<{ success: boolean; message: string; token?: string }> => {
    try {
      const response = await fetch("https://dukanah.admin.t-carts.com/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ otp, email }),
      });

      const result = await response.json();

      if (result.result && result.errNum === 200) {
        // ✅ بعد التحقق الناجح، نقوم بتسجيل الدخول وحفظ البيانات
        if (result.data?.token) {
          saveToken(result.data.token);
        }
        if (result.data?.user) {
          saveUserData({ user: result.data.user });
          setUser(result.data.user);
          setIsAuthenticated(true);
        }
        return { success: true, message: result.message, token: result.data?.token };
      } else {
        return { success: false, message: result.message || "رمز التحقق غير صحيح" };
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      return { success: false, message: 'حدث خطأ أثناء التحقق' };
    }
  }, []);

  // التحقق من OTP للهاتف - بعد التحقق يتم تسجيل الدخول
  const handleVerifyOTPWithPhone = useCallback(async (otp: string, phone: string): Promise<{ success: boolean; message: string; token?: string }> => {
    try {
      const response = await fetch("https://dukanah.admin.t-carts.com/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ otp, phone }),
      });

      const result = await response.json();

      if (result.result && result.errNum === 200) {
        // ✅ بعد التحقق الناجح، نقوم بتسجيل الدخول وحفظ البيانات
        if (result.data?.token) {
          saveToken(result.data.token);
        }
        if (result.data?.user) {
          saveUserData({ user: result.data.user });
          setUser(result.data.user);
          setIsAuthenticated(true);
        }
        return { success: true, message: result.message, token: result.data?.token };
      } else {
        return { success: false, message: result.message || "رمز التحقق غير صحيح" };
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      return { success: false, message: 'حدث خطأ أثناء التحقق' };
    }
  }, []);

  // إعادة إرسال OTP للبريد الإلكتروني
  // const handleResendOTPToEmail = useCallback(async (email: string): Promise<{ success: boolean; message: string }> => {
  //   try {
  //     const response = await fetch("https://dukanah.admin.t-carts.com/api/auth/resend-otp", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ email }),
  //     });

  //     const result = await response.json();

  //     if (result.result && result.errNum === 200) {
  //       return { success: true, message: result.message || "تم إرسال رمز جديد" };
  //     } else {
  //       return { success: false, message: result.message || "فشل إعادة إرسال الرمز" };
  //     }
  //   } catch (error) {
  //     console.error('Resend OTP error:', error);
  //     return { success: false, message: 'حدث خطأ أثناء إعادة الإرسال' };
  //   }
  // }, []);

  // إعادة إرسال OTP للهاتف
  const handleResendOTPToPhone = useCallback(async (phone: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await fetch("https://dukanah.admin.t-carts.com/api/auth/resend-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone }),
      });

      const result = await response.json();

      if (result.result && result.errNum === 200) {
        return { success: true, message: result.message || "تم إرسال رمز جديد" };
      } else {
        return { success: false, message: result.message || "فشل إعادة إرسال الرمز" };
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      return { success: false, message: 'حدث خطأ أثناء إعادة الإرسال' };
    }
  }, []);
const handleResendOTPToEmail = useCallback(async (email: string): Promise<{ success: boolean; message: string }> => {
  try {
    const result = await resendOTP(email);
    
    if (result.result && result.errNum === 200) {
      return { success: true, message: result.message || "تم إرسال رمز جديد" };
    } else {
      return { success: false, message: result.message || "فشل إعادة إرسال الرمز" };
    }
  } catch (error) {
    console.error('Resend OTP error:', error);
    return { success: false, message: 'حدث خطأ أثناء إعادة الإرسال' };
  }
}, []);
  // تسجيل الخروج
  const handleLogout = useCallback(async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // تنظيف الحالة حتى لو فشل الـ API
      setIsAuthenticated(false);
      setUser(null);
    }
  }, []);

  const value = {
    isAuthenticated,
    user,
    loading,
    loginWithEmail: handleLoginWithEmail,
    loginWithPhone: handleLoginWithPhone,
    registerWithEmail: handleRegisterWithEmail,
    registerWithPhone: handleRegisterWithPhone,
    logoutUser: handleLogout,
    verifyOTPWithEmail: handleVerifyOTPWithEmail,
    verifyOTPWithPhone: handleVerifyOTPWithPhone,
    resendOTPToEmail: handleResendOTPToEmail,
    resendOTPToPhone: handleResendOTPToPhone,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook مخصص لاستخدام المصادقة
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}