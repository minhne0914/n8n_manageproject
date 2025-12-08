# Cải thiện Workflows N8N

## Đã thực hiện

### 1. ManageProject Workflow
✅ **Đã thêm:**
- Success Response node để trả về kết quả thành công
- Đã có validation và error handling tốt
- Đã có node lưu vào Supabase (PostgreSQL)

**Cần cấu hình:**
- Đảm bảo PostgreSQL credentials trong N8N trỏ đến Supabase
- Test webhook endpoint với backend API

### 2. Manage task Workflow
⚠️ **Cần cải thiện:**
- Thêm webhook trigger option (hiện chỉ có schedule trigger)
- Thêm node lưu tasks vào Supabase sau khi generate
- Thêm validation cho input data

**Đề xuất:**
- Thêm webhook node song song với schedule trigger
- Thêm node PostgreSQL để lưu tasks vào Supabase
- Thêm error handling

### 3. Manage people Workflow
⚠️ **Cần cải thiện:**
- Enable email notifications (hiện đang disabled)
- Thêm webhook trigger option
- Thêm node lưu assignments vào Supabase
- Cải thiện error handling

**Đề xuất:**
- Enable và cấu hình email node
- Thêm webhook trigger
- Thêm node PostgreSQL để lưu assignments
- Thêm logging vào Supabase

## Hướng dẫn cấu hình

### 1. Cấu hình Supabase trong N8N

1. Mở N8N → Credentials → Add Credential
2. Chọn "Postgres"
3. Điền thông tin:
   - **Host**: `db.your-project.supabase.co`
   - **Database**: `postgres`
   - **User**: `postgres`
   - **Password**: [Supabase database password]
   - **Port**: `5432`
   - **SSL**: Enable

### 2. Cập nhật Workflows

#### ManageProject
- Node "Insert or update rows in a table" đã được cấu hình
- Cần đảm bảo credentials trỏ đến Supabase
- Test với API endpoint: `POST /api/projects`

#### Manage task
- Cần thêm node PostgreSQL sau AI Agent
- Map các fields: project_name, task_name, task_description, priority, estimated_hours, required_skills, dependencies
- Test với API endpoint: `POST /api/tasks/generate`

#### Manage people
- Cần thêm node PostgreSQL sau AI Agent
- Map các fields: project_name, task_name, assignee, hours_allocated, required_skills_matched, reason, confidence
- Enable email node và cấu hình SMTP
- Test với API endpoint: `POST /api/assignments/generate`

## Testing

### Test Projects API
```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "project_name": "Test Project",
    "description": "Test description",
    "deadline": "2024-12-31",
    "priority": "high"
  }'
```

### Test Tasks Generation
```bash
curl -X POST http://localhost:3000/api/tasks/generate \
  -H "Content-Type: application/json" \
  -d '{
    "projectName": "Test Project"
  }'
```

### Test Assignments Generation
```bash
curl -X POST http://localhost:3000/api/assignments/generate \
  -H "Content-Type: application/json" \
  -d '{}'
```

## Next Steps

1. ✅ Backend API đã được tạo
2. ✅ Database schema đã được tạo
3. ⚠️ Cần cấu hình Supabase credentials trong N8N
4. ⚠️ Cần test các workflows với backend API
5. ⚠️ Cần thêm nodes lưu vào Supabase cho Manage task và Manage people workflows
6. ⚠️ Cần enable và cấu hình email notifications

