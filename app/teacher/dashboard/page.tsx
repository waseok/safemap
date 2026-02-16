"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@/lib/supabase/client";
import type { Class } from "@/types";

export default function TeacherDashboardPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [className, setClassName] = useState("");
  const [creating, setCreating] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    checkAuthAndLoadClasses();
  }, []);

  const checkAuthAndLoadClasses = async () => {
    // 테스트 모드 체크
    const isTestMode = typeof window !== "undefined" && 
      sessionStorage.getItem("test_teacher_mode") === "true";
    
    if (isTestMode) {
      // 테스트 모드: 더미 데이터 표시
      setClasses([
        {
          id: "test-class-1",
          pin: "1234",
          name: "테스트 학급 1반",
          teacher_id: "test-teacher",
          created_at: new Date().toISOString(),
        },
        {
          id: "test-class-2",
          pin: "5678",
          name: "테스트 학급 2반",
          teacher_id: "test-teacher",
          created_at: new Date().toISOString(),
        },
      ]);
      setLoading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push("/teacher/login");
      return;
    }

    await loadClasses(user.id);
  };

  const loadClasses = async (teacherId: string) => {
    try {
      const { data, error } = await supabase
        .from("classes")
        .select("*")
        .eq("teacher_id", teacherId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setClasses(data || []);
    } catch (err) {
      console.error("학급 로드 오류:", err);
    } finally {
      setLoading(false);
    }
  };

  const generatePin = (): string => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  const createClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim()) return;

    setCreating(true);
    try {
      // 테스트 모드 체크
      const isTestMode = typeof window !== "undefined" && 
        sessionStorage.getItem("test_teacher_mode") === "true";
      
      if (isTestMode) {
        // 테스트 모드: 더미 클래스 추가
        const newClass = {
          id: `test-class-${Date.now()}`,
          pin: Math.floor(1000 + Math.random() * 9000).toString(),
          name: className.trim(),
          teacher_id: "test-teacher",
          created_at: new Date().toISOString(),
        };
        setClasses([newClass, ...classes]);
        setClassName("");
        setShowCreateForm(false);
        setCreating(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("로그인이 필요합니다.");

      // 고유한 PIN 생성
      let pin: string;
      let isUnique = false;
      let attempts = 0;
      
      while (!isUnique && attempts < 10) {
        pin = generatePin();
        const { data: existing } = await supabase
          .from("classes")
          .select("id")
          .eq("pin", pin)
          .single();
        
        if (!existing) {
          isUnique = true;
        } else {
          attempts++;
        }
      }

      if (!isUnique) {
        throw new Error("PIN 생성에 실패했습니다. 다시 시도해주세요.");
      }

      const { data, error } = await supabase
        .from("classes")
        .insert({
          pin: pin!,
          name: className.trim(),
          teacher_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      setClasses([data, ...classes]);
      setClassName("");
      setShowCreateForm(false);
    } catch (err: any) {
      alert(err.message || "학급 생성에 실패했습니다.");
    } finally {
      setCreating(false);
    }
  };

  const handleLogout = async () => {
    // 테스트 모드 체크
    const isTestMode = typeof window !== "undefined" && 
      sessionStorage.getItem("test_teacher_mode") === "true";
    
    if (isTestMode) {
      sessionStorage.removeItem("test_teacher_mode");
      router.push("/");
      return;
    }

    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">교사 대시보드</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            로그아웃
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">내 학급</h2>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              {showCreateForm ? "취소" : "+ 학급 생성"}
            </button>
          </div>

          {showCreateForm && (
            <form onSubmit={createClass} className="mb-4 p-4 bg-gray-50 rounded-md">
              <div className="mb-3">
                <label htmlFor="className" className="block text-sm font-medium text-gray-700 mb-1">
                  학급명
                </label>
                <input
                  id="className"
                  type="text"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="예: 3학년 1반"
                />
              </div>
              <button
                type="submit"
                disabled={creating}
                className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 disabled:opacity-50"
              >
                {creating ? "생성 중..." : "학급 생성"}
              </button>
            </form>
          )}

          {classes.length === 0 ? (
            <p className="text-gray-500 text-center py-8">생성된 학급이 없습니다.</p>
          ) : (
            <div className="space-y-3">
              {classes.map((classItem) => (
                <div
                  key={classItem.id}
                  className="p-4 border border-gray-200 rounded-md hover:bg-gray-50"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-lg">{classItem.name}</h3>
                      <p className="text-sm text-gray-500">
                        PIN: <span className="font-mono font-bold text-blue-600">{classItem.pin}</span>
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        생성일: {new Date(classItem.created_at).toLocaleDateString("ko-KR")}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(classItem.pin);
                        alert("PIN이 복사되었습니다!");
                      }}
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
                    >
                      PIN 복사
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
