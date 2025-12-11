@echo off
echo ========================================
echo Prisma 클라이언트 재생성 스크립트
echo ========================================
echo.

echo [1/3] Node.js 프로세스 종료 중...
taskkill /F /IM node.exe 2>nul
if %errorlevel% equ 0 (
    echo ✓ Node.js 프로세스가 종료되었습니다.
) else (
    echo ℹ 실행 중인 Node.js 프로세스가 없습니다.
)
echo.

echo [2/3] 기존 Prisma 클라이언트 삭제 중...
if exist "src\generated\prisma" (
    rmdir /s /q "src\generated\prisma"
    echo ✓ 기존 Prisma 클라이언트가 삭제되었습니다.
) else (
    echo ℹ 삭제할 Prisma 클라이언트가 없습니다.
)
echo.

echo [3/3] Prisma 클라이언트 재생성 중...
call npx prisma generate
if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo ✓ 완료! 이제 'npm run dev'를 실행하세요.
    echo ========================================
) else (
    echo.
    echo ========================================
    echo ✗ 오류가 발생했습니다.
    echo FIX-PRISMA-CLIENT-ERROR.md 파일을 확인하세요.
    echo ========================================
)
echo.
pause
