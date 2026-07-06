// 학생 세션 관리 유틸리티

const REVIEW_MODE_KEY = "student_review_mode";

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

export function isReviewSession(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(REVIEW_MODE_KEY) === "true";
}

export function setStudentSession(session: {
  sessionId: string;
  studentId: string;
  classId: string;
  classCode: string;
  studentName: string;
  isReview?: boolean;
}): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("student_session_id", session.sessionId);
  localStorage.setItem("student_id", session.studentId);
  localStorage.setItem("class_id", session.classId);
  localStorage.setItem("class_code", session.classCode);
  localStorage.setItem("student_name", session.studentName);
  if (session.isReview) {
    localStorage.setItem(REVIEW_MODE_KEY, "true");
  } else {
    localStorage.removeItem(REVIEW_MODE_KEY);
  }
}

export function clearStudentSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("student_session_id");
  localStorage.removeItem("student_id");
  localStorage.removeItem("class_id");
  localStorage.removeItem("class_code");
  localStorage.removeItem("student_name");
  localStorage.removeItem(REVIEW_MODE_KEY);
}

/** @deprecated 실제 UUID가 필요합니다. /review 또는 enterReviewSession()을 사용하세요. */
export function setTestStudentSession(): void {
  if (typeof window === "undefined") return;
  console.warn("setTestStudentSession은 더 이상 사용되지 않습니다. /review 페이지를 이용하세요.");
}
