-- Supabase Database Schema cho N8N Workflow
-- Chạy script này trong Supabase SQL Editor để tạo các bảng cần thiết

-- Bảng lưu lịch sử chat
CREATE TABLE IF NOT EXISTS chat_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL,
  user_message TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tạo index cho session_id để query nhanh hơn
CREATE INDEX IF NOT EXISTS idx_chat_history_session_id ON chat_history(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_timestamp ON chat_history(timestamp DESC);

-- Bảng lưu metadata của các file đã upload
CREATE TABLE IF NOT EXISTS document_uploads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  file_id VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_name VARCHAR(500),
  file_size BIGINT DEFAULT 0,
  upload_status VARCHAR(50) DEFAULT 'pending',
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tạo index cho file_id và upload_status
CREATE INDEX IF NOT EXISTS idx_document_uploads_file_id ON document_uploads(file_id);
CREATE INDEX IF NOT EXISTS idx_document_uploads_status ON document_uploads(upload_status);
CREATE INDEX IF NOT EXISTS idx_document_uploads_uploaded_at ON document_uploads(uploaded_at DESC);

-- Enable Row Level Security (RLS) - tùy chọn
-- ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE document_uploads ENABLE ROW LEVEL SECURITY;

-- Tạo policy để cho phép insert/select (tùy chọn)
-- CREATE POLICY "Allow all operations" ON chat_history FOR ALL USING (true);
-- CREATE POLICY "Allow all operations" ON document_uploads FOR ALL USING (true);

-- Bảng lưu thông tin dự án
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name_project VARCHAR(500) NOT NULL UNIQUE,
  description TEXT,
  requirements TEXT,
  deadline TIMESTAMPTZ,
  budget DECIMAL(12, 2) DEFAULT 0,
  team_size INTEGER DEFAULT 1,
  priority VARCHAR(20) DEFAULT 'medium',
  complexity_score DECIMAL(3, 2),
  risks JSONB DEFAULT '[]'::jsonb,
  recommendations JSONB DEFAULT '[]'::jsonb,
  required_skill JSONB DEFAULT '[]'::jsonb,
  estimated_hours DECIMAL(10, 2),
  timeline_estimate JSONB DEFAULT '{}'::jsonb,
  status VARCHAR(50) DEFAULT 'draft',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_name ON projects(name_project);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);

-- Bảng lưu tasks
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_name VARCHAR(500) NOT NULL,
  task_name VARCHAR(500) NOT NULL,
  task_description TEXT,
  priority VARCHAR(20) DEFAULT 'medium',
  estimated_hours DECIMAL(10, 2) NOT NULL,
  required_skills JSONB DEFAULT '[]'::jsonb,
  dependencies JSONB DEFAULT '[]'::jsonb,
  status VARCHAR(50) DEFAULT 'pending',
  assigned_to VARCHAR(255),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tasks_project_name ON tasks(project_name);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);

-- Bảng lưu assignments (phân công tasks)
CREATE TABLE IF NOT EXISTS assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_name VARCHAR(500) NOT NULL,
  task_name VARCHAR(500) NOT NULL,
  assignee VARCHAR(255) NOT NULL,
  hours_allocated DECIMAL(10, 2) NOT NULL,
  required_skills_matched JSONB DEFAULT '[]'::jsonb,
  reason TEXT,
  confidence DECIMAL(3, 2),
  status VARCHAR(50) DEFAULT 'assigned',
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assignments_assignee ON assignments(assignee);
CREATE INDEX IF NOT EXISTS idx_assignments_task_id ON assignments(task_id);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON assignments(status);

-- Bảng lưu logs và audit trail
CREATE TABLE IF NOT EXISTS project_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  assignment_id UUID REFERENCES assignments(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  changes JSONB DEFAULT '{}'::jsonb,
  user_id VARCHAR(255),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_logs_project_id ON project_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_project_logs_entity_type ON project_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_project_logs_created_at ON project_logs(created_at DESC);

-- Function để tự động cập nhật updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers để tự động cập nhật updated_at
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE chat_history IS 'Lưu lịch sử chat giữa user và AI agent';
COMMENT ON TABLE document_uploads IS 'Lưu metadata của các file đã upload và xử lý';
COMMENT ON TABLE projects IS 'Lưu thông tin các dự án';
COMMENT ON TABLE tasks IS 'Lưu các tasks của dự án';
COMMENT ON TABLE assignments IS 'Lưu phân công tasks cho nhân viên';
COMMENT ON TABLE project_logs IS 'Lưu logs và audit trail cho các thao tác';

