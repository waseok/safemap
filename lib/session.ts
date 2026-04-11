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

export function getClassCode(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("class_code");
}

export function getStudentName(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("student_name");
}

export function setStudentSession(session: {
  sessionId: string;
  studentId: string;
  classId: string;
  classCode: string;
  studentName: string;
}): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("student_session_id", session.sessionId);
  localStorage.setItem("student_id", session.studentId);
  localStorage.setItem("class_id", session.classId);
  localStorage.setItem("class_code", session.classCode);
  localStorage.setItem("student_name", session.studentName);
}

export function clearStudentSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("student_session_id");
  localStorage.removeItem("student_id");
  localStorage.removeItem("class_id");
  localStorage.removeItem("class_code");
  localStorage.removeItem("student_name");
}

// 테스트 모드용 세션 설정
export function setTestStudentSession(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("student_session_id", "test-session-id");
  localStorage.setItem("student_id", "test-student-id");
  localStorage.setItem("class_id", "test-class-id");
  localStorage.setItem("class_code", "5670");
  localStorage.setItem("student_name", "테스트 학생");
}
