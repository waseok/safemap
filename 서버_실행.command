#!/bin/bash
cd "$(dirname "$0")"
echo "=========================================="
echo "  안전지도 웹앱 서버 시작"
echo "=========================================="
echo ""
echo "  접속 주소: http://localhost:3080"
echo ""
npm run dev
echo ""
echo "종료하려면 이 창에서 Ctrl+C 를 누르세요."
read -p "아무 키나 누르면 창이 닫힙니다..."
