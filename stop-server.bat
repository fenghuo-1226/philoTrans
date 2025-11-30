@echo off
echo 正在停止 PhiloTrans 开发服务器...
taskkill /F /IM node.exe /T 2>nul
if %errorlevel% equ 0 (
    echo 服务器已停止
) else (
    echo 未找到运行中的服务器
)
pause

