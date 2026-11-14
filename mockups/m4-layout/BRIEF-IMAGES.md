# Brief cho Codex · Hình ảnh showcase · ViệcNhanh Aichi

Mục tiêu: prototype trông như một trang tuyển dụng đang vận hành thật. Cần bộ hình ảnh ví dụ đầy đủ. **Thời gian tối đa 25 phút.** Ưu tiên theo thứ tự dưới đây, làm xong mục nào ghi manifest mục đó ngay.

## Chỉ được ghi vào
`viecnhanh-prototype/public/showcase/` và file `viecnhanh-prototype/public/showcase/manifest.json`.
Không sửa bất kỳ file nào khác (một người khác đang sửa `src/`).

## Quy tắc
- Tất cả công ty là **hư cấu** (xem `viecnhanh-prototype/src/lib/data.ts`, `JOBS`). Không dùng logo, tên, màu nhận diện của công ty thật hay thương hiệu thật. Không dùng logo Zalo/LINE thật.
- Không dùng ảnh có bản quyền tải từ web. Tự vẽ SVG, hoặc dùng công cụ tạo ảnh nếu bạn có.
- Ảnh người: chỉ dùng chân dung minh hoạ dạng vector/flat (không ảnh thật của người thật).
- Phong cách: sạch, hiện đại, hợp với màu thương hiệu Bold Blue `#1B22A7` / Light Blue `#4260E6` nhưng logo mỗi công ty có màu riêng của nó.
- File nhẹ: SVG < 15 KB mỗi file; ảnh raster (nếu có) WebP/JPG < 120 KB.

## Danh sách (theo ưu tiên)
1. **Logo 7 công ty** trong `JOBS` (id: mikawa-cnc, okazaki-nc, kariya-mill, okazaki-weld, anjo-forklift, toyohashi-mold, nagoya-food). SVG vuông 96×96, nền có màu hoặc trắng, ký hiệu hình học + chữ viết tắt hoặc biểu tượng ngành (bánh răng, mũi khoan, hàn, xe nâng, khuôn ép, hộp cơm). File: `logos/<job-id>.svg`.
2. **Ảnh bìa nhà máy cho từng việc** (cover, tỉ lệ 16:9, 640×360): minh hoạ vector nhà xưởng/máy móc đúng ngành từng việc. File: `covers/<job-id>.svg` (hoặc .webp).
3. **Avatar minh hoạ** cho người Việt đang làm (`PEERS` trong data.ts: pe1–pe4) và 8 ứng viên HR (`SEED_CANDIDATES` c1–c8, x1–x3): vector flat, đa dạng giới tính. File: `avatars/<id>.svg`.
4. **Ảnh cho trang ký túc xá / tiện ích** của Mikawa (3 ảnh minh hoạ: phòng 1 người, căng tin, xe đưa đón). File: `gallery/mikawa-<1..3>.svg`.
5. **Logo ViệcNhanh Aichi** dạng biểu tượng app (96×96) nếu thấy logo hiện tại (`src/components/ui.tsx`, hàm `Logo`) chưa đủ đẹp. File: `brand/app-icon.svg`.

## manifest.json (bắt buộc, cập nhật sau mỗi mục)
```json
{
  "logos": { "mikawa-cnc": "/showcase/logos/mikawa-cnc.svg" },
  "covers": { "mikawa-cnc": "/showcase/covers/mikawa-cnc.svg" },
  "avatars": { "pe1": "/showcase/avatars/pe1.svg", "c1": "/showcase/avatars/c1.svg" },
  "gallery": { "mikawa-cnc": ["/showcase/gallery/mikawa-1.svg"] },
  "brand": { "appIcon": "/showcase/brand/app-icon.svg" }
}
```
Chỉ ghi đường dẫn của file đã tạo xong. Khi xong, in danh sách file.
