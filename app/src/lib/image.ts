/** Nén ảnh phía client trước khi upload: ảnh điện thoại 3-5MB -> ~200-400KB.
 *  Ở kích thước hiển thị trên web (tối đa ~350px CSS), mắt thường không phân biệt được. */

export async function compressImage(file: File, maxDim = 1600, quality = 0.82): Promise<Blob> {
  const img = await createImageBitmap(file);
  const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Không xử lý được ảnh.');
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((res) => canvas.toBlob((b) => res(b), 'image/jpeg', quality));
  if (!blob) throw new Error('Không nén được ảnh.');
  return blob;
}
