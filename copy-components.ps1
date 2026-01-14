# PowerShell Script to Copy Chat Components
# Run this from: d:\HIMANSHU\Hackathons\InnerveX AIT

Write-Host "🚀 Copying chat functionality from existing project..." -ForegroundColor Cyan

$source = "productivity-software-client"
$dest = "team-diplomats-ai-productivity\client"

# Create directories if they don't exist
New-Item -ItemType Directory -Force -Path "$dest\components\ui" | Out-Null
New-Item -ItemType Directory -Force -Path "$dest\app\chat" | Out-Null
New-Item -ItemType Directory -Force -Path "$dest\app\auth" | Out-Null
New-Item -ItemType Directory -Force -Path "$dest\app\authentication" | Out-Null
New-Item -ItemType Directory -Force -Path "$dest\hooks" | Out-Null

Write-Host "📁 Copying UI components..." -ForegroundColor Yellow
Copy-Item "$source\components\ui\*" -Destination "$dest\components\ui\" -Recurse -Force

Write-Host "📁 Copying chat components..." -ForegroundColor Yellow
Copy-Item "$source\components\TodoList.tsx" -Destination "$dest\components\" -Force
Copy-Item "$source\components\MessageBubble.tsx" -Destination "$dest\components\" -Force -ErrorAction SilentlyContinue
Copy-Item "$source\components\UserListItem.tsx" -Destination "$dest\components\" -Force -ErrorAction SilentlyContinue
Copy-Item "$source\components\EmptyChatState.tsx" -Destination "$dest\components\" -Force -ErrorAction SilentlyContinue

Write-Host "📁 Copying chat page..." -ForegroundColor Yellow
Copy-Item "$source\app\chat\*" -Destination "$dest\app\chat\" -Recurse -Force

Write-Host "📁 Copying auth pages..." -ForegroundColor Yellow
Copy-Item "$source\app\auth\*" -Destination "$dest\app\auth\" -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item "$source\app\authentication\*" -Destination "$dest\app\authentication\" -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "📁 Copying hooks..." -ForegroundColor Yellow
Copy-Item "$source\hooks\*" -Destination "$dest\hooks\" -Recurse -Force -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "✅ All components copied successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. cd team-diplomats-ai-productivity\client"
Write-Host "2. npm install"
Write-Host "3. cp .env.example .env.local"
Write-Host "4. Edit .env.local with your Supabase credentials"
Write-Host "5. npm run dev"
Write-Host ""
Write-Host "🎯 Then set up n8n workflow (see SETUP.md)" -ForegroundColor Magenta
