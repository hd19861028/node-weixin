%~d0 && cd %~dp0

if exist "%windir%\SysWOW64" (
	set var=%~dp0service\nssm-x64
) else (
	set var=%~dp0service\nssm-x86
)

set server=ChromeNativeMsg

%var% stop %server%
%var% remove %server% confirm
