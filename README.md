# N8N Project Management System - Backend API

Backend server để tương tác với N8N workflows cho hệ thống quản lý dự án tự động với AI.

## Tính năng

### Project Management
- 📋 **Projects API**: Tạo, xem, quản lý dự án
- ✅ **Tasks API**: Generate và quản lý tasks từ dự án
- 👥 **Assignments API**: Phân công tasks cho nhân viên
- 📊 **Reports API**: Báo cáo và thống kê

### AI Chatbot
- 💬 **Chat API**: Gửi tin nhắn và nhận phản hồi từ AI agent
- 📤 **Upload API**: Trigger workflow để upload và xử lý tài liệu
- 🔍 **Workflow Status**: Kiểm tra trạng thái execution của workflow

### Data Management
- 💾 **Supabase Integration**: Tự động lưu tất cả dữ liệu vào Supabase
- 📊 **Data Query APIs**: Truy vấn dữ liệu từ Supabase
- 🔗 **Webhook Support**: Nhận webhook từ N8N

## Cài đặt

1. Cài đặt dependencies:
```bash
npm install
```

2. Tạo file `.env` từ `.env.example`:
```bash
cp .env.example .env
```

3. Cấu hình các biến môi trường trong file `.env`:
```env
PORT=3000
N8N_BASE_URL=http://localhost:5678
N8N_API_KEY=your_n8n_api_key_here

# N8N Workflow IDs
N8N_WORKFLOW_PROJECT_ID=f6mhSm7CAhvmLoQm
N8N_WORKFLOW_TASK_ID=IEpB7zTzZYbQafSv
N8N_WORKFLOW_PEOPLE_ID=TNTiFypSpv9Rt8Wt
N8N_WORKFLOW_CHAT_ID=29VVaah6aHg7xOwc

# N8N Webhook IDs
N8N_WEBHOOK_ID=0a30838e-59c4-484c-8b87-2d84dc78e992
N8N_WEBHOOK_PROJECT_ID=project-input-webhook

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_anon_key_here
```

4. Tạo database schema trong Supabase:
   - Mở Supabase Dashboard → SQL Editor
   - Chạy script trong file `supabase-schema.sql` để tạo các bảng `chat_history` và `document_uploads`

5. Cấu hình Supabase credentials trong N8N:
   - Mở N8N workflow
   - Cấu hình credentials cho các node "Save Chat to Supabase" và "Save Upload to Supabase"
   - Sử dụng PostgreSQL connection với Supabase connection string

## Chạy server

```bash
# Production
npm start

# Development (với auto-reload)
npm run dev
```

Server sẽ chạy tại `http://localhost:3000`

## API Endpoints

### 1. Health Check
```
GET /health
```

### 2. Chat API
Gửi tin nhắn đến AI agent:
```
POST /api/chat
Content-Type: application/json

{
  "message": "Xin chào, bạn có thể giúp gì cho tôi?",
  "sessionId": "optional-session-id"
}
```

### 3. Upload Document
Trigger workflow để upload và xử lý tài liệu:
```
POST /api/upload
Content-Type: application/json

{
  "fileUrl": "https://docs.google.com/document/d/1dfyoztLU8byDXm2OAtUbZnU8WEakSJ1WqKQNjM2TpmM/edit",
  "fileId": "1dfyoztLU8byDXm2OAtUbZnU8WEakSJ1WqKQNjM2TpmM"
}
```

### 4. Workflow Status
Kiểm tra trạng thái execution:
```
GET /api/workflow/status?executionId=YOUR_EXECUTION_ID
```

### 5. Webhook Endpoint
Nhận webhook từ N8N:
```
POST /webhook/chat
```

### 6. Get Chat History
Lấy lịch sử chat từ Supabase:
```
GET /api/chat/history?sessionId=optional-session-id&limit=50&offset=0
```

