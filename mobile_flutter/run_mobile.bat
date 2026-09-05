@echo off
chcp 65001 > nul
echo ========================================================
echo       SMART ORDER BUTTON - FLUTTER MOBILE APP
echo ========================================================
echo.

where flutter >nul 2>nul
if %errorlevel% neq 0 (
    echo [!] Khong tim thay lenh 'flutter' trong PATH.
    echo [i] Neu ban da cai Flutter tai C:\flutter, vui long them C:\flutter\bin vao bien moi truong PATH.
    echo.
    echo Cach cai Flutter nhanh:
    echo   1. Tai Flutter SDK tai: https://docs.flutter.dev/get-started/install/windows
    echo   2. Giai nen vao thu muc C:\flutter
    echo   3. Mo terminal chay: flutter doctor
    echo.
    pause
    exit /b 1
)

echo [*] Dang kiem tra dependencies...
call flutter pub get

echo.
echo Chon nen tang muon chay:
echo   1. Trinh duyet Web (Chrome) - Chay nhanh nhat, khong can gia lap
echo   2. May ao / Thiet bi Android
echo   3. Windows Desktop
echo.
set /p choice="Nhap lua chon (1/2/3, mac dinh la 1): "

if "%choice%"=="2" (
    echo [*] Dang khoi dong tren Android...
    flutter run -d android
) else if "%choice%"=="3" (
    echo [*] Dang khoi dong tren Windows...
    flutter run -d windows
) else (
    echo [*] Dang khoi dong tren Web Chrome...
    flutter run -d chrome
)

pause
