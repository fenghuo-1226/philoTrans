# 服务器运行指南

## 方法一：使用批处理脚本（推荐）

### 启动服务器
双击运行 `start-server.bat` 或 `start-server-background.bat`

- **start-server.bat**: 在新窗口中启动服务器（可以看到日志）
- **start-server-background.bat**: 在后台启动服务器（无窗口）

### 停止服务器
双击运行 `stop-server.bat`

## 方法二：使用 PM2（进程管理器）

### 安装 PM2
```bash
npm install -g pm2
```

### 启动服务器
```bash
pm2 start npm --name "philotrans" -- run dev
```

### 查看状态
```bash
pm2 status
```

### 查看日志
```bash
pm2 logs philotrans
```

### 停止服务器
```bash
pm2 stop philotrans
```

### 设置开机自启
```bash
pm2 startup
pm2 save
```

## 方法三：使用 Windows 任务计划程序

1. 打开"任务计划程序"
2. 创建基本任务
3. 触发器：选择"计算机启动时"或"用户登录时"
4. 操作：启动程序
   - 程序：`cmd.exe`
   - 参数：`/c cd /d "C:\Users\lnasx\Documents\GitHub\philoTrans" && npm run dev`
5. 完成设置

## 方法四：手动启动（当前方法）

在项目目录下运行：
```bash
npm run dev
```

**注意**：关闭终端窗口会停止服务器

## 访问地址

服务器启动后，在浏览器中访问：
- http://localhost:3000
- http://127.0.0.1:3000

## 检查服务器状态

在 PowerShell 中运行：
```powershell
netstat -ano | findstr :3000
```

如果有输出，说明服务器正在运行。

