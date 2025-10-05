@echo off
:: Disable Windows 10 Automatic Updates
:: Run as Administrator required
setlocal enableextensions

echo ============================================
echo Windows 10 Automatic Update Disabler
echo ============================================
echo.

:: Check for administrator privileges
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: This script must be run as Administrator!
    echo Please right-click and select "Run as administrator"
    exit /b 1
)

:: Stop Windows Update services
echo Stopping Windows Update services...
net stop wuauserv >nul 2>&1
net stop bits >nul 2>&1
net stop dosvc >nul 2>&1
net stop UsoSvc >nul 2>&1
net stop WaaSMedicSvc >nul 2>&1

:: Disable Windows Update services
echo Disabling Windows Update services...
sc config wuauserv start= disabled >nul 2>&1
sc config bits start= disabled >nul 2>&1
sc config dosvc start= disabled >nul 2>&1
sc config UsoSvc start= disabled >nul 2>&1
sc config WaaSMedicSvc start= disabled >nul 2>&1

:: Disable automatic updates via registry
echo Configuring Windows Update settings...
reg add "HKLM\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate\AU" /v NoAutoUpdate /t REG_DWORD /d 1 /f >nul 2>&1
reg add "HKLM\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate\AU" /v AUOptions /t REG_DWORD /d 2 /f >nul 2>&1
reg add "HKLM\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate\AU" /v ScheduledInstallDay /t REG_DWORD /d 0 /f >nul 2>&1
reg add "HKLM\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate\AU" /v ScheduledInstallTime /t REG_DWORD /d 3 /f >nul 2>&1

:: Disable Windows Update related scheduled tasks
schtasks /Change /TN "Microsoft\Windows\WindowsUpdate\Automatic App Update" /Disable >nul 2>&1
schtasks /Change /TN "Microsoft\Windows\WindowsUpdate\Scheduled Start" /Disable >nul 2>&1
schtasks /Change /TN "Microsoft\Windows\WindowsUpdate\sih" /Disable >nul 2>&1
schtasks /Change /TN "Microsoft\Windows\WindowsUpdate\sihboot" /Disable >nul 2>&1

:: Configure Windows Update Medic Service
reg add "HKLM\SYSTEM\CurrentControlSet\Services\WaaSMedicSvc" /v Start /t REG_DWORD /d 4 /f >nul 2>&1
reg add "HKLM\SYSTEM\CurrentControlSet\Services\WaaSMedicSvc" /v FailureActions /t REG_BINARY /d 0000000000000000000000000000000000000000 /f >nul 2>&1

:: Block Windows Update domains (idempotent)
echo Blocking Windows Update domains...
set "HOSTS=%WINDIR%\System32\drivers\etc\hosts"
(for %%D in (
    windowsupdate.microsoft.com
    update.microsoft.com
    windowsupdate.com
    download.windowsupdate.com
    wustat.windows.com
    ntservicepack.microsoft.com
    stats.microsoft.com
) do (
    findstr /I /C:"%%D" "%HOSTS%" >nul 2>&1 || echo 0.0.0.0 %%D>>"%HOSTS%"
))

echo.
echo ============================================
echo Windows 10 Automatic Updates have been DISABLED!
echo ============================================
echo.
echo Changes made:
echo - Windows Update services stopped and disabled
echo - Registry settings configured to disable auto-updates
echo - Windows Update scheduled tasks disabled
echo - Windows Update domains blocked in hosts file (no duplicate entries)
echo.
echo NOTE: Some settings may require a system restart to take full effect.
echo To re-enable updates, run: enable_win10_updates.bat
echo.
endlocal
exit /b 0