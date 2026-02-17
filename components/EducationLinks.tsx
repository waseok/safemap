"use client";

import type { SafetyCategory } from "@/types";
import educationLinks from "@/data/safety-education-links";

interface EducationLinksProps {
  category: SafetyCategory;
  /** 리스트에서 접었을 때 제목만 보이게 할지 */
  compact?: boolean;
}

export default function EducationLinks({ category, compact = false }: EducationLinksProps) {
  const items = educationLinks[category];
  if (!items || items.length === 0) {
    return (
      <p className="text-sm text-gray-600">
        이 카테고리 교육자료 링크를 추가하려면 <code className="text-xs bg-gray-100 px-1 rounded">data/safety-education-links.ts</code> 에서 해당 항목에 &#123; title, url &#125; 를 넣어 주세요.
      </p>
    );
  }

  return (
    <div>
      <p className="text-sm font-medium text-gray-700 mb-2">📚 이 카테고리 교육자료</p>
      {compact ? (
        <ul className="text-sm space-y-1">
          {items.slice(0, 3).map((item, i) => (
            <li key={i}>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {item.title}
              </a>
            </li>
          ))}
          {items.length > 3 && (
            <li className="text-gray-500">외 {items.length - 3}개</li>
          )}
        </ul>
      ) : (
        <ul className="text-sm space-y-2">
          {items.map((item, i) => (
            <li key={i}>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline inline-flex items-center gap-1"
              >
                {item.title}
                <span className="text-xs text-gray-400">↗</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
