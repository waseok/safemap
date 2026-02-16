// 학생 세션 관리 유틸리티

export function getStudentSessionId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("student_session_id");
}

export function getStudentId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("student_id");
}

export function getClassId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("class_id");
}

export function clearStudentSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("student_session_id");
  localStorage.removeItem("student_id");
  localStorage.removeItem("class_id");
}

// 테스트 모드용 세션 설정
export function setTestStudentSession(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("student_session_id", "test-session-id");
  localStorage.setItem("student_id", "test-student-id");
  localStorage.setItem("class_id", "test-class-id");
}
