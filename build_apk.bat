@echo off
chcp 65001 > nul
cd /d "%~dp0mobile_flutter"
call build_apk.bat