### 7. Get Document Uploads
Lấy danh sách các file đã upload:
```
GET /api/uploads?limit=50&offset=0&status=completed
```

## Project Management APIs

### Projects API

#### Create Project
Tạo dự án mới (trigger ManageProject workflow):
```
POST /api/projects
Content-Type: application/json

{
  "project_name": "Mobile Banking App",
  "description": "Xây dựng ứng dụng mobile banking với các tính năng chuyển tiền, thanh toán hóa đơn",
  "requirements": "Yêu cầu bảo mật cao, hỗ trợ iOS và Android",
  "deadline": "2024-12-31",
  "budget": 50000,
  "team_size": 5,
  "priority": "high"
}
```

#### Get Projects
Lấy danh sách dự án:
```
GET /api/projects?limit=50&offset=0&status=active&search=mobile
```

#### Get Project by ID
Lấy chi tiết dự án:
```
GET /api/projects/:id
```

### Tasks API

#### Generate Tasks
Generate tasks từ project (trigger Manage task workflow):
```
POST /api/tasks/generate
Content-Type: application/json

{
  "projectName": "Mobile Banking App"
}
```

#### Get Tasks
Lấy danh sách tasks:
```
GET /api/tasks?projectName=Mobile Banking App&status=pending&assignedTo=John
```

### Assignments API

#### Generate Assignments
Phân công tasks cho nhân viên (trigger Manage people workflow):
```
POST /api/assignments/generate
Content-Type: application/json

{}
```

#### Get Assignments
Lấy danh sách assignments:
```
GET /api/assignments?assignee=John&projectName=Mobile Banking App&status=assigned
```

### Reports API

#### Get Project Reports
Lấy báo cáo dự án:
```
GET /api/reports/projects
```

## Cấu trúc N8N Workflow

Workflow bao gồm 2 phần chính:

### 1. Upload Tài liệu
- Tìm và tải file từ Google Drive
- Chia nhỏ văn bản (Text Splitter)
- Tạo embeddings và lưu vào Pinecone Vector Store

### 2. Chat
- Nhận tin nhắn qua webhook
- Sử dụng AI Agent với OpenAI
- Tìm kiếm trong Pinecone Vector Store
- Trả lời dựa trên dữ liệu nội bộ

## Yêu cầu

- Node.js >= 14
- N8N instance đang chạy
- Supabase account và project
- Pinecone account và index
- OpenAI API key
- Google Drive API credentials (cho upload)

## Cấu hình Supabase trong N8N

Workflow đã được cập nhật với các node Supabase để tự động lưu:

1. **Chat History**: Mỗi tin nhắn và phản hồi từ AI agent sẽ được lưu vào bảng `chat_history`
2. **Upload Metadata**: Thông tin về các file đã upload sẽ được lưu vào bảng `document_uploads`

### Các node đã thêm vào workflow:

- **Format Chat Data**: Format dữ liệu chat trước khi lưu
- **Save Chat to Supabase**: Lưu chat history vào Supabase
- **Format Upload Data**: Format metadata upload trước khi lưu
- **Save Upload to Supabase**: Lưu upload metadata vào Supabase

### Cấu hình Supabase credentials trong N8N:

1. Mở N8N workflow
2. Click vào node "Save Chat to Supabase" hoặc "Save Upload to Supabase"
3. Chọn "Create New Credential" → "Postgres"
4. Điền thông tin:
   - **Host**: `db.your-project.supabase.co`
   - **Database**: `postgres`
   - **User**: `postgres`
   - **Password**: Supabase database password
   - **Port**: `5432`
   - **SSL**: Enable SSL

## Lưu ý

- Đảm bảo N8N workflow đã được active
- Kiểm tra các credentials trong N8N (Google Drive, OpenAI, Pinecone, Supabase)
- Webhook ID và Workflow ID phải khớp với N8N instance của bạn
- Chạy script `supabase-schema.sql` trong Supabase SQL Editor trước khi sử dụng

