# 📋 Changelog — "Bộ phim của chúng ta"

> Tài liệu tracking các thay đổi do AI thực hiện trong dự án.
> Format: `[YYYY-MM-DD] Loại | File | Mô tả`

---

## [2026-10-11] — Session cập nhật bộ đếm và giao diện điện ảnh

### ✨ Feature #2 — Bộ đếm thời gian thực theo giờ Việt Nam
- **Files**: `app/src/components/Counter.tsx`, `app/src/app/page.tsx`, `app/src/lib/types.ts`, `app/src/lib/sample-data.ts`
- **Thay đổi**:
  - Chuyển `Counter` thành Client Component, cập nhật mỗi giây bằng `setInterval` và dọn timer khi unmount.
  - Tính thời gian đã bên nhau theo năm, tháng, ngày, giờ, phút, giây dựa trên múi giờ `Asia/Ho_Chi_Minh`.
  - Hiển thị thêm `start_time` bên cạnh ngày bắt đầu; dữ liệu cũ không có giờ mặc định về `00:00:00`.
  - Bổ sung trường `start_time` vào kiểu `Couple`, truy vấn Supabase và dữ liệu mẫu.

### 🎨 Feature #3 — Làm mới visual theo chủ đề khung phim
- **Files**: `app/src/app/globals.css`, `app/src/components/Hero.tsx`, `app/src/components/Counter.tsx`, `app/src/components/Timeline.tsx`, `app/src/components/LittleThings.tsx`, `app/src/components/Wishlist.tsx`, `app/src/components/Credits.tsx`
- **Thay đổi**:
  - Thêm các lớp dùng chung `cinema-surface`, `paper-note` và `film-frame` với nền chuyển sắc, texture giấy và viền perforation như phim.
  - Áp dụng bề mặt điện ảnh cho các section chính, giấy ghi chú cho nội dung scrapbook và khung phim cho phần credits.
  - Giữ nguyên các tương tác hiện có của timeline, wishlist và phần thêm điều ước.

### 🗄️ Database — Lưu giờ bắt đầu mối quan hệ
- **Files**: `app/supabase/migrations/001_init.sql`, `app/supabase/migrations/002_add_start_time.sql`
- **Thay đổi**:
  - Thêm cột `couples.start_time` kiểu `time`, bắt buộc, mặc định `00:00:00` vào schema mới.
  - Thêm migration an toàn cho project Supabase đã chạy schema Phase 1 bằng `add column if not exists`.

---

## [2026-10-07] — Session khởi động

### 🔍 Khám phá dự án
- Đọc toàn bộ source code và README
- Tạo tài liệu tổng quan kiến trúc, data models, design system

---

## [2026-10-08] — Session sửa lỗi

### 🐛 Fix #1 — Hydration Mismatch
- **File**: `app/src/app/layout.tsx` (dòng 24)
- **Vấn đề**: Console error hydration mismatch — browser extension (Material Design Lite) tự inject class `mdl-js` vào `<html>` sau khi SSR, khiến HTML client ≠ server
- **Thay đổi**: Thêm `suppressHydrationWarning` vào thẻ `<html>`
- **Trước**: `<html lang="vi" className={...}>`
- **Sau**: `<html lang="vi" suppressHydrationWarning className={...}>`

---

### ✨ Feature #1 — Nút cuộn trang Hero có thể click
- **Files**: `app/src/components/Hero.tsx`, `app/src/components/Counter.tsx`
- **Vấn đề**: Nút "CUỘN XUỐNG ĐỂ BẮT ĐẦU" là element tĩnh, không tương tác được
- **Thay đổi**:
  - `Hero.tsx`: Bọc nội dung nút trong `<a href="#counter">` để tạo anchor link
  - `Counter.tsx`: Thêm `id="counter"` vào `<section>` để làm anchor target
- **Cơ chế**: Dùng CSS `scroll-behavior: smooth` (đã có sẵn trong `globals.css`) — không cần thêm JS

---

### 🐛 Fix #2 — Lỗi font tiếng Việt ở tiêu đề Hero ("CỦA CHÚNG TA")
- **Files**: `app/src/app/layout.tsx`, `app/src/app/globals.css`, `app/src/components/Hero.tsx`
- **Vấn đề**:
  1. Font `Bebas_Neue` trên Google Fonts không hỗ trợ subset `vietnamese`, khiến các chữ có dấu như `Ủ` (trong từ "CỦA"), `Ú` (trong từ "CHÚNG") bị văng sang font fallback hệ thống, làm dấu hỏi bị lệch hoặc hiển thị thành ký tự lỗi.
  2. Hàm `Letters` trong `Hero.tsx` dùng `text.split('')`, nếu chuỗi gặp ký tự Unicode tổ hợp (NFD combining diacritics) sẽ tách dấu hỏi thành một `span` riêng biệt.
- **Thay đổi**:
  - `layout.tsx`: Thay `Bebas_Neue` bằng font `Oswald` (font display condensed phong cách cinematic hỗ trợ đầy đủ subset `vietnamese`).
  - `globals.css`: Cập nhật `--font-display: var(--font-oswald), sans-serif;`.
  - `Hero.tsx`: Thêm `text.normalize('NFC')` và `Array.from()` trong component `Letters` để đảm bảo mỗi chữ cái có dấu luôn là 1 ký tự nguyên vẹn khi render hiệu ứng animation.

---

## 📌 Ghi chú kỹ thuật

### Kiến trúc tổng quan
```
Next.js 15 (App Router) + React 19 + Tailwind 4 + Supabase
Deploy: Vercel
```

### Cấu trúc dữ liệu
| Bảng | Mục đích |
|------|----------|
| `couples` | Thông tin cặp đôi, pin_hash |
| `memories` | Timeline kỷ niệm |
| `little_things` | Scrapbook "những điều nhỏ" |
| `wishes` | Danh sách điều ước |

### Biến môi trường cần thiết
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
COUPLE_ID
```

### Fallback khi chưa có Supabase
- `isConfigured()` trả về `false` → dùng `sample-data.ts`
- Tính năng "Thêm điều ước" bị disable (hiển thị ghi chú "kết nối Supabase để dùng")

---

## 🗺️ Roadmap

| Phase | Trạng thái | Nội dung |
|-------|-----------|----------|
| Phase 1 | ✅ Hoàn thiện | Trang kỷ niệm, thêm điều ước bằng PIN, deploy Vercel |
| Phase 2 | 🔜 Chưa làm | Trang admin chỉnh sửa nội dung theo template |
| Phase 3 | 🔜 Chưa làm | Supabase Auth + RLS, hỗ trợ nhiều cặp đôi |
