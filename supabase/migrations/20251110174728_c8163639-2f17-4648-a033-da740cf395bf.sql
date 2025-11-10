-- Создаем таблицу для ПВЗ
CREATE TABLE IF NOT EXISTS public.pvz_locations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  china_warehouse_address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Включаем RLS
ALTER TABLE public.pvz_locations ENABLE ROW LEVEL SECURITY;

-- Политики для ПВЗ
CREATE POLICY "Все видят ПВЗ" ON public.pvz_locations
  FOR SELECT USING (true);

CREATE POLICY "Админы управляют ПВЗ" ON public.pvz_locations
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Триггер для обновления updated_at
CREATE TRIGGER update_pvz_locations_updated_at
  BEFORE UPDATE ON public.pvz_locations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Добавляем начальные данные ПВЗ
INSERT INTO public.pvz_locations (id, name, address, china_warehouse_address)
VALUES 
  ('YQ', 'Нариман', 'Ул. Сулайманова 32', '浙江省金华市义乌市北苑街道春晗四区59栋佑途国际797库入库号'),
  ('YX', 'Жийдалик', 'УПТК Наби Кожо 61Б', '浙江省金华市义乌市北苑街道春晗四区59栋佑途国际797库入库号'),
  ('JL', 'Достук', 'Ул. Хабиба Абдуллаева 78', '浙江省金华市义乌市北苑街道春晗四区59栋佑途国际797库入库号')
ON CONFLICT (id) DO NOTHING;

-- Обновляем таблицу настроек для контактов
ALTER TABLE public.settings 
ADD COLUMN IF NOT EXISTS contact_telegram TEXT,
ADD COLUMN IF NOT EXISTS contact_whatsapp TEXT,
ADD COLUMN IF NOT EXISTS contact_email TEXT,
ADD COLUMN IF NOT EXISTS contact_phone TEXT;