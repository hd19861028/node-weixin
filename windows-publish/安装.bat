%~d0 && cd %~dp0

if exist "%windir%\SysWOW64" (
	set var=%~dp0service\nssm-x64.exe
) else (
	set var=%~dp0service\nssm-x86.exe
)

set server=ChromeNativeMsg

start cmd /c "%~dp0_wait_kill.bat"
%var% install %server% "%~dp0_run-windows-service.bat"
%var% set %server% AppDirectory %~dp0
%var% set %server% Start Automatic
%var% start %server%
