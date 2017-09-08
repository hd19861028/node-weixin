%~d0 && cd %~dp0

if exist "%windir%\SysWOW64" (
	set var=nssm-x64.exe
) else (
	set var=nssm-x86.exe
)

ping -n 5 127.1>nul
taskkill -im %var% -f
