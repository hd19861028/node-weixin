%~d0 && cd %~dp0

if exist "%windir%\SysWOW64" (
	start cmd /c "%CuttentPath%nssm-x64 install"
) else (
	start cmd /c "%CuttentPath%nssm-x86 install"
)


