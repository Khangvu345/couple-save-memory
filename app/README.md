# Bộ phim của chúng ta — Phase 1

Web kỷ niệm cho hai đứa: Next.js (App Router) + Tailwind + Supabase, deploy trên Vercel.
Chạy được ngay cả khi chưa có Supabase (dùng dữ liệu mẫu).

## 1. Chuẩn bị Supabase (5 phút)

1. Tạo project miễn phí ở https://supabase.com → **New project**.
2. Vào **SQL Editor** → dán toàn bộ file `supabase/migrations/001_init.sql` → **Run**.
   - Nhớ sửa `'doi-pin-cua-ban'` thành mã PIN thật của hai đứa (4–6 số, cả hai cùng biết).
   - Sửa `name_a`, `name_b`, `start_date` cho đúng.
3. Vào **Project Settings → API**, copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (giữ bí mật!)
4. Vào **Table Editor → couples**, copy `id` → `COUPLE_ID`.

## 2. Chạy local

```bash
cd app
cp .env.example .env.local   # rồi điền 4 giá trị ở bước 1
npm install
npm run dev
```

Mở http://localhost:3000 — bản mobile đẹp nhất khi mở bằng điện thoại
hoặc DevTools chế độ mobile (390px).

## 3. Thêm nội dung thật

Phase 1 chưa có trang admin — thêm nội dung trực tiếp trong Supabase:

- **Table Editor**: thêm dòng vào `memories`, `little_things`, `wishes`.
  - `memories.layout`: `polaroid` | `big` | `quote` | `pair` | `standard`
  - `photos`: mảng URL, ví dụ `{"https://.../a.jpg","https://.../b.jpg"}`
- **Storage → couple-photos**: upload ảnh, copy **public URL** dán vào `photos`.
- Ảnh hero + thư tình: sửa dòng `couples` (cột `hero_photo_url`, `love_letter`).
- Điều ước mới: người yêu tự thêm ngay trên web (nút "+ Thêm điều ước mới",
  nhập mã PIN chung) — không cần vào Supabase.

## 4. Deploy lên Vercel

1. Push thư mục `app` lên GitHub.
2. https://vercel.com → **Add New Project** → import repo.
3. **Environment Variables**: thêm 4 biến như `.env.example`.
4. **Deploy** → có link `https://...vercel.app` để chia sẻ cho người yêu ♡

## Ghi chú cho phase 2/3

- Mọi bảng đã có `couple_id` từ đầu → phase 3 thêm Supabase Auth + RLS
  theo `couple_id` mà không cần đổi schema.
- Ghi dữ liệu đi qua API route có kiểm tra PIN (service-role) → phase 3
  chỉ cần thay PIN bằng Auth, logic upload/insert giữ nguyên.
- Nội dung nằm trong DB, không hard-code → phase 2 dựng trang "chỉnh sửa
  theo template" trực tiếp trên các bảng này.
