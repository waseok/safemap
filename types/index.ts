// 데이터베이스 타입 정의
export type LocationType = "학교" | "집" | "마을";
export type SafetyCategory = "교통" | "생활안전" | "환경" | "기타";
export type SolutionType = "text" | "image" | "drawing";

export interface Class {
  id: string;
  pin: string;
  name: string;
  teacher_id: string;
  created_at: string;
}

export interface Student {
  id: string;
  class_id: string;
  name: string;
  session_id: string;
  created_at: string;
}

export interface SafetyPin {
  id: string;
  class_id: string;
  student_id: string;
  location_type: LocationType;
  category: SafetyCategory;
  title: string;
  description: string;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  image_url: string;
  created_at: string;
}

export interface TeacherFeedback {
  id: string;
  safety_pin_id: string;
  teacher_id: string;
  feedback: string;
  created_at: string;
  updated_at: string;
}

export interface Solution {
  id: string;
  safety_pin_id: string;
  student_id: string;
  type: SolutionType;
  content: string;
  created_at: string;
}
