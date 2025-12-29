-- Wise Project Management System
-- Supabase Database Setup Script
-- Run this in Supabase SQL Editor

-- 1. Create employees table
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name_ar TEXT NOT NULL,
  full_name_en TEXT,
  role TEXT CHECK (role IN ('admin', 'employee')) DEFAULT 'employee',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create companies table
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar TEXT NOT NULL,
  name_en TEXT,
  legal_entity TEXT,
  sector TEXT,
  tax_authority TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create task_categories table
CREATE TABLE IF NOT EXISTS task_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  classification TEXT NOT NULL,
  task_type TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  category_id UUID REFERENCES task_categories(id) ON DELETE SET NULL,
  description TEXT,
  priority TEXT CHECK (priority IN ('critical', 'high', 'medium', 'low')) DEFAULT 'medium',
  status TEXT CHECK (status IN ('open', 'in_progress', 'done')) DEFAULT 'open',
  scheduled_time INTERVAL,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  assigned_to UUID REFERENCES employees(id) ON DELETE SET NULL,
  reviewed_by UUID REFERENCES employees(id) ON DELETE SET NULL,
  notes TEXT,
  created_by UUID REFERENCES employees(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create task_history table
CREATE TABLE IF NOT EXISTS task_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  changed_by UUID REFERENCES employees(id) ON DELETE SET NULL,
  old_status TEXT,
  new_status TEXT,
  notes TEXT,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tasks_company ON tasks(company_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_created ON tasks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_task_history_task ON task_history(task_id);

-- Enable Row Level Security
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow all for now (todo: add proper auth)
CREATE POLICY "Allow all on employees" ON employees FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on companies" ON companies FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on task_categories" ON task_categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on tasks" ON tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on task_history" ON task_history FOR ALL USING (true) WITH CHECK (true);

-- Insert default admin user (password: admin123)
INSERT INTO employees (username, password_hash, full_name_ar, full_name_en, role)
VALUES ('admin', 'admin123', 'مدير النظام', 'System Admin', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Insert sample employees from the Excel
INSERT INTO employees (username, password_hash, full_name_ar, full_name_en, role) VALUES
('mohamed.ismail', 'wise123', 'محمد إسماعيل', 'Mohamed Ismail', 'employee'),
('abdelrahman.amr', 'wise123', 'عبدالرحمن عمرو', 'Abdelrahman Amr', 'employee'),
('abdalla.saber', 'wise123', 'عبدالله صابر', 'Abdalla Saber', 'employee'),
('salsabel.abdelgalil', 'wise123', 'سلسبيل عبدالجليل', 'Salsabel Abdelgalil', 'employee')
ON CONFLICT (username) DO NOTHING;

-- Insert task categories from the Excel
INSERT INTO task_categories (classification, task_type) VALUES
-- إقرارات ضريبية
('إقرارات ضريبية', 'إقرار ضريبة القيمة المضافة'),
('إقرارات ضريبية', 'إقرار ضريبة المرتبات'),
('إقرارات ضريبية', 'نموذج# 4 "ربع سنوي" ضريبة المرتبات'),
('إقرارات ضريبية', 'نموذج# 6 "تسوية سنوي" ضريبة المرتبات'),
('إقرارات ضريبية', 'نموذج 41 "ربع سنوي" خصم واضافة'),
('إقرارات ضريبية', 'إقرار "سنوي" الضريبة على الدخل'),
-- مراجعة
('مراجعة', 'تقرير مراجعة دورية'),
('مراجعة', 'تقرير مراجعة سنوي وإصدار القوائم المالية'),
-- تسجيل حسابات
('تسجيل حسابات', 'تسجيل المعاملات وفقا لنظام المحاسبي للشركة'),
-- فحص ضريبي
('فحص ضريبي', 'فحص ضريبة الدخل'),
('فحص ضريبي', 'فحص ضريبة المرتبات'),
('فحص ضريبي', 'فحص ضريبة الخصم والاضافة'),
('فحص ضريبي', 'فحص ضريبة القيمة المضافة'),
('فحص ضريبي', 'فحص ضريبة الدمغة'),
-- تأسيس الشركات
('تأسيس الشركات', 'جمعية عادية'),
('تأسيس الشركات', 'جمعية غير عادية'),
-- مستخرجات رسمية
('مستخرجات رسمية', 'التسجيل في التشييد والبناء'),
('مستخرجات رسمية', 'إقامة / ترخيص عمل اجنبي'),
('مستخرجات رسمية', 'بطاقة ضريبية'),
('مستخرجات رسمية', 'شهادة قيمة مضافة'),
('مستخرجات رسمية', 'صحيفة استثمار'),
('مستخرجات رسمية', 'صورة طبق الأصل'),
('مستخرجات رسمية', 'رخصة صناعية'),
('مستخرجات رسمية', 'سجل صناعي'),
('مستخرجات رسمية', 'بطاقة السمسرة العقارية'),
('مستخرجات رسمية', 'بطاقة استيرادية'),
('مستخرجات رسمية', 'رخصة اتجار'),
('مستخرجات رسمية', 'مستخرج أخرى'),
('مستخرجات رسمية', 'شهادة التسجيل في الفاتورة الإليكترونية'),
('مستخرجات رسمية', 'نظام الدفعات المقدمة'),
('مستخرجات رسمية', 'شهادة النقل البري'),
('مستخرجات رسمية', 'شهادة التيسيرات الضريبية'),
-- التأمينات الاجتماعية
('التأمينات الاجتماعية', 'فتح ملف تامينات'),
('التأمينات الاجتماعية', 'تسجيل استمارات التامينات'),
-- أخرى
('أخرى', 'أكواد المرتبات'),
('أخرى', 'أخرى')
ON CONFLICT DO NOTHING;

-- Insert sample companies from the Excel
INSERT INTO companies (name_ar, name_en, legal_entity, sector, tax_authority) VALUES
('جرانري للتبريد المحدودة', 'Granary Cooling Ltd', 'مسئولية محدودة - صيني', 'تصنيع', 'الاستثمار'),
('فوفنغ لتكنولوجيا التعبئة والتغليف', 'Fofeng Packaging Technology', 'مسئولية محدودة - صيني', 'تصنيع', 'الاستثمار'),
('سبايد للإستشارات', 'Spide Consulting', 'مسئولية محدودة', 'خدمات اعلان', 'المساهمة بالقاهرة'),
('مايندز اند ماشينز للدعاية والاعلان', 'Minds and Machines Advertising', 'مسئولية محدودة', 'خدمات اعلان', 'المساهمة بالقاهرة'),
('بوديو ميديا للإنتاج الفني والتوزيع', 'Podio Media Production', 'مسئولية محدودة', 'خدمات اعلان', 'عابدين'),
('داين ديجيتال', 'Dine Digital', 'مسئولية محدودة', 'خدمات اعلان', 'المساهمة بالقاهرة'),
('ستريك ادز', 'Strike Ads', 'مسئولية محدودة', 'خدمات اعلان', 'المساهمة بالقاهرة'),
('بلاك اوكس ديزاينر', 'Black Ox Designer', 'مسئولية محدودة', 'خدمات اعلان', 'الاستثمار'),
('مستشفى ميدي برايد', 'Medi Pride Hospital', 'مسئولية محدودة', 'طبي', 'المساهمة بالقاهرة'),
('مركز ريفيرا الطبي', 'Rivera Medical Center', 'مسئولية محدودة', 'طبي', 'المساهمة بالقاهرة'),
('اشرف شعبان', 'Ashraf Shaaban', 'فردي', 'ثروة عقارية', '6 أكتوبر'),
('كاليميرا', 'Kalimera', 'فردي', 'مطاعم', '6 أكتوبر'),
('الزيتون - حسن أحمد حسن علي', 'Al-Zaytoun', 'فردي', 'تجارة وإستيراد', 'الجيزة ثان'),
('شركة المزارع', 'Al-Mazaree Company', 'مساهمة', 'اسمدة زراعية', 'كبار ثان'),
('محمد حسين سعد الدين', 'Mohamed Hussein Saad El-Din', 'فردي', 'تجارة', 'شبرا الخيمة ثان')
ON CONFLICT DO NOTHING;

-- Success message
SELECT 'Database setup completed successfully!' as message;
