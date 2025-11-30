@echo off
echo 正在后台启动 PhiloTrans 开发服务器...
cd /d "%~dp0"
start /B npm run dev
echo 服务器已在后台启动
echo 访问地址: http://localhost:3000
echo.
echo 要停止服务器，请运行 stop-server.bat 或关闭所有 Node.js 进程
pause

