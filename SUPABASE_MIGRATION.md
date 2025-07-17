# Supabase 마이그레이션 가이드

이 프로젝트는 JSON 파일 기반 데이터 저장에서 Supabase PostgreSQL 데이터베이스로 마이그레이션되었습니다.

## 🚀 마이그레이션 완료된 기능

- ✅ 사용자 관리 (CRUD)
- ✅ 프로젝트 관리 (CRUD)
- ✅ 프로젝트-멤버 관계 관리
- ✅ 프로젝트 미디어 관리
- ✅ 실시간 데이터 업데이트
- ✅ 데이터베이스 인덱싱 및 최적화

## 📋 설정 단계

### 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에 가입
2. 새 프로젝트 생성
3. 프로젝트 URL과 API 키 복사

### 2. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 3. 데이터베이스 스키마 설정

Supabase 대시보드의 SQL 편집기에서 `supabase/schema.sql` 파일의 내용을 실행:

```sql
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

-- Project members junction table
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

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_media ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Users are viewable by everyone" ON users FOR SELECT USING (true);
CREATE POLICY "Projects are viewable by everyone" ON projects FOR SELECT USING (true);
CREATE POLICY "Project members are viewable by everyone" ON project_members FOR SELECT USING (true);
CREATE POLICY "Project media are viewable by everyone" ON project_media FOR SELECT USING (true);

-- Create policies for authenticated users
CREATE POLICY "Users can be created by authenticated users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can be updated by authenticated users" ON users FOR UPDATE USING (true);
CREATE POLICY "Users can be deleted by authenticated users" ON users FOR DELETE USING (true);

CREATE POLICY "Projects can be created by authenticated users" ON projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Projects can be updated by authenticated users" ON projects FOR UPDATE USING (true);
CREATE POLICY "Projects can be deleted by authenticated users" ON projects FOR DELETE USING (true);

CREATE POLICY "Project members can be created by authenticated users" ON project_members FOR INSERT WITH CHECK (true);
CREATE POLICY "Project members can be updated by authenticated users" ON project_members FOR UPDATE USING (true);
CREATE POLICY "Project members can be deleted by authenticated users" ON project_members FOR DELETE USING (true);

CREATE POLICY "Project media can be created by authenticated users" ON project_media FOR INSERT WITH CHECK (true);
CREATE POLICY "Project media can be updated by authenticated users" ON project_media FOR UPDATE USING (true);
CREATE POLICY "Project media can be deleted by authenticated users" ON project_media FOR DELETE USING (true);

-- Create indexes
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

-- Create triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 4. 기존 데이터 마이그레이션

마이그레이션 스크립트를 실행하여 기존 JSON 데이터를 Supabase로 이전:

```bash
# TypeScript 실행을 위한 tsx 설치
npm install -g tsx

# 마이그레이션 실행
tsx scripts/migrate-to-supabase.ts
```

## 🔧 API 사용법

### 사용자 API

```typescript
import { api } from "@/lib/supabase-api";

// 모든 사용자 조회
const users = await api.users.getAll();

// 특정 사용자 조회
const user = await api.users.getById("user_id");

// 사용자 생성
const newUser = await api.users.create({
  name: "John Doe",
  role: "Frontend Developer",
  specialties: ["frontend"],
  bio: "프론트엔드 개발자입니다.",
  // ... 기타 필드
});

// 사용자 수정
const updatedUser = await api.users.update("user_id", {
  name: "Jane Doe",
  bio: "업데이트된 소개",
});

// 사용자 삭제
await api.users.delete("user_id");
```

### 프로젝트 API

```typescript
// 모든 프로젝트 조회
const projects = await api.projects.getAll();

// 특정 멤버의 프로젝트 조회
const memberProjects = await api.projects.getByMemberId("user_id");

// 프로젝트 생성
const newProject = await api.projects.create({
  title: "새 프로젝트",
  description: "프로젝트 설명",
  start_date: "2024-01-01",
  status: "ongoing",
  type: "web",
  team_size: 3,
  // ... 기타 필드
});

// 프로젝트 멤버 추가
await api.projectMembers.addMember("project_id", "user_id");

// 프로젝트 미디어 추가
await api.projectMedia.create({
  project_id: "project_id",
  type: "video",
  title: "프로젝트 영상",
  url: "https://youtube.com/...",
});
```

## 🎯 주요 개선사항

### 1. 데이터 일관성

- PostgreSQL의 ACID 속성으로 데이터 무결성 보장
- 외래 키 제약 조건으로 관계 데이터 보호

### 2. 성능 최적화

- 인덱스를 통한 빠른 검색
- 배열 타입을 활용한 효율적인 태그/기술 스택 저장

### 3. 확장성

- 대용량 데이터 처리 가능
- 실시간 기능 지원

### 4. 보안

- Row Level Security (RLS) 적용
- API 키 기반 인증

### 5. 개발자 경험

- TypeScript 타입 안전성
- 자동 완성 지원
- 실시간 에러 처리

## 🔄 기존 코드와의 호환성

기존 API 라우트는 그대로 유지되며, 내부적으로만 Supabase를 사용하도록 변경되었습니다:

- `/api/users` - 사용자 CRUD
- `/api/users/[id]` - 개별 사용자 관리
- `/api/projects` - 프로젝트 CRUD
- `/api/projects/[id]` - 개별 프로젝트 관리

## 🚨 주의사항

1. **환경 변수 설정**: `.env.local` 파일이 올바르게 설정되었는지 확인
2. **데이터베이스 스키마**: Supabase에서 스키마가 정확히 생성되었는지 확인
3. **마이그레이션**: 기존 데이터 마이그레이션 후 테스트 필수
4. **백업**: 중요한 데이터는 정기적으로 백업

## 📞 문제 해결

### 일반적인 오류

1. **환경 변수 오류**

   ```
   Error: NEXT_PUBLIC_SUPABASE_URL is not defined
   ```

   → `.env.local` 파일 확인

2. **테이블 없음 오류**

   ```
   Error: relation "users" does not exist
   ```

   → Supabase에서 스키마 실행 확인

3. **권한 오류**
   ```
   Error: new row violates row-level security policy
   ```
   → RLS 정책 확인

### 지원

문제가 발생하면 다음을 확인해주세요:

1. Supabase 대시보드의 로그 확인
2. 브라우저 개발자 도구의 네트워크 탭 확인
3. 환경 변수 설정 재확인

---

🎉 **마이그레이션 완료!** 이제 더 안정적이고 확장 가능한 백엔드 시스템을 사용할 수 있습니다.
