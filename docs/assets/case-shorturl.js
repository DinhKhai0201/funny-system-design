/* =========================================================
 * CHƯƠNG 24: SHORT URL SERVICE - DEEP DIVE
 * Phiên bản phỏng vấn FAANG: capacity, schema, trade-offs, bottlenecks
 * ========================================================= */

window.CHAPTERS = window.CHAPTERS || [];

window.CHAPTERS.push({
  group: "🎯 Phần 4: Case Study huyền thoại",
  icon: "🔗",
  title: "Chương 24: Short URL - Thiết kế Bit.ly (Deep Dive)",
  content: `
<h1>Chương 24: Short URL Service</h1>
<p class="subtitle">Một bài phỏng vấn kinh điển - cách trả lời như Senior 🔗</p>

<h2>🧭 Lộ trình phỏng vấn 45 phút</h2>
<table>
<tr><th>Phút</th><th>Việc</th></tr>
<tr><td>0-5</td><td>Clarify requirements - đừng vội nhảy vào thiết kế</td></tr>
<tr><td>5-10</td><td>Capacity estimation (back-of-envelope)</td></tr>
<tr><td>10-15</td><td>High-level design</td></tr>
<tr><td>15-25</td><td>Deep dive: ID generation, schema, API</td></tr>
<tr><td>25-35</td><td>Scaling: cache, sharding, read replica</td></tr>
<tr><td>35-45</td><td>Edge cases, follow-up: analytics, security</td></tr>
</table>

<h2>📋 Bước 1: Clarify Requirements</h2>
<p>Đừng nhảy vào code. Hỏi interviewer:</p>

<h3>Functional</h3>
<ul>
<li>✅ Rút gọn long URL → short URL (~7 ký tự).</li>
<li>✅ Click short URL → redirect đến long URL (HTTP 301/302).</li>
<li>✅ Custom alias: <code>bit.ly/my-promo</code>.</li>
<li>✅ TTL / expiration (vd 1 năm).</li>
<li>✅ User account (optional) - track URL của mình.</li>
<li>✅ Analytics: click count, geo, referrer.</li>
</ul>

<h3>Non-functional</h3>
<ul>
<li>🔥 <strong>Read-heavy</strong>: ratio Read:Write = 100:1.</li>
<li>⚡ Latency: P99 < 100ms cho redirect.</li>
<li>🛡️ Availability 99.99% (53 phút downtime/năm).</li>
<li>🎯 Short URL không thể đoán (security).</li>
<li>📈 Mở rộng tới hàng tỷ URL.</li>
</ul>

<h3>Out of scope</h3>
<ul>
<li>❌ Edit URL sau khi tạo.</li>
<li>❌ Real-time analytics dashboard.</li>
</ul>

<h2>📊 Bước 2: Capacity Estimation</h2>

<h3>Traffic</h3>
<pre><code>Giả định:
- 500M URL tạo / tháng
- Read:Write = 100:1
- 30 ngày × 24h × 3600s ≈ 2.6M giây/tháng

Write QPS = 500M / 2.6M ≈ 200 URL/giây
Peak write QPS = 200 × 3 = 600/giây (3x average)

Read QPS = 200 × 100 = 20,000/giây
Peak read QPS = 60,000/giây</code></pre>

<h3>Storage</h3>
<pre><code>Mỗi record:
- id (8 byte)
- short_code (7 byte)
- long_url (avg 100 byte)
- user_id (8 byte)
- created_at (8 byte)
- expires_at (8 byte)
- click_count (8 byte)
≈ 150 byte / record (làm tròn 500B với overhead, index)

5 năm × 12 tháng × 500M × 500B = 15 TB

Click logs (analytics): mỗi click 100B
1B click/ngày × 100B × 365 × 5 = 180 TB (cần data warehouse)</code></pre>

<h3>Bandwidth</h3>
<pre><code>Write: 200/s × 500B = 100 KB/s (không đáng kể)
Read: 20,000/s × 500B = 10 MB/s (vẫn nhỏ vì redirect chỉ trả header)</code></pre>

<h3>Cache</h3>
<pre><code>Theo nguyên lý 80-20: 20% URL chiếm 80% traffic
Daily reads: 20,000 × 86400 ≈ 1.7B
Hot URL: 20% × 1.7B = 340M URL/ngày
Cache: 340M × 500B = 170 GB RAM (1 cụm Redis cluster)</code></pre>

<div class="callout tip">
<div class="callout-title">💡 Trick phỏng vấn</div>
<p>Luôn nói rõ giả định ra miệng: "I assume 500M URLs/month, read:write 100:1...". Interviewer thường gật đầu hoặc chỉnh số liệu, từ đó bạn biết họ quan tâm gì.</p>
</div>

<h2>🏗️ Bước 3: High-Level Design</h2>

<div class="diagram">
<svg viewBox="0 0 720 320" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="140" width="80" height="40" rx="8" fill="#ff5e7a"/>
  <text x="60" y="165" text-anchor="middle" fill="white" font-size="11">Client</text>

  <rect x="140" y="140" width="100" height="40" rx="8" fill="#6c5ce7"/>
  <text x="190" y="165" text-anchor="middle" fill="white" font-size="11">CDN / DNS</text>

  <rect x="280" y="140" width="100" height="40" rx="8" fill="#6c5ce7"/>
  <text x="330" y="165" text-anchor="middle" fill="white" font-size="11">Load Balancer</text>

  <rect x="420" y="80" width="120" height="35" rx="8" fill="#6c5ce7"/>
  <text x="480" y="103" text-anchor="middle" fill="white" font-size="11">App Server (Read)</text>
  <rect x="420" y="140" width="120" height="35" rx="8" fill="#6c5ce7"/>
  <text x="480" y="163" text-anchor="middle" fill="white" font-size="11">App Server (Read)</text>
  <rect x="420" y="200" width="120" height="35" rx="8" fill="#6c5ce7"/>
  <text x="480" y="223" text-anchor="middle" fill="white" font-size="11">Write Server</text>

  <rect x="580" y="20" width="120" height="35" rx="8" fill="#f9a826"/>
  <text x="640" y="42" text-anchor="middle" fill="white" font-size="11">ID Generator</text>

  <rect x="580" y="80" width="120" height="35" rx="8" fill="#f9a826"/>
  <text x="640" y="102" text-anchor="middle" fill="white" font-size="11">Redis Cache</text>

  <rect x="580" y="140" width="120" height="35" rx="8" fill="#00d2a8"/>
  <text x="640" y="162" text-anchor="middle" fill="white" font-size="11">DB (sharded)</text>

  <rect x="580" y="200" width="120" height="35" rx="8" fill="#00d2a8"/>
  <text x="640" y="222" text-anchor="middle" fill="white" font-size="11">Read Replicas</text>

  <rect x="580" y="260" width="120" height="35" rx="8" fill="#00d2a8"/>
  <text x="640" y="282" text-anchor="middle" fill="white" font-size="11">Kafka → Analytics</text>

  <line x1="100" y1="160" x2="140" y2="160" stroke="#5a5a72"/>
  <line x1="240" y1="160" x2="280" y2="160" stroke="#5a5a72"/>
  <line x1="380" y1="160" x2="420" y2="100" stroke="#5a5a72"/>
  <line x1="380" y1="160" x2="420" y2="158" stroke="#5a5a72"/>
  <line x1="380" y1="160" x2="420" y2="218" stroke="#5a5a72"/>
  <line x1="540" y1="218" x2="580" y2="38" stroke="#5a5a72" stroke-dasharray="3"/>
  <line x1="540" y1="98" x2="580" y2="98" stroke="#5a5a72"/>
  <line x1="540" y1="218" x2="580" y2="158" stroke="#5a5a72"/>
  <line x1="540" y1="158" x2="580" y2="218" stroke="#5a5a72"/>
  <line x1="540" y1="218" x2="580" y2="278" stroke="#5a5a72" stroke-dasharray="3"/>
</svg>
<div class="diagram-caption">Kiến trúc tổng thể - tách read/write, có cache, ID generator riêng</div>
</div>

<h2>🔑 Bước 4: Deep Dive - ID Generation</h2>

<h3>Approach 1: Hash (MD5/SHA256)</h3>
<pre><code>short = base62(md5(longUrl + salt))[0..7]</code></pre>
<p><strong>Vấn đề:</strong></p>
<ul>
<li>❌ Collision khi 2 URL khác nhau hash trùng prefix (sinh nhật paradox).</li>
<li>❌ Cùng URL hash ra cùng kết quả → user không thể có 2 short khác nhau cho cùng URL.</li>
<li>❌ Phải check collision → query DB.</li>
</ul>

<h3>Approach 2: Counter + Base62 ⭐</h3>
<p>Mỗi URL có ID auto-increment. Convert sang base62 (a-z, A-Z, 0-9).</p>
<pre><code>62^7 = 3.5 × 10^12 ≈ 3.5 trillion URL khác nhau với 7 ký tự</code></pre>

<p><strong>Vấn đề:</strong> single counter = single point of bottleneck.</p>

<h3>Approach 3: Distributed Counter (Ticket Server)</h3>
<p>Multiple counter server, mỗi server phục vụ 1 dải:</p>
<pre><code>Server A: 1 → 1,000,000
Server B: 1,000,001 → 2,000,000
Server C: 2,000,001 → 3,000,000

Khi A hết dải → xin ZooKeeper dải mới (1B → 1B+1M)</code></pre>

<h3>Approach 4: Snowflake (Twitter) ⭐⭐</h3>
<p>64-bit ID không cần coordinate giữa các server:</p>
<pre><code>┌─────────────────────────────────────────────────────────┐
│ 1 bit │ 41 bit timestamp │ 10 bit machine │ 12 bit seq │
└─────────────────────────────────────────────────────────┘

- 41 bit timestamp (ms): ~69 năm
- 10 bit machine ID: 1024 server
- 12 bit sequence: 4096 ID/ms/server
- Total: 4096 × 1024 = 4M ID/ms = 4 tỷ ID/giây</code></pre>

<pre><code>function snowflake() {
  const timestamp = Date.now() - EPOCH;       // 41 bit
  const machineId = MACHINE_ID;                // 10 bit
  const sequence = (++seq) & 0xFFF;            // 12 bit

  return (BigInt(timestamp) << 22n) |
         (BigInt(machineId) << 12n) |
         BigInt(sequence);
}</code></pre>

<h3>So sánh trade-offs</h3>
<table>
<tr><th>Cách</th><th>Ưu</th><th>Nhược</th></tr>
<tr><td>Hash</td><td>Đơn giản, idempotent</td><td>Collision, fixed-length cố định</td></tr>
<tr><td>Single counter</td><td>Ngắn nhất, sequential</td><td>Bottleneck, SPOF</td></tr>
<tr><td>Ticket Server</td><td>Distributed, ngắn</td><td>Phụ thuộc ZooKeeper</td></tr>
<tr><td>Snowflake</td><td>No coordination, time-sorted</td><td>Clock skew nguy hiểm, ID dài hơn</td></tr>
</table>

<h2>💾 Bước 5: Database Schema</h2>

<h3>Cách 1: Single SQL DB (giai đoạn đầu)</h3>
<pre><code>CREATE TABLE urls (
  id BIGINT PRIMARY KEY,
  short_code VARCHAR(10) UNIQUE NOT NULL,
  long_url TEXT NOT NULL,
  user_id BIGINT,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  click_count BIGINT DEFAULT 0
);

CREATE UNIQUE INDEX idx_short_code ON urls(short_code);
CREATE INDEX idx_user_created ON urls(user_id, created_at DESC);
CREATE INDEX idx_expires ON urls(expires_at) WHERE expires_at IS NOT NULL;</code></pre>

<h3>Cách 2: NoSQL (DynamoDB / Cassandra) - khi scale lớn</h3>
<pre><code>Primary Key: short_code (partition key)
Attributes: long_url, user_id, created_at, expires_at, click_count

GSI: user_id → list URLs của user
TTL: expires_at - tự xoá khi hết hạn</code></pre>

<p><strong>Tại sao NoSQL?</strong> Không cần JOIN, query chính là <code>GET by short_code</code> - perfect cho key-value store. Scale ngang dễ.</p>

<div class="callout tip">
<div class="callout-title">🤔 Tại sao không dùng SQL luôn?</div>
<p>SQL (PostgreSQL) hoàn toàn được cho 200 write/s — chưa cần NoSQL đâu! Nhưng khi <strong>lên 100K write/s + 15TB data</strong>, SQL gặp vấn đề: sharding phức tạp (manual), auto-delete theo TTL không native. DynamoDB có sẵn partition + TTL auto-delete + global table. <strong>Senior answer</strong>: "Bắt đầu với PostgreSQL, chuyển DynamoDB khi scale cần."</p>
</div>

<h2>🔌 Bước 6: API Design</h2>

<pre><code>POST /api/v1/shorten
Authorization: Bearer &lt;jwt&gt;
{
  "url": "https://very-long-url.com/path?q=1",
  "custom_alias": "my-promo",     // optional
  "expires_at": "2027-01-01"       // optional
}

Response 201:
{
  "short_url": "https://bit.ly/abc1234",
  "short_code": "abc1234",
  "long_url": "...",
  "expires_at": "2027-01-01"
}

Response 409 (custom alias đã tồn tại):
{ "error": "alias_taken" }

---

GET /:short_code
→ HTTP 301 Moved Permanently
   Location: https://very-long-url.com/...
   Cache-Control: private, max-age=86400

(Hoặc 302 Found nếu muốn track click mỗi lần)</code></pre>

<h3>301 vs 302 - tranh cãi muôn thuở</h3>
<table>
<tr><th></th><th>301 Permanent</th><th>302 Found</th></tr>
<tr><td>Browser cache</td><td>Có (lâu)</td><td>Không / ngắn</td></tr>
<tr><td>SEO juice</td><td>Truyền qua</td><td>Không truyền</td></tr>
<tr><td>Analytics</td><td>Không track được click lặp</td><td>Track được mọi click</td></tr>
</table>
<p>👉 Bit.ly chọn <strong>301</strong> cho SEO. Nếu cần analytics chính xác → dùng <strong>302</strong>.</p>

<div class="callout fun">
<div class="callout-title">🤔 Tại sao Snowflake mà không dùng hash?</div>
<p>Hash (MD5/SHA) đơn giản nhưng có <strong>birthday paradox</strong>: với 1 tỉ URL, xác suất collision là đáng kể — phải check DB mỗi lần. Snowflake đảm bảo <strong>zero collision by design</strong> (mỗi server có machine ID riêng), time-sortable (để debug), và không cần coordinate giữa các server. Trade-off: ID dài hơn (7-8 ký tự thay vì có thể ngắn hơn).</p>
</div>

<h2>🔄 Bước 7: Flow chi tiết</h2>

<h3>Tạo short URL (Write path)</h3>
<pre><code>POST /shorten { url: "..." }

1. Validate URL (regex, blacklist domain phishing)
2. Check authentication, rate limit (vd 100/giờ/user)
3. Idempotency check:
   - Nếu user gửi cùng URL trong 5 phút → trả lại short cũ
   - Lookup Redis: idem:{userId}:{md5(url)}
4. Generate ID:
   - id = snowflakeGen.next()
   - short_code = base62(id)
5. INSERT DB (handle UNIQUE constraint nếu collision)
6. Pre-warm cache: SET short:{code} → longUrl, TTL=1h
7. Async: ghi event vào Kafka cho analytics
8. Return { short_url }

Latency target: P99 < 200ms</code></pre>

<h3>Redirect (Read path - hot path)</h3>
<pre><code>GET /abc1234

1. (Optional) CDN edge: nếu hot URL, trả ngay tại edge
2. App server: GET Redis short:abc1234
   - HIT (95%): return 301
3. MISS: query Read Replica DB
   - SELECT long_url FROM urls WHERE short_code='abc1234'
   - Nếu expires_at < NOW: return 410 Gone
4. SET Redis (TTL 1 ngày)
5. Async (Kafka): { event: 'click', short_code, ip, ua, ts }
6. HTTP 301 → long_url

Latency target: P99 < 50ms</code></pre>

<h2>📈 Bước 8: Scaling Deep Dive</h2>

<h3>Bottleneck 1: Database write</h3>
<p>200 write/s là nhỏ, nhưng nếu lên 100K/s thì sao?</p>
<ul>
<li>Sharding theo <code>short_code</code> (hash-based).</li>
<li>Write-behind cache: ghi Redis trước, async flush vào DB.</li>
</ul>

<h3>Bottleneck 2: Hot URL</h3>
<p>1 URL viral (vd quảng cáo Super Bowl) nhận 1M req/s vào cùng 1 shard:</p>
<ul>
<li>CDN cache → 99% request không tới origin.</li>
<li>Local in-memory cache trên app server (LRU 10K entries).</li>
<li>Phát hiện hot key → replicate sang nhiều cache node.</li>
</ul>

<h3>Bottleneck 3: Cache miss storm</h3>
<p>Cache restart → 100% miss → DB cháy. Giải pháp:</p>
<ul>
<li><strong>Cache warming</strong>: load top 10% URL vào cache ngay khi khởi động.</li>
<li><strong>Request coalescing</strong>: 1000 request cùng miss cùng key → chỉ 1 query DB.</li>
</ul>

<pre><code>// Singleflight pattern
const inflight = new Map();

async function getLongUrl(code) {
  const cached = await redis.get('short:' + code);
  if (cached) return cached;

  if (inflight.has(code)) return inflight.get(code);

  const promise = db.query('SELECT long_url FROM urls WHERE short_code=?', [code])
    .then(row => {
      redis.setex('short:' + code, 3600, row.long_url);
      inflight.delete(code);
      return row.long_url;
    });

  inflight.set(code, promise);
  return promise;
}</code></pre>

<h3>Bottleneck 4: ID generation</h3>
<p>Snowflake mỗi server tự gen, không bottleneck. Nhưng clock skew nguy hiểm:</p>
<ul>
<li>NTP sync mọi server.</li>
<li>Nếu clock quay ngược → throw error, không gen ID.</li>
</ul>

<h2>🎯 Bước 9: Edge Cases & Follow-up Questions</h2>

<h3>Q1: Custom alias trùng?</h3>
<p>Dùng atomic INSERT với UNIQUE constraint. Catch lỗi → trả 409. Hoặc dùng Redis SETNX trước, sau đó INSERT DB.</p>

<h3>Q2: Phishing / malware URL?</h3>
<ul>
<li>Khi tạo: check qua Google Safe Browsing API.</li>
<li>Khi redirect: nếu URL bị flag, hiện trang cảnh báo.</li>
<li>Người dùng có thể report → admin review.</li>
</ul>

<h3>Q3: Analytics chi tiết (click count, geo)?</h3>
<p>Kafka stream → Flink aggregate theo cửa sổ 5 phút → ghi ClickHouse/BigQuery cho query analytics.</p>

<pre><code>// Aggregated table (ClickHouse)
CREATE TABLE click_stats (
  short_code String,
  date Date,
  country String,
  device String,
  count UInt64
) ENGINE = SummingMergeTree()
ORDER BY (short_code, date, country, device);</code></pre>

<h3>Q4: URL có thể xoá không?</h3>
<p>Soft delete: <code>UPDATE urls SET deleted_at = NOW()</code>. Cron job xoá vĩnh viễn sau 30 ngày. Invalidate cache.</p>

<h3>Q5: User không có account?</h3>
<p>Anonymous → short URL không có owner, expires sau 90 ngày. Dùng IP + rate limit để chống spam.</p>

<h3>Q6: Đếm click có cần realtime?</h3>
<ul>
<li>Approximation: increment Redis counter (eventual consistency).</li>
<li>Exact: dùng atomic counter trong DB - chậm hơn nhưng chính xác.</li>
<li>Compromise: realtime trong Redis, batch flush vào DB mỗi 1 phút.</li>
</ul>

<h3>Q7: Multi-region?</h3>
<ul>
<li>DB replicate cross-region (async).</li>
<li>Mỗi region có shard ID prefix riêng để tránh ID conflict.</li>
<li>Conflict resolution: last-write-wins hoặc CRDT cho click count.</li>
</ul>

<h2>🛡️ Bước 10: Security</h2>
<ul>
<li><strong>Rate limit</strong>: 100 URL/giờ/user, 10K/giờ/IP.</li>
<li><strong>HTTPS only</strong>: redirect không bị MITM.</li>
<li><strong>Short code không đoán được</strong>: Snowflake ID base62 đủ random với người ngoài, nhưng vẫn sequential. Nếu cần unpredictable: <code>base62(encrypt(id, key))</code>.</li>
<li><strong>CSRF token</strong> cho API tạo URL.</li>
<li><strong>Bot detection</strong>: CAPTCHA khi tạo nhiều URL liên tiếp.</li>
</ul>

<h2>🏆 Tổng kết - Câu trả lời gói gọn 2 phút</h2>
<div class="callout fun">
<div class="callout-title">🎤 Pitch interview</div>
<p>"Tôi sẽ design URL shortener với <strong>Snowflake ID generator</strong> tránh single-counter bottleneck, encode <strong>base62 7 ký tự</strong> cho 3.5 trillion URL. Dùng <strong>Redis cache</strong> cho 95% hot reads với LRU eviction. DB là <strong>DynamoDB</strong> sharded theo short_code, có TTL tự xoá URL hết hạn. Read traffic 60K QPS chia ra <strong>multiple read replicas</strong>. Click events đẩy <strong>Kafka → Flink → ClickHouse</strong> cho analytics. CDN edge cache top URL. Tổng cost ước ~$50K/tháng cho 500M URL/tháng. Để scale 10x, chỉ cần thêm shard + read replica."</p>
</div>

<h2>📚 Trade-offs để nhớ</h2>
<ul>
<li><strong>SQL vs NoSQL</strong>: NoSQL thắng vì query đơn giản, scale ngang dễ.</li>
<li><strong>301 vs 302</strong>: 301 cho SEO, 302 cho analytics chính xác.</li>
<li><strong>Hash vs Counter</strong>: Counter thắng vì không collision, predictable length.</li>
<li><strong>Sync vs Async analytics</strong>: Async để không slow down redirect.</li>
<li><strong>Pre-allocate vs On-demand ID</strong>: On-demand (Snowflake) nhẹ hơn.</li>
</ul>

<h2>🧠 Quiz</h2>
<div class="quiz">
<div class="quiz-question">Tại sao dùng Base62 (a-z, A-Z, 0-9) thay vì Base64?</div>
<div class="quiz-options">
<div class="quiz-option" data-correct="false">Base64 quá dài</div>
<div class="quiz-option" data-correct="true">Base64 có ký tự '+' và '/' gây vấn đề trong URL</div>
<div class="quiz-option" data-correct="false">Base62 nhanh hơn</div>
<div class="quiz-option" data-correct="false">Base64 không hỗ trợ tiếng Anh</div>
</div>
</div>
`
});
