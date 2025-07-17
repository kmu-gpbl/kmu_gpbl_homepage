-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  specialties TEXT[] DEFAULT '{}',
  bio TEXT NOT NULL,
  avatar TEXT,
  github TEXT,
  linkedin TEXT,
  portfolio TEXT,
  email TEXT,
  skills TEXT[] DEFAULT '{}',
  experience TEXT,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  period TEXT,
  status TEXT NOT NULL,
  type TEXT NOT NULL,
  technologies TEXT[] DEFAULT '{}',
  team_size INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project members junction table (many-to-many relationship)
CREATE TABLE project_members (
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, user_id)
);

-- Project media table
CREATE TABLE project_media (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  url TEXT,
  description TEXT,
  file_name TEXT,
  original_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_media ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Users are viewable by everyone" ON users
  FOR SELECT USING (true);

CREATE POLICY "Projects are viewable by everyone" ON projects
  FOR SELECT USING (true);

CREATE POLICY "Project members are viewable by everyone" ON project_members
  FOR SELECT USING (true);

CREATE POLICY "Project media are viewable by everyone" ON project_media
  FOR SELECT USING (true);

-- Create policies for authenticated users to insert/update/delete
CREATE POLICY "Users can be created by authenticated users" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can be updated by authenticated users" ON users
  FOR UPDATE USING (true);

CREATE POLICY "Users can be deleted by authenticated users" ON users
  FOR DELETE USING (true);

CREATE POLICY "Projects can be created by authenticated users" ON projects
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Projects can be updated by authenticated users" ON projects
  FOR UPDATE USING (true);

CREATE POLICY "Projects can be deleted by authenticated users" ON projects
  FOR DELETE USING (true);

CREATE POLICY "Project members can be created by authenticated users" ON project_members
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Project members can be updated by authenticated users" ON project_members
  FOR UPDATE USING (true);

CREATE POLICY "Project members can be deleted by authenticated users" ON project_members
  FOR DELETE USING (true);

CREATE POLICY "Project media can be created by authenticated users" ON project_media
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Project media can be updated by authenticated users" ON project_media
  FOR UPDATE USING (true);

CREATE POLICY "Project media can be deleted by authenticated users" ON project_media
  FOR DELETE USING (true);

-- Create indexes for better performance
CREATE INDEX idx_users_name ON users(name);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_specialties ON users USING GIN(specialties);
CREATE INDEX idx_users_skills ON users USING GIN(skills);

CREATE INDEX idx_projects_title ON projects(title);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_type ON projects(type);
CREATE INDEX idx_projects_start_date ON projects(start_date);
CREATE INDEX idx_projects_technologies ON projects USING GIN(technologies);

CREATE INDEX idx_project_members_project_id ON project_members(project_id);
CREATE INDEX idx_project_members_user_id ON project_members(user_id);

CREATE INDEX idx_project_media_project_id ON project_media(project_id);
CREATE INDEX idx_project_media_type ON project_media(type);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 