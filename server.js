const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const axios = require("axios");
const { createClient } = require("@supabase/supabase-js");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Serve simple UI
app.use(express.static('public'));

// N8N Configuration
<<<<<<< HEAD
const N8N_BASE_URL = process.env.N8N_BASE_URL || "http://localhost:5678";
=======
const N8N_BASE_URL = (process.env.N8N_BASE_URL || 'https://recursive-lauryn-undefrauded.ngrok-free.dev').trim();
>>>>>>> bd6cd26 (update server)
const N8N_API_KEY = process.env.N8N_API_KEY;
const N8N_WEBHOOK_ID =
  process.env.N8N_WEBHOOK_ID || "0a30838e-59c4-484c-8b87-2d84dc78e992";
const N8N_WORKFLOW_ID = process.env.N8N_WORKFLOW_ID || "29VVaah6aHg7xOwc";

// N8N Workflow IDs
const WORKFLOW_IDS = {
  PROJECT: process.env.N8N_WORKFLOW_PROJECT_ID || "f6mhSm7CAhvmLoQm",
  TASK: process.env.N8N_WORKFLOW_TASK_ID || "IEpB7zTzZYbQafSv",
  PEOPLE: process.env.N8N_WORKFLOW_PEOPLE_ID || "TNTiFypSpv9Rt8Wt",
  CHAT: process.env.N8N_WORKFLOW_CHAT_ID || "29VVaah6aHg7xOwc",
};

// N8N Webhook IDs
const WEBHOOK_IDS = {
  PROJECT: process.env.N8N_WEBHOOK_PROJECT_ID || "project-input-webhook",
  TASK: process.env.N8N_WEBHOOK_TASK_ID,
  PEOPLE: process.env.N8N_WEBHOOK_PEOPLE_ID,
};

// Supabase Configuration
let supabase = null;
if (process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
<<<<<<< HEAD
  supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
  console.log("✅ Supabase client initialized");
=======
  // Nếu SUPABASE_URL là PostgreSQL connection string, extract project ref
  let supabaseUrl = process.env.SUPABASE_URL.trim();
  
  // Kiểm tra nếu là PostgreSQL connection string
  if (supabaseUrl.startsWith('postgresql://')) {
    // Extract project ref từ connection string
    // Format: postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres
    const match = supabaseUrl.match(/db\.([^.]+)\.supabase\.co/);
    if (match && match[1]) {
      supabaseUrl = `https://${match[1]}.supabase.co`;
      console.log('🔄 Converted PostgreSQL URL to REST API URL:', supabaseUrl);
    } else {
      console.error('❌ Could not extract Supabase project ref from connection string');
    }
  }
  
  if (supabaseUrl.startsWith('https://')) {
    supabase = createClient(supabaseUrl, process.env.SUPABASE_KEY.trim());
    console.log('✅ Supabase client initialized');
  } else {
    console.log('⚠️  Supabase URL must start with https://');
  }
>>>>>>> bd6cd26 (update server)
} else {
  console.log(
    "⚠️  Supabase not configured (SUPABASE_URL and SUPABASE_KEY required)"
  );
}

