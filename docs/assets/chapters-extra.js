/* =========================================================
 * CHƯƠNG 8 - 15: SCALING, MICROSERVICES, EVENT-DRIVEN
 * ========================================================= */

window.CHAPTERS = window.CHAPTERS || [];
const _PART2 = [

  /* ============================================================
   * CHƯƠNG 8: SCALING
   * ============================================================ */
  {
    group: "🧱 Phần 2: Kiến thức nền",
    icon: "📈",
    title: "Chương 8: Scaling - Mở rộng quán phở",
    content: `
<h1>Chương 8: Scaling</h1>
<p class="subtitle">Từ quán vỉa hè đến chuỗi 1000 chi nhánh 🏪</p>

<h2>📏 Hai cách mở rộng</h2>

<h3>1. Vertical Scaling (Scale Up) - "Lên đời máy"</h3>
<p>Mua server mạnh hơn: 4 CPU → 64 CPU, 8GB RAM → 512GB RAM.</p>
<div class="cards">
  <div class="card"><div class="emoji">✅</div><h4>Ưu</h4><p>Đơn giản, không đổi code.</p></div>
  <div class="card"><div class="emoji">❌</div><h4>Nhược</h4><p>Đắt theo cấp số nhân. Có giới hạn. Server chết = sập.</p></div>
</div>

<h3>2. Horizontal Scaling (Scale Out) - "Thêm chi nhánh"</h3>
<p>Thay vì 1 server siêu mạnh, dùng 100 server vừa vừa.</p>
<div class="cards">
  <div class="card"><div class="emoji">✅</div><h4>Ưu</h4><p>Vô hạn, fault tolerant, rẻ.</p></div>
  <div class="card"><div class="emoji">❌</div><h4>Nhược</h4><p>Phức tạp: cần LB, distributed system.</p></div>
</div>

<div class="diagram">
<svg viewBox="0 0 600 200" xmlns="http://www.w3.org/2000/svg">
  <text x="100" y="20" text-anchor="middle" font-weight="700" fill="currentColor">Vertical</text>
  <rect x="60" y="40" width="80" height="140" rx="8" fill="#ff5e7a"/>
  <text x="100" y="115" text-anchor="middle" fill="white" font-size="40">💪</text>

  <text x="400" y="20" text-anchor="middle" font-weight="700" fill="currentColor">Horizontal</text>
  <rect x="280" y="60" width="60" height="60" rx="8" fill="#6c5ce7"/>
  <text x="310" y="100" text-anchor="middle" fill="white" font-size="22">🖥️</text>
  <rect x="360" y="60" width="60" height="60" rx="8" fill="#6c5ce7"/>
  <text x="390" y="100" text-anchor="middle" fill="white" font-size="22">🖥️</text>
  <rect x="440" y="60" width="60" height="60" rx="8" fill="#6c5ce7"/>
  <text x="470" y="100" text-anchor="middle" fill="white" font-size="22">🖥️</text>
  <rect x="520" y="60" width="60" height="60" rx="8" fill="#6c5ce7"/>
  <text x="550" y="100" text-anchor="middle" fill="white" font-size="22">🖥️</text>
  <rect x="320" y="130" width="60" height="60" rx="8" fill="#6c5ce7"/>
  <text x="350" y="170" text-anchor="middle" fill="white" font-size="22">🖥️</text>
  <rect x="400" y="130" width="60" height="60" rx="8" fill="#6c5ce7"/>
  <text x="430" y="170" text-anchor="middle" fill="white" font-size="22">🖥️</text>
  <rect x="480" y="130" width="60" height="60" rx="8" fill="#6c5ce7"/>
  <text x="510" y="170" text-anchor="middle" fill="white" font-size="22">🖥️</text>
</svg>
<div class="diagram-caption">Một con khổng lồ vs nhiều con vừa</div>
</div>

<h2>🚀 Kiến trúc scaling thường gặp</h2>

<h3>Stage 1: Single server (0-1k users)</h3>
<pre><code>[User] → [Server + DB chung]</code></pre>

<h3>Stage 2: Tách DB (1k-10k)</h3>
<pre><code>[User] → [Web Server] → [DB riêng]</code></pre>

<h3>Stage 3: Nhiều web server (10k-100k)</h3>
<pre><code>[User] → [LB] → [Web1, Web2, Web3] → [DB]</code></pre>

<h3>Stage 4: Cache + CDN (100k-1M)</h3>
<pre><code>[User] → [CDN] → [LB] → [Web Servers]
                                 ↓
                          [Cache (Redis)]
                                 ↓
                              [DB Master + Replicas]</code></pre>

<h3>Stage 5: Microservices + Sharding (1M+)</h3>
<pre><code>[User] → [CDN] → [API Gateway] → [User Service, Order Service, Payment Service, ...]
                                          ↓                ↓               ↓
                                       [DB1]           [DB2]          [DB3]
                                    + Cache         + Queue       + Search Index</code></pre>

<h2>📊 Khi nào scale?</h2>
<ul>
  <li><strong>CPU > 70%</strong> liên tục → cần thêm máy hoặc tối ưu code.</li>
  <li><strong>Memory > 80%</strong> → có thể leak hoặc cần thêm RAM.</li>
  <li><strong>Response time tăng</strong> → user bắt đầu phàn nàn.</li>
  <li><strong>Error rate tăng</strong> → server sắp ngộp.</li>
</ul>

<div class="callout tip">
<div class="callout-title">💡 Lời khuyên Big Tech</div>
<p>"Scale up đến khi không nổi nữa, rồi mới scale out". Đừng phức tạp hoá ngay từ đầu - YAGNI (You Aren't Gonna Need It).</p>
</div>

<h2>🤖 Auto-scaling</h2>
<p>Cloud (AWS, GCP) cho phép tự thêm/bớt server theo metric:</p>
<pre><code># AWS Auto Scaling rule
- CPU > 70% trong 5 phút → +2 server
- CPU < 30% trong 10 phút → -1 server
- Tối thiểu: 2, tối đa: 50</code></pre>
`
  },

  /* ============================================================
   * CHƯƠNG 9: SHARDING & REPLICATION
   * ============================================================ */
  {
    group: "🧱 Phần 2: Kiến thức nền",
    icon: "🍕",
    title: "Chương 9: Sharding & Replication (Cắt bánh pizza)",
    content: `
<h1>Chương 9: Sharding & Replication</h1>
<p class="subtitle">Khi 1 tủ lạnh không đủ - cắt nhiều tủ, copy nhiều bản 🍕</p>

<h2>🍕 Sharding - Chia bánh ra ăn</h2>
<p>Khi DB có 10 tỷ user, 1 máy không kham nổi. → Cắt thành nhiều "shard":</p>
<ul>
  <li>Shard 1: user id 1-1 tỷ</li>
  <li>Shard 2: user id 1 tỷ-2 tỷ</li>
  <li>...</li>
</ul>

<div class="diagram">
<svg viewBox="0 0 500 180" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="70" width="100" height="40" rx="8" fill="#ff5e7a"/>
  <text x="70" y="95" text-anchor="middle" fill="white" font-size="12">Query (id=1234)</text>
  <rect x="180" y="70" width="100" height="40" rx="8" fill="#f9a826"/>
  <text x="230" y="95" text-anchor="middle" fill="white" font-size="12">Router</text>
  <rect x="340" y="10" width="120" height="35" rx="8" fill="#00d2a8"/>
  <text x="400" y="33" text-anchor="middle" fill="white" font-size="11">Shard A (1-1k)</text>
  <rect x="340" y="70" width="120" height="35" rx="8" fill="#00d2a8"/>
  <text x="400" y="93" text-anchor="middle" fill="white" font-size="11">Shard B (1k-2k) ✓</text>
  <rect x="340" y="130" width="120" height="35" rx="8" fill="#00d2a8"/>
  <text x="400" y="153" text-anchor="middle" fill="white" font-size="11">Shard C (2k-3k)</text>
  <line x1="120" y1="90" x2="180" y2="90" stroke="#5a5a72" stroke-width="2"/>
  <line x1="280" y1="90" x2="340" y2="90" stroke="#5a5a72" stroke-width="2"/>
</svg>
<div class="diagram-caption">Router gửi query tới đúng shard chứa id 1234</div>
</div>

<h3>3 chiến lược shard phổ biến</h3>
<table>
  <tr><th>Cách</th><th>Ý tưởng</th><th>Vấn đề</th></tr>
  <tr><td>Range</td><td>id 1-1k vào A, 1k-2k vào B</td><td>Hot shard (user mới luôn vào shard cuối)</td></tr>
  <tr><td>Hash</td><td><code>hash(id) % N</code></td><td>Thêm shard = rehash toàn bộ</td></tr>
  <tr><td>Consistent Hash</td><td>Vòng tròn ảo, thêm node ít ảnh hưởng</td><td>Phức tạp hơn</td></tr>
</table>

<h2>📑 Replication - Sao lưu</h2>
<p>Mỗi shard có nhiều bản copy gọi là <strong>replica</strong>:</p>
<ul>
  <li><strong>Master</strong>: Nhận ghi (write).</li>
  <li><strong>Slave/Replica</strong>: Đọc (read). Sync từ master.</li>
</ul>

<div class="diagram">
<svg viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg">
  <rect x="180" y="20" width="120" height="40" rx="8" fill="#ff5e7a"/>
  <text x="240" y="45" text-anchor="middle" fill="white" font-size="13" font-weight="700">Master (Write)</text>
  <rect x="20" y="100" width="120" height="40" rx="8" fill="#00d2a8"/>
  <text x="80" y="125" text-anchor="middle" fill="white" font-size="12">Replica 1 (Read)</text>
  <rect x="180" y="100" width="120" height="40" rx="8" fill="#00d2a8"/>
  <text x="240" y="125" text-anchor="middle" fill="white" font-size="12">Replica 2 (Read)</text>
  <rect x="340" y="100" width="120" height="40" rx="8" fill="#00d2a8"/>
  <text x="400" y="125" text-anchor="middle" fill="white" font-size="12">Replica 3 (Read)</text>
  <line x1="240" y1="60" x2="80" y2="100" stroke="#5a5a72" stroke-width="2"/>
  <line x1="240" y1="60" x2="240" y2="100" stroke="#5a5a72" stroke-width="2"/>
  <line x1="240" y1="60" x2="400" y2="100" stroke="#5a5a72" stroke-width="2"/>
</svg>
<div class="diagram-caption">Master-Slave Replication</div>
</div>

<h2>🎯 Lợi ích</h2>
<ul>
  <li><strong>Read scaling</strong>: 1 master + 10 replica → đọc tăng 10 lần.</li>
  <li><strong>HA</strong>: Master chết → promote 1 replica thành master.</li>
  <li><strong>Geographic</strong>: Replica ở Mỹ cho user Mỹ, ở VN cho user VN.</li>
</ul>

<h2>⚠️ Replication lag</h2>
<p>Master ghi xong, replica chưa kịp sync. User vừa post xong, refresh thấy mất bài → vì đọc từ replica chưa kịp update.</p>

<div class="callout warn">
<div class="callout-title">⚠️ Bài học đắt</div>
<p>Cẩn thận với <strong>"read your own write"</strong>: sau khi user POST, đừng đọc từ replica - phải đọc từ master hoặc cache vài giây.</p>
</div>

<h2>💻 Code ví dụ chọn shard</h2>
<pre><code>function getShardForUser(userId) {
  const NUM_SHARDS = 4;
  const shardId = userId % NUM_SHARDS;
  return DB_CONNECTIONS[shardId];
}

async function getUser(userId) {
  const db = getShardForUser(userId);
  return await db.query('SELECT * FROM users WHERE id=?', userId);
}</code></pre>
`
  },

  /* ============================================================
   * CHƯƠNG 10: CAP THEOREM
   * ============================================================ */
  {
    group: "🧱 Phần 2: Kiến thức nền",
    icon: "🎯",
    title: "Chương 10: CAP Theorem - Chọn 2 trong 3",
    content: `
<h1>Chương 10: CAP Theorem</h1>
<p class="subtitle">Định lý "không thể nào có hết cả 3" 🎭</p>

<h2>🎭 Câu chuyện</h2>
<p>Bạn muốn người yêu vừa <strong>đẹp</strong>, vừa <strong>giàu</strong>, vừa <strong>thương bạn</strong>. CAP nói: chỉ chọn 2 thôi 😂</p>

<h2>🔤 Ba chữ cái</h2>
<div class="cards">
  <div class="card"><div class="emoji">🎯</div><h4>C - Consistency</h4><p>Mọi node thấy data như nhau cùng lúc.</p></div>
  <div class="card"><div class="emoji">🚀</div><h4>A - Availability</h4><p>Mọi request đều có trả lời (dù có thể cũ).</p></div>
  <div class="card"><div class="emoji">🌐</div><h4>P - Partition Tolerance</h4><p>Hệ thống vẫn hoạt động khi mạng bị chia cắt.</p></div>
</div>

<h2>🧩 Vì sao "chỉ 2 trong 3"?</h2>
<p>Trong distributed system, mạng <strong>luôn có khả năng chia cắt</strong> (P là bắt buộc). Vậy thực tế là chọn:</p>
<ul>
  <li><strong>CP</strong>: Đảm bảo data đúng, nhưng có thể từ chối phục vụ.</li>
  <li><strong>AP</strong>: Luôn trả lời, nhưng đôi khi data cũ.</li>
</ul>

<div class="diagram">
<svg viewBox="0 0 500 250" xmlns="http://www.w3.org/2000/svg">
  <circle cx="170" cy="100" r="80" fill="rgba(255,94,122,0.25)" stroke="#ff5e7a" stroke-width="2"/>
  <circle cx="330" cy="100" r="80" fill="rgba(108,92,231,0.25)" stroke="#6c5ce7" stroke-width="2"/>
  <circle cx="250" cy="180" r="80" fill="rgba(0,210,168,0.25)" stroke="#00d2a8" stroke-width="2"/>
  <text x="130" y="80" font-weight="700" fill="currentColor">C</text>
  <text x="365" y="80" font-weight="700" fill="currentColor">A</text>
  <text x="245" y="240" font-weight="700" fill="currentColor">P</text>
  <text x="180" y="155" font-size="11" fill="currentColor">CP: HBase</text>
  <text x="290" y="155" font-size="11" fill="currentColor">AP: Cassandra</text>
  <text x="220" y="115" font-size="11" fill="currentColor">CA: SQL (1 node)</text>
</svg>
<div class="diagram-caption">Tam giác CAP - chọn 2 cạnh</div>
</div>

<h2>📚 Ví dụ thực tế</h2>
<h3>CP - Ngân hàng</h3>
<p>Bạn rút tiền - hệ thống thà <strong>báo lỗi</strong> còn hơn cho bạn rút 2 lần. Consistency > Availability.</p>

<h3>AP - Mạng xã hội</h3>
<p>Bạn vào Facebook, thà thấy newsfeed cũ vài giây còn hơn báo lỗi 500. Availability > Consistency.</p>

<h2>🌈 BASE - "Em họ" của ACID</h2>
<p>NoSQL thường dùng triết lý BASE:</p>
<ul>
  <li><strong>B</strong>asically <strong>A</strong>vailable</li>
  <li><strong>S</strong>oft state</li>
  <li><strong>E</strong>ventually consistent</li>
</ul>
<p>Tức là: <em>"Tạm thời chấp nhận data lệch, rồi cuối cùng sẽ đồng bộ"</em>.</p>

<h2>💡 Eventually Consistent</h2>
<p>Bạn like 1 post → backend trả "thành công" ngay, nhưng số like trên feed bạn bè khác có thể update chậm 1-2 giây. Đó là "eventual consistency".</p>

<div class="callout tip">
<div class="callout-title">💡 Bài học</div>
<p>Không có DB "tốt nhất". Chọn DB phù hợp với use case: tài chính → CP, social → AP.</p>
</div>
`
  },

  /* ============================================================
   * CHƯƠNG 11: MESSAGE QUEUE
   * ============================================================ */
  {
    group: "🧱 Phần 2: Kiến thức nền",
    icon: "📬",
    title: "Chương 11: Message Queue - Hộp thư công ty",
    content: `
<h1>Chương 11: Message Queue</h1>
<p class="subtitle">Tách "người gọi" và "người làm" - ai rảnh thì làm 📬</p>

<h2>📬 Câu chuyện công ty</h2>
<p>Sếp giao việc trực tiếp cho từng nhân viên → ai bận thì sếp đứng chờ. Tốn thời gian!</p>
<p>Giải pháp: sếp ghi giấy bỏ vào <strong>hộp thư</strong>. Nhân viên rảnh tự lấy ra làm.</p>

<h2>🛠️ Message Queue là gì?</h2>
<p>Hàng đợi tin nhắn giữa <strong>Producer</strong> (người gửi) và <strong>Consumer</strong> (người nhận).</p>

<div class="diagram">
<svg viewBox="0 0 600 130" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="45" width="100" height="40" rx="8" fill="#ff5e7a"/>
  <text x="70" y="70" text-anchor="middle" fill="white" font-size="12">Producer</text>

  <rect x="180" y="45" width="240" height="40" rx="8" fill="#f9a826"/>
  <text x="300" y="70" text-anchor="middle" fill="white" font-size="13">📬 Queue (FIFO)</text>

  <rect x="480" y="20" width="100" height="35" rx="8" fill="#00d2a8"/>
  <text x="530" y="42" text-anchor="middle" fill="white" font-size="11">Consumer 1</text>
  <rect x="480" y="75" width="100" height="35" rx="8" fill="#00d2a8"/>
  <text x="530" y="97" text-anchor="middle" fill="white" font-size="11">Consumer 2</text>

  <line x1="120" y1="65" x2="180" y2="65" stroke="#5a5a72" stroke-width="2"/>
  <line x1="420" y1="65" x2="480" y2="40" stroke="#5a5a72" stroke-width="2"/>
  <line x1="420" y1="65" x2="480" y2="92" stroke="#5a5a72" stroke-width="2"/>
</svg>
<div class="diagram-caption">Producer → Queue → Consumers</div>
</div>

<h2>🎯 Vì sao cần MQ?</h2>
<ul>
  <li><strong>Decoupling</strong>: Producer không cần biết Consumer là ai.</li>
  <li><strong>Async</strong>: Producer trả ngay, consumer làm sau.</li>
  <li><strong>Buffer</strong>: Lúc cao điểm, queue gánh dùm.</li>
  <li><strong>Retry</strong>: Job lỗi → tự thử lại.</li>
</ul>

<h2>📦 Use case kinh điển</h2>
<h3>Gửi email khi user đăng ký</h3>
<pre><code>// ❌ Cách cũ: chờ gửi mail xong mới trả response (chậm 3s)
app.post('/signup', async (req, res) => {
  const user = await db.insertUser(req.body);
  await sendEmail(user.email, 'Welcome!'); // chậm!
  res.json({ ok: true });
});

// ✅ Cách mới: ném job vào queue, trả ngay
app.post('/signup', async (req, res) => {
  const user = await db.insertUser(req.body);
  await queue.publish('emails', { to: user.email, type: 'welcome' });
  res.json({ ok: true }); // 100ms thôi!
});

// Worker chạy riêng
queue.subscribe('emails', async (msg) => {
  await sendEmail(msg.to, msg.type);
});</code></pre>

<h2>🛒 Sản phẩm phổ biến</h2>
<table>
  <tr><th>Tên</th><th>Đặc điểm</th></tr>
  <tr><td>RabbitMQ</td><td>Truyền thống, đáng tin cậy, AMQP</td></tr>
  <tr><td>Kafka</td><td>Big data, throughput cực cao, log-based</td></tr>
  <tr><td>AWS SQS</td><td>Managed, đơn giản, đắt</td></tr>
  <tr><td>Redis (List/Stream)</td><td>Nhanh, đơn giản, không quá bền</td></tr>
  <tr><td>NATS</td><td>Siêu nhẹ, nhanh</td></tr>
</table>

<h2>📡 Pub/Sub - Anh em với MQ</h2>
<p>Khác biệt:</p>
<ul>
  <li><strong>Queue</strong>: 1 message → 1 consumer xử lý.</li>
  <li><strong>Pub/Sub</strong>: 1 message → tất cả subscribers đều nhận.</li>
</ul>
<p>Ví dụ: post mới → notify <strong>tất cả</strong> friend → dùng pub/sub.</p>

<h2>💻 Code Kafka ví dụ</h2>
<pre><code>// Producer
const { Kafka } = require('kafkajs');
const kafka = new Kafka({ brokers: ['localhost:9092'] });
const producer = kafka.producer();

await producer.send({
  topic: 'orders',
  messages: [{ value: JSON.stringify({ id: 1, total: 100 }) }]
});

// Consumer
const consumer = kafka.consumer({ groupId: 'order-processor' });
await consumer.subscribe({ topic: 'orders' });
await consumer.run({
  eachMessage: async ({ message }) => {
    const order = JSON.parse(message.value);
    console.log('Xử lý order:', order);
  }
});</code></pre>

<div class="callout warn">
<div class="callout-title">⚠️ Cẩn thận</div>
<p>Message có thể bị xử lý <strong>2 lần</strong> (at-least-once). Code consumer phải <strong>idempotent</strong>: chạy nhiều lần kết quả vẫn vậy.</p>
</div>
`
  },

  /* ============================================================
   * CHƯƠNG 12: API Design
   * ============================================================ */
  {
    group: "🧱 Phần 2: Kiến thức nền",
    icon: "🎨",
    title: "Chương 12: API Design - REST, GraphQL, gRPC",
    content: `
<h1>Chương 12: API Design</h1>
<p class="subtitle">Cách "trò chuyện" lịch sự giữa các phần mềm 🎨</p>

<h2>🍽️ 3 phong cách phục vụ</h2>
<div class="cards">
  <div class="card"><div class="emoji">🍱</div><h4>REST</h4><p>Menu cố định - "tôi muốn cơm tấm".</p></div>
  <div class="card"><div class="emoji">🛒</div><h4>GraphQL</h4><p>Tự chọn - "tôi muốn cơm, không sườn, thêm trứng".</p></div>
  <div class="card"><div class="emoji">⚡</div><h4>gRPC</h4><p>Bếp nhà hàng nói chuyện với nhau - cực nhanh.</p></div>
</div>

<h2>📡 REST API</h2>
<p>Mỗi <strong>resource</strong> có URL riêng. Dùng HTTP method để CRUD.</p>
<pre><code>GET    /users          # Lấy danh sách
GET    /users/123      # Lấy chi tiết
POST   /users          # Tạo mới
PUT    /users/123      # Cập nhật toàn bộ
PATCH  /users/123      # Cập nhật một phần
DELETE /users/123      # Xoá</code></pre>

<h3>RESTful tốt</h3>
<ul>
  <li>Dùng danh từ số nhiều: <code>/users</code> không phải <code>/getUser</code>.</li>
  <li>Phân cấp: <code>/users/123/orders</code>.</li>
  <li>Status code chuẩn: 200, 201, 400, 404, 500.</li>
  <li>Versioning: <code>/v1/users</code> hoặc header <code>Accept: application/vnd.api.v1+json</code>.</li>
</ul>

<h2>🎯 GraphQL</h2>
<p>Vấn đề của REST: <strong>over-fetching</strong> (lấy thừa) hoặc <strong>under-fetching</strong> (phải gọi nhiều lần).</p>
<p>GraphQL: client tự khai báo cần gì.</p>
<pre><code>query {
  user(id: 123) {
    name
    email
    orders(limit: 5) {
      id
      total
    }
  }
}

# Trả về đúng những gì hỏi:
{
  "data": {
    "user": {
      "name": "Tèo",
      "email": "teo@gmail.com",
      "orders": [...]
    }
  }
}</code></pre>

<h2>⚡ gRPC</h2>
<p>Dùng <strong>Protocol Buffers</strong> (binary), HTTP/2, streaming. Cực nhanh nhưng khó debug.</p>
<pre><code>// user.proto
service UserService {
  rpc GetUser(UserId) returns (User);
  rpc StreamOrders(UserId) returns (stream Order);
}

message User {
  int32 id = 1;
  string name = 2;
}</code></pre>

<h2>🏆 So sánh</h2>
<table>
  <tr><th></th><th>REST</th><th>GraphQL</th><th>gRPC</th></tr>
  <tr><td>Format</td><td>JSON</td><td>JSON</td><td>Binary (Protobuf)</td></tr>
  <tr><td>Tốc độ</td><td>Trung bình</td><td>Trung bình</td><td>Nhanh nhất</td></tr>
  <tr><td>Browser support</td><td>✅</td><td>✅</td><td>❌ (cần gRPC-Web)</td></tr>
  <tr><td>Lý tưởng cho</td><td>Public API</td><td>Mobile, Frontend</td><td>Microservices</td></tr>
</table>

<h2>🔐 Authentication</h2>
<h3>API Key</h3>
<pre><code>GET /api/data
X-API-Key: abc123xyz</code></pre>

<h3>JWT (JSON Web Token)</h3>
<pre><code>POST /login → { token: "eyJhbGc..." }

GET /api/profile
Authorization: Bearer eyJhbGc...</code></pre>

<h3>OAuth 2.0</h3>
<p>Đăng nhập bằng Google/Facebook. App của bạn không thấy mật khẩu.</p>

<h2>🛡️ Rate Limiting</h2>
<pre><code># Giới hạn 100 request / phút / IP
if (requestCount[ip] > 100) {
  return res.status(429).json({ error: 'Too many requests' });
}</code></pre>

<div class="callout tip">
<div class="callout-title">💡 Best practice</div>
<p>Luôn versioning API. Đừng break clients cũ. <code>/v1</code> → <code>/v2</code> chạy song song.</p>
</div>
`
  },

  /* ============================================================
   * CHƯƠNG 13: CDN
   * ============================================================ */
  {
    group: "🧱 Phần 2: Kiến thức nền",
    icon: "🌎",
    title: "Chương 13: CDN - Kho hàng gần nhà bạn",
    content: `
<h1>Chương 13: CDN</h1>
<p class="subtitle">Content Delivery Network - "Shopee giao 2h" của thế giới web 📦</p>

<h2>🚚 Vấn đề khoảng cách</h2>
<p>Server ở Mỹ, user ở VN. Mỗi request mất 200ms ping qua đại dương. Tải 1 trang web nặng 5MB → vài giây load.</p>

<h2>💡 Giải pháp CDN</h2>
<p>Đặt nhiều "kho hàng" (edge server) khắp thế giới. User VN tải từ kho VN, user Mỹ tải từ kho Mỹ.</p>

<div class="diagram">
<svg viewBox="0 0 600 200" xmlns="http://www.w3.org/2000/svg">
  <rect x="250" y="20" width="100" height="40" rx="8" fill="#ff5e7a"/>
  <text x="300" y="45" text-anchor="middle" fill="white" font-size="12">Origin Server</text>

  <rect x="40" y="110" width="100" height="35" rx="8" fill="#6c5ce7"/>
  <text x="90" y="132" text-anchor="middle" fill="white" font-size="11">Edge VN</text>
  <rect x="180" y="110" width="100" height="35" rx="8" fill="#6c5ce7"/>
  <text x="230" y="132" text-anchor="middle" fill="white" font-size="11">Edge JP</text>
  <rect x="320" y="110" width="100" height="35" rx="8" fill="#6c5ce7"/>
  <text x="370" y="132" text-anchor="middle" fill="white" font-size="11">Edge US</text>
  <rect x="460" y="110" width="100" height="35" rx="8" fill="#6c5ce7"/>
  <text x="510" y="132" text-anchor="middle" fill="white" font-size="11">Edge EU</text>

  <text x="90" y="180" text-anchor="middle" font-size="18">🇻🇳</text>
  <text x="230" y="180" text-anchor="middle" font-size="18">🇯🇵</text>
  <text x="370" y="180" text-anchor="middle" font-size="18">🇺🇸</text>
  <text x="510" y="180" text-anchor="middle" font-size="18">🇪🇺</text>

  <line x1="300" y1="60" x2="90" y2="110" stroke="#5a5a72" stroke-width="1.5"/>
  <line x1="300" y1="60" x2="230" y2="110" stroke="#5a5a72" stroke-width="1.5"/>
  <line x1="300" y1="60" x2="370" y2="110" stroke="#5a5a72" stroke-width="1.5"/>
  <line x1="300" y1="60" x2="510" y2="110" stroke="#5a5a72" stroke-width="1.5"/>
</svg>
<div class="diagram-caption">Origin sync data ra các edge gần user</div>
</div>

<h2>📂 CDN cache gì?</h2>
<ul>
  <li>Ảnh, video, CSS, JS - <strong>static assets</strong>.</li>
  <li>HTML cache có chiến lược.</li>
  <li>API response cũng có thể cache (Cache-Control header).</li>
</ul>

<h2>🔄 Quy trình</h2>
<ol>
  <li>User vào <code>shop.com/image.jpg</code></li>
  <li>DNS trả IP của edge gần nhất.</li>
  <li>Edge có cache → trả ngay (cache HIT).</li>
  <li>Không có → edge xin origin → trả về user + lưu cache (cache MISS).</li>
  <li>Lần sau user khác hỏi → có ngay.</li>
</ol>

<h2>🛒 Nhà cung cấp CDN</h2>
<div class="cards">
  <div class="card"><div class="emoji">☁️</div><h4>CloudFlare</h4><p>Free tier mạnh, DDoS protection.</p></div>
  <div class="card"><div class="emoji">🚀</div><h4>Akamai</h4><p>"Ông tổ" CDN, dùng cho enterprise.</p></div>
  <div class="card"><div class="emoji">🅰️</div><h4>AWS CloudFront</h4><p>Tích hợp AWS tốt.</p></div>
  <div class="card"><div class="emoji">⚡</div><h4>Fastly</h4><p>Edge compute mạnh.</p></div>
</div>

<h2>⚙️ Cache-Control header</h2>
<pre><code>Cache-Control: public, max-age=86400
# public = mọi cache được lưu
# max-age=86400 = lưu 1 ngày (86400 giây)

Cache-Control: no-cache         # Phải hỏi origin trước khi dùng
Cache-Control: no-store         # Không được cache
Cache-Control: private          # Chỉ browser cache, CDN không
Cache-Control: immutable        # File không bao giờ đổi (file có hash)</code></pre>

<h2>🔁 Cache invalidation</h2>
<p>Khi bạn cập nhật ảnh nhưng CDN vẫn trả ảnh cũ → cần purge cache:</p>
<ul>
  <li>Đổi URL: <code>image.v2.jpg</code> hoặc <code>image.jpg?v=2</code>.</li>
  <li>Gọi API purge của CDN.</li>
  <li>Đặt TTL ngắn (nhưng performance giảm).</li>
</ul>

<div class="callout tip">
<div class="callout-title">💡 Cool trick</div>
<p>Dùng hash trong tên file: <code>main.a3f9c.js</code>. File đổi → hash đổi → URL khác → bypass cache tự nhiên.</p>
</div>
`
  },

  /* ============================================================
   * CHƯƠNG 14: MICROSERVICES
   * ============================================================ */
  {
    group: "🏛️ Phần 3: Kiến trúc nâng cao",
    icon: "🧩",
    title: "Chương 14: Monolith vs Microservices",
    content: `
<h1>Chương 14: Monolith vs Microservices</h1>
<p class="subtitle">Quán phở 1 chủ vs Chuỗi nhà hàng nhiều bếp 🏪</p>

<h2>🏠 Monolith - Một mái nhà</h2>
<p>Tất cả tính năng (user, order, payment, email) nằm trong 1 codebase, 1 process, 1 DB.</p>

<h3>✅ Ưu</h3>
<ul>
  <li>Đơn giản, dễ phát triển ban đầu.</li>
  <li>Triển khai 1 lần là xong.</li>
  <li>Debug dễ (stack trace trong 1 process).</li>
</ul>

<h3>❌ Nhược</h3>
<ul>
  <li>Code lớn dần → khó maintain.</li>
  <li>1 module bug → cả app sập.</li>
  <li>Scale toàn bộ chứ không chọn lọc.</li>
  <li>Khó dùng nhiều ngôn ngữ/team.</li>
</ul>

<h2>🧩 Microservices - Nhiều ngôi nhà nhỏ</h2>
<p>Mỗi tính năng = 1 service riêng, có DB riêng, deploy độc lập.</p>

<div class="diagram">
<svg viewBox="0 0 600 220" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="20" width="560" height="40" rx="8" fill="#ff5e7a"/>
  <text x="300" y="45" text-anchor="middle" fill="white" font-weight="700">API Gateway</text>

  <rect x="20" y="90" width="120" height="60" rx="8" fill="#6c5ce7"/>
  <text x="80" y="125" text-anchor="middle" fill="white" font-size="12">User Service</text>
  <rect x="160" y="90" width="120" height="60" rx="8" fill="#6c5ce7"/>
  <text x="220" y="125" text-anchor="middle" fill="white" font-size="12">Order Service</text>
  <rect x="300" y="90" width="120" height="60" rx="8" fill="#6c5ce7"/>
  <text x="360" y="125" text-anchor="middle" fill="white" font-size="12">Payment</text>
  <rect x="440" y="90" width="120" height="60" rx="8" fill="#6c5ce7"/>
  <text x="500" y="125" text-anchor="middle" fill="white" font-size="12">Notification</text>

  <rect x="40" y="170" width="80" height="30" rx="6" fill="#00d2a8"/>
  <text x="80" y="190" text-anchor="middle" fill="white" font-size="10">DB Users</text>
  <rect x="180" y="170" width="80" height="30" rx="6" fill="#00d2a8"/>
  <text x="220" y="190" text-anchor="middle" fill="white" font-size="10">DB Orders</text>
  <rect x="320" y="170" width="80" height="30" rx="6" fill="#00d2a8"/>
  <text x="360" y="190" text-anchor="middle" fill="white" font-size="10">DB Payments</text>
  <rect x="460" y="170" width="80" height="30" rx="6" fill="#00d2a8"/>
  <text x="500" y="190" text-anchor="middle" fill="white" font-size="10">Queue</text>
</svg>
<div class="diagram-caption">Microservices: mỗi service có DB riêng</div>
</div>

<h3>✅ Ưu</h3>
<ul>
  <li>Scale từng service độc lập.</li>
  <li>Team nhỏ chủ động (mỗi team 1 service).</li>
  <li>Lỗi 1 service không sập cả hệ thống.</li>
  <li>Mỗi service dùng ngôn ngữ phù hợp (User dùng Java, AI dùng Python).</li>
</ul>

<h3>❌ Nhược</h3>
<ul>
  <li>Phức tạp: networking, distributed transaction, monitoring.</li>
  <li>Latency tăng (call qua network).</li>
  <li>Debug khó (trace nhiều service).</li>
  <li>DevOps phải mạnh.</li>
</ul>

<h2>🔗 Communication patterns</h2>
<h3>Sync (REST/gRPC)</h3>
<pre><code>Order Service → call → Payment Service → trả về kết quả</code></pre>

<h3>Async (Message Queue)</h3>
<pre><code>Order Service → publish "OrderCreated" → Payment Service nhận → xử lý
                                       → Email Service nhận → gửi mail
                                       → Inventory Service → trừ hàng</code></pre>

<h2>🚪 API Gateway</h2>
<p>Điểm vào duy nhất cho client. Xử lý: auth, rate limit, routing, aggregate.</p>
<pre><code>Client → API Gateway →
  /users/*  → User Service
  /orders/* → Order Service
  /pay/*    → Payment Service</code></pre>

<h2>🎯 Khi nào nên dùng?</h2>
<table>
  <tr><th>Bắt đầu với</th><th>Khi nào tách</th></tr>
  <tr><td>Monolith</td><td>Team > 10 dev, có module rõ ràng, traffic scale khác nhau</td></tr>
</table>

<div class="callout warn">
<div class="callout-title">⚠️ Lời cảnh báo</div>
<p>"Microservice premature" còn tệ hơn monolith. Netflix, Amazon đều bắt đầu monolith rồi mới tách. Đừng overengineer!</p>
</div>

<h2>🎮 Service Discovery</h2>
<p>Với 100 service và auto-scale, làm sao biết service X ở IP nào?</p>
<ul>
  <li><strong>Consul, Eureka</strong>: Service đăng ký → client query.</li>
  <li><strong>Kubernetes DNS</strong>: <code>order-service.default.svc</code> tự resolve.</li>
</ul>

<h2>💔 Circuit Breaker</h2>
<p>Service Payment chết. Order Service vẫn gọi → tốn thời gian timeout. Circuit Breaker phát hiện và "ngắt mạch" tạm thời.</p>
<pre><code>if (paymentService.failureRate > 50%) {
  circuit.open();  // Không gọi nữa, trả lỗi ngay
}
// 30s sau thử lại</code></pre>
`
  },

  /* ============================================================
   * CHƯƠNG 15: EVENT-DRIVEN
   * ============================================================ */
  {
    group: "🏛️ Phần 3: Kiến trúc nâng cao",
    icon: "⚡",
    title: "Chương 15: Event-Driven Architecture",
    content: `
<h1>Chương 15: Event-Driven Architecture</h1>
<p class="subtitle">Đảo lộn cách suy nghĩ: thay vì "gọi" hãy "đăng báo" 📢</p>

<h2>📢 Khái niệm</h2>
<p>Thay vì service A gọi trực tiếp service B, A <strong>phát ra sự kiện</strong>: "User mới đăng ký!". Ai quan tâm thì lắng nghe.</p>

<h2>🎭 So sánh</h2>
<h3>Request-driven (cũ)</h3>
<pre><code>function registerUser(data) {
  const user = db.insert(data);
  emailService.send(user.email);       // gọi
  smsService.send(user.phone);         // gọi
  analyticsService.track('signup');    // gọi
  loyaltyService.addPoints(user.id);   // gọi
  // Thêm tính năng = sửa hàm này = coupling
}</code></pre>

<h3>Event-driven (mới)</h3>
<pre><code>function registerUser(data) {
  const user = db.insert(data);
  eventBus.publish('UserRegistered', { userId: user.id, email: user.email });
  // Xong! Không cần biết ai quan tâm.
}

// Mỗi service tự subscribe
emailService.on('UserRegistered', sendWelcomeEmail);
smsService.on('UserRegistered', sendWelcomeSMS);
analyticsService.on('UserRegistered', track);
loyaltyService.on('UserRegistered', addBonus);</code></pre>

<h2>🎯 Lợi ích</h2>
<ul>
  <li><strong>Loose coupling</strong>: Service A không biết B, C, D tồn tại.</li>
  <li><strong>Extensible</strong>: Thêm service mới chỉ cần subscribe.</li>
  <li><strong>Resilient</strong>: Service down → message ở queue, restart lại nhận.</li>
</ul>

<h2>🏗️ Event Sourcing</h2>
<p>Thay vì lưu trạng thái hiện tại, lưu <strong>chuỗi sự kiện</strong> đã xảy ra.</p>
<pre><code>// Cách cũ
account = { balance: 100 }

// Event Sourcing
events = [
  { type: 'AccountOpened', amount: 0 },
  { type: 'Deposited', amount: 200 },
  { type: 'Withdrawn', amount: 100 },
  { type: 'Withdrawn', amount: 50 }
]
// → balance = 50 (replay events)</code></pre>

<p>Lợi: audit, time-travel debug, rebuild state.</p>

<h2>🌊 CQRS - Command Query Responsibility Segregation</h2>
<p>Tách model "ghi" và "đọc" thành 2 phần riêng:</p>
<ul>
  <li><strong>Command</strong>: thay đổi (CreateOrder, UpdateUser) - ghi vào DB chính.</li>
  <li><strong>Query</strong>: đọc - từ DB read-optimized (ElasticSearch, Redis cache).</li>
</ul>

<div class="diagram">
<svg viewBox="0 0 600 200" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="80" width="80" height="40" rx="8" fill="#ff5e7a"/>
  <text x="60" y="105" text-anchor="middle" fill="white" font-size="12">User</text>

  <rect x="160" y="30" width="120" height="35" rx="8" fill="#6c5ce7"/>
  <text x="220" y="52" text-anchor="middle" fill="white" font-size="11">Command Handler</text>
  <rect x="160" y="135" width="120" height="35" rx="8" fill="#6c5ce7"/>
  <text x="220" y="157" text-anchor="middle" fill="white" font-size="11">Query Handler</text>

  <rect x="340" y="30" width="100" height="35" rx="8" fill="#00d2a8"/>
  <text x="390" y="52" text-anchor="middle" fill="white" font-size="11">Write DB</text>
  <rect x="340" y="135" width="100" height="35" rx="8" fill="#00d2a8"/>
  <text x="390" y="157" text-anchor="middle" fill="white" font-size="11">Read DB</text>

  <line x1="440" y1="65" x2="440" y2="135" stroke="#f9a826" stroke-width="2" stroke-dasharray="4"/>
  <text x="475" y="100" font-size="10" fill="#f9a826">sync</text>

  <line x1="100" y1="95" x2="160" y2="50" stroke="#5a5a72"/>
  <line x1="100" y1="105" x2="160" y2="152" stroke="#5a5a72"/>
  <line x1="280" y1="47" x2="340" y2="47" stroke="#5a5a72"/>
  <line x1="280" y1="152" x2="340" y2="152" stroke="#5a5a72"/>
</svg>
<div class="diagram-caption">CQRS: Tách write và read</div>
</div>

<h2>🌀 Saga Pattern</h2>
<p>Distributed transaction (đặt vé máy bay + khách sạn + taxi). Không có ACID giữa services. Saga = chuỗi step + compensating action.</p>
<pre><code>1. Book flight     ✅
2. Book hotel      ✅
3. Book taxi       ❌ (fail!)
→ Compensate:
3'. (taxi không cần huỷ vì chưa đặt được)
2'. Cancel hotel   ✅
1'. Cancel flight  ✅</code></pre>

<div class="callout fun">
<div class="callout-title">😎 Real-world</div>
<p>Uber dùng event-driven mạnh. "Trip Requested" → matchmaking → driver service → payment service → notification, tất cả qua events.</p>
</div>
`
  },
];

window.CHAPTERS.push(..._PART2);
