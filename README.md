# 🎓 System Design Vui Vẻ - Từ Zero đến Hero

Website tài liệu học **System Design** đầy đủ, vui nhộn, dễ hiểu với **30 chương (~300 trang)** - từ kiến thức nền tảng đến case study các hệ thống lớn (Short URL, Twitter, Facebook, Netflix, Uber, WhatsApp, Instagram, YouTube).

## 🚀 Cách chạy

Mở trực tiếp `docs/index.html` bằng trình duyệt, hoặc dùng server tĩnh:

```bash
cd docs
python3 -m http.server 8080
# Mở http://localhost:8080
```

Hoặc deploy lên GitLab Pages / Netlify / Vercel - chỉ trỏ tới thư mục `docs/`.

## ✨ Tính năng

- 📚 **30 chương** chia 4 phần (Nhập môn → Nền tảng → Nâng cao → Case Study)
- 🎨 **Light / Dark mode**
- 🔍 **Tìm kiếm chương** trong sidebar
- 📊 **Tiến độ học** lưu trong localStorage
- 🧠 **Quiz tương tác** cuối nhiều chương
- 📱 **Responsive** trên mobile
- ⌨️ Phím tắt: `←` chương trước, `→` chương kế
- 🎯 **Code ví dụ** thật + sơ đồ SVG trực quan
- 😄 **Liên tưởng hài hước**: quán phở, người yêu xa, đầu bếp, loa phường...

## 📂 Cấu trúc

```
docs/
├── index.html
└── assets/
    ├── style.css
    ├── app.js
    ├── chapters.js          # Chương 1-7
    ├── chapters-extra.js    # Chương 8-15
    ├── chapters-extra2.js   # Chương 16-23
    └── chapters-cases.js    # Chương 24-30
```

## 🎯 Nội dung 30 chương

**Phần 1 - Nhập môn vui vẻ**

1. System Design là gì? (Phở vs MasterChef)
2. Client - Server (Người yêu xa)
3. IP, DNS, HTTP (Bưu điện Internet)
4. TCP, UDP, WebSocket (Bồ câu vs Loa phường)

**Phần 2 - Kiến thức nền**

5. Database (Tủ lạnh hệ thống)
6. Cache (Sổ tay đầu bếp)
7. Load Balancer (Anh dắt mối)
8. Scaling (Mở rộng quán phở)
9. Sharding & Replication (Cắt bánh pizza)
10. CAP Theorem (Chọn 2 trong 3)
11. Message Queue (Hộp thư công ty)
12. API Design (REST, GraphQL, gRPC)
13. CDN (Kho hàng gần nhà bạn)

**Phần 3 - Kiến trúc nâng cao**

14. Monolith vs Microservices
15. Event-Driven Architecture
16. Consistent Hashing (Vòng quay may mắn)
17. Rate Limiting (Cảnh sát giao thông)
18. Security (Bảo mật cơ bản)
19. Observability (Logging, Monitoring, Tracing)
20. Search Engine (Tìm kim trong đụn cỏ)
21. Object Storage (Kho ảnh & video)
22. Realtime Systems (Tin nhắn không độ trễ)
23. Backup & Disaster Recovery

**Phần 4 - Case Study huyền thoại**

24. Thiết kế Short URL (Bit.ly)
25. Twitter / X (Fan-out, Snowflake)
26. Facebook Newsfeed (Ranking AI)
27. Netflix Streaming (Open Connect, ABR)
28. Uber - Matching địa lý (H3, Geohash)
29. WhatsApp - E2E Encryption
30. Instagram, YouTube & Tổng kết

## 📖 Phong cách

Mỗi chương đều có:

- 🎬 Câu chuyện đời thường mở đầu (quán phở, người yêu xa...)
- 🧩 Khái niệm cốt lõi giải thích đơn giản
- 💻 Code ví dụ chạy được (Node.js, Python, SQL)
- 🎨 Sơ đồ SVG trực quan
- 📊 Bảng so sánh, thẻ tổng hợp
- 💡 Callout: tip, warning, fun fact
- 🧠 Quiz tương tác

Made with ❤️ + ☕ + 🎵 | © 2026 System Design Vui Vẻ
