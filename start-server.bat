@echo off
echo 正在启动 PhiloTrans 开发服务器...
cd /d "%~dp0"
start "PhiloTrans Dev Server" cmd /k "npm run dev"
echo 服务器已在新窗口中启动
pause