// Routes
app.get("/", (req, res) => {
  res.json({
    message: "N8N Backend API",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      // Chat & Upload
      chat: "/api/chat",
      upload: "/api/upload",
      chatHistory: "/api/chat/history",
      uploads: "/api/uploads",
      // Projects
      projects: "/api/projects",
      createProject: "/api/projects",
      // Tasks
      generateTasks: "/api/tasks/generate",
      tasks: "/api/tasks",
      // Assignments
      generateAssignments: "/api/assignments/generate",
      assignments: "/api/assignments",
      // Reports
      reports: "/api/reports",
    },
  });
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Chat endpoint - gửi tin nhắn đến n8n webhook
app.post("/api/chat", async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Gửi tin nhắn đến n8n webhook
    const webhookUrl = `${N8N_BASE_URL}/webhook/${N8N_WEBHOOK_ID}`;

    const response = await axios.post(
      webhookUrl,
      {
        message,
        sessionId: sessionId || "default-session",
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    res.json({
      success: true,
      response: response.data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Chat error:", error.message);
    res.status(500).json({
      error: "Failed to process chat message",
      message: error.message,
    });
  }
});

// Upload document endpoint - trigger workflow upload
app.post("/api/upload", async (req, res) => {
  try {
    const { fileUrl, fileId } = req.body;

    if (!fileUrl && !fileId) {
      return res.status(400).json({ error: "fileUrl or fileId is required" });
    }

    // Trigger n8n workflow để upload tài liệu
    const workflowUrl = `${N8N_BASE_URL}/api/v1/workflows/${N8N_WORKFLOW_ID}/execute`;

    const payload = {
      data: {
        fileUrl: fileUrl || `https://docs.google.com/document/d/${fileId}/edit`,
        fileId: fileId,
      },
    };

    const headers = {};
    if (N8N_API_KEY) {
      headers["X-N8N-API-KEY"] = N8N_API_KEY;
    }

    const response = await axios.post(workflowUrl, payload, { headers });

    res.json({
      success: true,
      executionId: response.data?.executionId,
      message: "Document upload workflow triggered",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Upload error:", error.message);
    res.status(500).json({
      error: "Failed to trigger upload workflow",
      message: error.message,
    });
  }
});

// Webhook endpoint để nhận response từ n8n
app.post("/webhook/chat", (req, res) => {
  try {
    const data = req.body;
    console.log("Received webhook from n8n:", data);

    // Xử lý response từ n8n nếu cần
    res.json({
      success: true,
      received: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Webhook error:", error.message);
    res.status(500).json({
      error: "Failed to process webhook",
      message: error.message,
    });
  }
});

// Get workflow status
app.get("/api/workflow/status", async (req, res) => {
  try {
    const { executionId } = req.query;

    if (!executionId) {
      return res.status(400).json({ error: "executionId is required" });
    }

    const statusUrl = `${N8N_BASE_URL}/api/v1/executions/${executionId}`;

    const headers = {};
    if (N8N_API_KEY) {
      headers["X-N8N-API-KEY"] = N8N_API_KEY;
    }

    const response = await axios.get(statusUrl, { headers });

    res.json({
      success: true,
      execution: response.data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Status check error:", error.message);
    res.status(500).json({
      error: "Failed to get workflow status",
      message: error.message,
    });
  }
});

// Get chat history from Supabase
app.get("/api/chat/history", async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: "Supabase not configured" });
    }

    const { sessionId, limit = 50, offset = 0 } = req.query;

    let query = supabase
      .from("chat_history")
      .select("*")
      .order("timestamp", { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    if (sessionId) {
      query = query.eq("session_id", sessionId);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data,
      count: data.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Chat history error:", error.message);
    res.status(500).json({
      error: "Failed to fetch chat history",
      message: error.message,
    });
  }
});

// Get document uploads from Supabase
app.get("/api/uploads", async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: "Supabase not configured" });
    }

    const { limit = 50, offset = 0, status } = req.query;

    let query = supabase
      .from("document_uploads")
      .select("*")
      .order("uploaded_at", { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    if (status) {
      query = query.eq("upload_status", status);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data,
      count: data.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Uploads error:", error.message);
    res.status(500).json({
      error: "Failed to fetch uploads",
      message: error.message,
    });
  }
});

// ==================== PROJECTS API ====================

// Create project - trigger ManageProject workflow
app.post("/api/projects", async (req, res) => {
  try {
    const projectData = req.body;

    // Validate required fields
    if (!projectData.project_name || !projectData.description) {
      return res.status(400).json({
        error: "project_name and description are required",
      });
    }

    // Trigger n8n workflow
    const webhookUrl = `${N8N_BASE_URL}/webhook/${WEBHOOK_IDS.PROJECT}`;
<<<<<<< HEAD

    const response = await axios.post(webhookUrl, projectData, {
      headers: {
        "Content-Type": "application/json",
        "x-user-id": req.headers["x-user-id"] || "anonymous",
      },
=======
    
    console.log('Calling webhook URL:', webhookUrl);
    console.log('Project data:', JSON.stringify(projectData, null, 2));
    
    const response = await axios.post(webhookUrl, projectData, {
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': req.headers['x-user-id'] || 'anonymous',
        // Thêm headers cho ngrok nếu cần
        'ngrok-skip-browser-warning': 'true'
      },
      timeout: 30000 // 30 seconds timeout
>>>>>>> bd6cd26 (update server)
    });

    res.json({
      success: true,
      data: response.data,
      message: "Project creation workflow triggered",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
<<<<<<< HEAD
    console.error("Create project error:", error.message);
    res.status(500).json({
      error: "Failed to create project",
      message: error.message,
=======
    console.error('Create project error:', error.message);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url
    });
    
    res.status(500).json({
      error: 'Failed to create project',
      message: error.message,
      details: error.response?.data || error.message,
      url: error.config?.url
>>>>>>> bd6cd26 (update server)
    });
  }
});

// Get projects from Supabase
app.get("/api/projects", async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: "Supabase not configured" });
    }

    const { limit = 50, offset = 0, status, search } = req.query;

    let query = supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    if (status) {
      query = query.eq("status", status);
    }

    if (search) {
      query = query.or(
        `name_project.ilike.%${search}%,description.ilike.%${search}%`
      );
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({
      success: true,
      data,
      count: data.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Get projects error:", error.message);
    res.status(500).json({
      error: "Failed to fetch projects",
      message: error.message,
    });
  }
});

// Get project by ID
app.get("/api/projects/:id", async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: "Supabase not configured" });
    }

    const { id } = req.params;

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Get project error:", error.message);
    res.status(500).json({
      error: "Failed to fetch project",
      message: error.message,
    });
  }
});

// ==================== TASKS API ====================

// Generate tasks from project - trigger Manage task workflow
app.post("/api/tasks/generate", async (req, res) => {
  try {
    const { projectName } = req.body;

    if (!projectName) {
      return res.status(400).json({ error: "projectName is required" });
    }

    // Trigger n8n workflow via API
    const workflowUrl = `${N8N_BASE_URL}/api/v1/workflows/${WORKFLOW_IDS.TASK}/execute`;

    const payload = {
      data: {
        projectName,
      },
    };

    const headers = {};
    if (N8N_API_KEY) {
      headers["X-N8N-API-KEY"] = N8N_API_KEY;
    }

    const response = await axios.post(workflowUrl, payload, { headers });

    res.json({
      success: true,
      executionId: response.data?.executionId,
      message: "Task generation workflow triggered",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Generate tasks error:", error.message);
    res.status(500).json({
      error: "Failed to generate tasks",
      message: error.message,
    });
  }
});

// Get tasks from Supabase
app.get("/api/tasks", async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: "Supabase not configured" });
    }

    const {
      limit = 50,
      offset = 0,
      projectName,
      status,
      assignedTo,
    } = req.query;

    let query = supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    if (projectName) {
      query = query.eq("project_name", projectName);
    }

    if (status) {
      query = query.eq("status", status);
    }

    if (assignedTo) {
      query = query.eq("assigned_to", assignedTo);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({
      success: true,
      data,
      count: data.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Get tasks error:", error.message);
    res.status(500).json({
      error: "Failed to fetch tasks",
      message: error.message,
    });
  }
});

// ==================== ASSIGNMENTS API ====================

// Generate assignments - trigger Manage people workflow
app.post("/api/assignments/generate", async (req, res) => {
  try {
    // Trigger n8n workflow via API
    const workflowUrl = `${N8N_BASE_URL}/api/v1/workflows/${WORKFLOW_IDS.PEOPLE}/execute`;

    const payload = {
      data: req.body || {},
    };

    const headers = {};
    if (N8N_API_KEY) {
      headers["X-N8N-API-KEY"] = N8N_API_KEY;
    }

    const response = await axios.post(workflowUrl, payload, { headers });

    res.json({
      success: true,
      executionId: response.data?.executionId,
      message: "Assignment generation workflow triggered",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Generate assignments error:", error.message);
    res.status(500).json({
      error: "Failed to generate assignments",
      message: error.message,
    });
  }
});

// Get assignments from Supabase
app.get("/api/assignments", async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: "Supabase not configured" });
    }

    const { limit = 50, offset = 0, assignee, projectName, status } = req.query;

    let query = supabase
      .from("assignments")
      .select("*")
      .order("created_at", { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    if (assignee) {
      query = query.eq("assignee", assignee);
    }

    if (projectName) {
      query = query.eq("project_name", projectName);
    }

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({
      success: true,
      data,
      count: data.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Get assignments error:", error.message);
    res.status(500).json({
      error: "Failed to fetch assignments",
      message: error.message,
    });
  }
});

// ==================== REPORTS API ====================

// Get project reports
app.get("/api/reports/projects", async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: "Supabase not configured" });
    }

    const { data: projects, error } = await supabase
      .from("projects")
      .select(
        "id, name_project, status, complexity_score, estimated_hours, created_at"
      );

    if (error) throw error;

    const stats = {
      total: projects.length,
      byStatus: {},
      avgComplexity: 0,
      totalEstimatedHours: 0,
    };

    projects.forEach((p) => {
      stats.byStatus[p.status] = (stats.byStatus[p.status] || 0) + 1;
      if (p.complexity_score) {
        stats.avgComplexity += parseFloat(p.complexity_score);
      }
      if (p.estimated_hours) {
        stats.totalEstimatedHours += parseFloat(p.estimated_hours);
      }
    });

    stats.avgComplexity = stats.avgComplexity / projects.length || 0;

    res.json({
      success: true,
      stats,
      projects,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Get reports error:", error.message);
    res.status(500).json({
      error: "Failed to generate reports",
      message: error.message,
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📡 N8N Base URL: ${N8N_BASE_URL}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`💬 Chat API: http://localhost:${PORT}/api/chat`);
  console.log(`📤 Upload API: http://localhost:${PORT}/api/upload`);
});

app.use(bodyParser.urlencoded({ extended: true }));
// Serve simple UI
app.use(express.static("public"));
