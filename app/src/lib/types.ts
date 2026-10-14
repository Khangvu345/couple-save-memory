export type MemoryLayout = 'polaroid' | 'big' | 'quote' | 'pair' | 'standard';

export interface Couple {
  id: string;
  name_a: string;
  name_b: string;
  start_date: string; // YYYY-MM-DD
  start_time?: string | null; // HH:MM:SS theo giờ Việt Nam
  hero_photo_url?: string | null;
  counter_photo_url?: string | null; // ảnh hiển thị ở section bộ đếm
  love_letter?: string | null;
}

export interface Memory {
  id: string;
  date: string;
  title: string;
  teaser: string;   // dòng ngắn hiện sẵn
  story: string;    // câu chuyện đầy đủ, hiện dần khi chạm ảnh
  photos: string[];
  layout: MemoryLayout;
  handwritten_note?: string | null; // chữ viết tay dưới ảnh polaroid (khác caption)
}

export interface LittleThing {
  id: string;
  text: string;
  handwritten_note?: string | null;
  photo_url?: string | null;
  rotation: number;
}

export interface Wish {
  id: string;
  text: string;
  photos: string[];
  done: boolean;
  created_by?: string | null;
  created_at: string;
  pending?: boolean; // item tạm khi optimistic UI, không lưu DB
}
