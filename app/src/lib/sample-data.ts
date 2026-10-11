import type { Couple, LittleThing, Memory, Wish } from './types';

/** Dữ liệu mẫu — dùng khi chưa cấu hình Supabase, để chạy thử ngay. */
export const sampleCouple: Couple = {
  id: 'sample',
  name_a: 'Minh Khang',
  name_b: 'Thùy Linh',
  start_date: '2026-09-17',
  start_time: '',
  hero_photo_url: null,
  love_letter: 'Gửi em,\n\nMột tháng — ngắn thôi, nhưng đủ để anh biết mình muốn kể tiếp câu chuyện này thật dài.\n\nCảm ơn em đã bước vào khung hình của anh.',
};

export const sampleMemories: Memory[] = [
  {
    id: 'm1', date: '2026-09-06', title: 'Lần đầu chạm mặt',
    teaser: 'Một buổi chiều tình cờ, mà hoá ra là định mệnh.',
    story: 'Hôm ấy anh chẳng chuẩn bị gì cả. Chỉ là một buổi chiều bình thường, cho đến khi em xuất hiện và mọi thứ bỗng có nhạc nền.',
    photos: [], layout: 'polaroid',
  },
  {
    id: 'm2', date: '2026-09-12', title: 'Buổi hẹn đầu tiên',
    teaser: 'Quán cà phê nhỏ cuối phố…',
    story: 'Quán cà phê nhỏ cuối phố. Anh đến sớm mười lăm phút, tay cứ xoay mãi ly nước lọc. Em cười — và từ giây phút đó, anh biết buổi chiều hôm ấy sẽ dài hơn dự định.',
    photos: [], layout: 'big',
  },
  {
    id: 'm3', date: '2026-09-20', title: '',
    teaser: '', story: 'Hôm ấy em cười, và anh biết mình tiêu rồi.',
    photos: [], layout: 'quote',
  },
  {
    id: 'm4', date: '2026-10-06', title: 'Kỷ niệm 1 tháng',
    teaser: 'Một tháng — và câu chuyện mới chỉ bắt đầu.',
    story: 'Một tháng không dài, nhưng đủ để anh chắc một điều: anh muốn có thêm thật nhiều cái một tháng nữa.',
    photos: [], layout: 'pair',
  },
];

export const sampleThings: LittleThing[] = [
  { id: 't1', text: 'Em uống trà sữa luôn ít đá,\n30% đường.', handwritten_note: '— 14.09 —', rotation: -2 },
  { id: 't2', text: 'Anh hay quên chìa khóa.\nEm đã cứu anh 3 lần.', handwritten_note: '— Em ♡ —', rotation: 1.5 },
  { id: 't3', text: 'Em thích trời mưa,\nthích màu be,\nvà thích anh.', rotation: -1 },
];

export const sampleWishes: Wish[] = [
  { id: 'w1', text: 'Ngắm hoàng hôn ở Đà Lạt', photos: [], done: false, created_at: '' },
  { id: 'w2', text: 'Nấu một bữa tối cho nhau', photos: [], done: false, created_at: '' },
  { id: 'w3', text: 'Đi biển lần đầu cùng nhau', photos: [], done: false, created_at: '' },
];
