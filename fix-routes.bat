@echo off
echo Fixing Next.js route parameter conflicts...

:: Remove conflicting route directories
rmdir /s /q "src\app\admin\wiki\edit\[id]" 2>nul
rmdir /s /q "src\app\admin\wiki\revisions\[id]" 2>nul
rmdir /s /q "src\app\wiki\[category]\[id]" 2>nul
rmdir /s /q "src\app\wiki\locations\[id]" 2>nul

:: Check that our directories exist
if not exist "src\app\admin\wiki\edit\[slug]" mkdir "src\app\admin\wiki\edit\[slug]"
if not exist "src\app\admin\wiki\revisions\[slug]" mkdir "src\app\admin\wiki\revisions\[slug]"
if not exist "src\app\wiki\[category]\[slug]" mkdir "src\app\wiki\[category]\[slug]"

echo Route directories fixed!
echo You can now run 'npm run dev' to start the development server 