/* =========================================================
 * CHƯƠNG 16-23: SECURITY, OBSERVABILITY, PATTERNS NÂNG CAO
 * ========================================================= */

window.CHAPTERS = window.CHAPTERS || [];
const _PART3 = [

  /* ============================================================
   * CHƯƠNG 16: CONSISTENT HASHING
   * ============================================================ */
  {
    group: "🏛️ Phần 3: Kiến trúc nâng cao",
    icon: "🎡",
    title: "Chương 16: Consistent Hashing - Vòng quay may mắn",
    content: `
<h1>Chương 16: Consistent Hashing</h1>
<p class="subtitle">Khi bạn cần "chia đều" mà không muốn xáo trộn lại tất cả 🎡</p>

<h2>🤯 Vấn đề với hash thường</h2>
<p>Bạn có 4 server. Phân user bằng <code>hash(userId) % 4</code>:</p>
<pre><code>user 1234 → 1234 % 4 = 2 → Server 2
user 5678 → 5678 % 4 = 2 → Server 2</code></pre>

<p>Thêm 1 server (thành 5): <code>% 5</code> → <strong>gần như tất cả user phải dời server!</strong> Khủng hoảng cache, query!</p>

<h2>🎡 Consistent Hashing</h2>
<p>Đặt server và data trên 1 vòng tròn ảo (0 → 2³²-1). Mỗi key map tới server <strong>theo chiều kim đồng hồ</strong> gần nhất.</p>

<div class="diagram">
<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
  <circle cx="200" cy="150" r="100" fill="none" stroke="#5a5a72" stroke-width="2"/>
  <circle cx="200" cy="50" r="10" fill="#ff5e7a"/>
  <text x="200" y="35" text-anchor="middle" font-size="11" fill="currentColor">Server A</text>
  <circle cx="287" cy="200" r="10" fill="#6c5ce7"/>
  <text x="315" y="205" font-size="11" fill="currentColor">Server B</text>
  <circle cx="113" cy="200" r="10" fill="#00d2a8"/>
  <text x="55" y="205" font-size="11" fill="currentColor">Server C</text>

  <circle cx="250" cy="60" r="6" fill="#f9a826"/>
  <text x="265" y="55" font-size="10" fill="currentColor">key1 → B</text>
  <circle cx="160" cy="240" r="6" fill="#f9a826"/>
  <text x="80" y="260" font-size="10" fill="currentColor">key2 → C</text>
</svg>
<div class="diagram-caption">Key đi theo chiều kim đồng hồ tìm server kế</div>
</div>

<h2>🎯 Phép màu khi thêm/bớt node</h2>
<p>Thêm Server D vào giữa A và B:</p>
<ul>
  <li>Các key từ A đến D giờ về D.</li>
  <li>Các key khác <strong>không đổi</strong>!</li>
</ul>
<p>Chỉ <code>1/N</code> data bị di chuyển thay vì gần như tất cả.</p>

<h2>🪞 Virtual Nodes - "Mỗi server có nhiều bản"</h2>
<p>Vấn đề: nếu chỉ 3 server, vòng tròn bị chia không đều → load lệch.</p>
<p>Giải pháp: mỗi server có 100-1000 "virtual node" rải khắp vòng → load đều hơn nhiều.</p>

<h2>💻 Code đơn giản</h2>
<pre><code>class ConsistentHash {
  constructor(nodes = [], virtualCount = 100) {
    this.ring = new Map();
    this.sortedKeys = [];
    nodes.forEach(n => this.addNode(n, virtualCount));
  }
  hash(key) {
    let h = 0;
    for (const c of key) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    return h;
  }
  addNode(node, vCount) {
    for (let i = 0; i < vCount; i++) {
      const k = this.hash(node + '#' + i);
      this.ring.set(k, node);
    }
    this.sortedKeys = [...this.ring.keys()].sort((a,b) => a-b);
  }
  getNode(key) {
    const h = this.hash(key);
    for (const k of this.sortedKeys) {
      if (k >= h) return this.ring.get(k);
    }
    return this.ring.get(this.sortedKeys[0]); // wrap around
  }
}

const ch = new ConsistentHash(['s1', 's2', 's3']);
console.log(ch.getNode('user123'));  // s2
console.log(ch.getNode('user456'));  // s1</code></pre>

<h2>🌟 Dùng ở đâu?</h2>
<ul>
  <li><strong>Cache cluster</strong>: Memcached, Redis Cluster.</li>
  <li><strong>NoSQL</strong>: Cassandra, DynamoDB partition.</li>
  <li><strong>Load Balancer</strong>: gắn user-IP với server cố định.</li>
  <li><strong>P2P</strong>: BitTorrent DHT.</li>
</ul>

<div class="callout tip">
<div class="callout-title">💡 Liên tưởng vui</div>
<p>Như đồng hồ analog: kim phút đang ở số 3, "đi tiếp đến server gần nhất theo chiều kim". Thêm 1 mốc giữa số 5-6 chỉ ảnh hưởng vùng đó.</p>
</div>
`
  },

  /* ============================================================
   * CHƯƠNG 17: RATE LIMITING
   * ============================================================ */
  {
    group: "🏛️ Phần 3: Kiến trúc nâng cao",
    icon: "🚦",
    title: "Chương 17: Rate Limiting - Chống lũ request",
    content: `
<h1>Chương 17: Rate Limiting</h1>
<p class="subtitle">Cảnh sát giao thông của hệ thống 🚦</p>

<h2>💥 Vấn đề</h2>
<ul>
  <li>Bot scrape data → server nghẽn.</li>
  <li>User spam đăng ký → tạo 10000 tài khoản giả.</li>
  <li>DDoS attack → sập server.</li>
  <li>Bug client → vô tình gọi API 1000 lần/giây.</li>
</ul>

<h2>🧮 4 thuật toán phổ biến</h2>

<h3>1. Token Bucket - "Xô đầy mã thông báo"</h3>
<p>Tưởng tượng cái xô có 100 token. Mỗi giây có 10 token rơi vào. Mỗi request lấy 1 token. Hết token = bị từ chối.</p>
<pre><code>class TokenBucket {
  constructor(capacity = 100, refillRate = 10) {
    this.capacity = capacity;
    this.tokens = capacity;
    this.refillRate = refillRate;
    this.lastRefill = Date.now();
  }
  allow() {
    this.refill();
    if (this.tokens >= 1) {
      this.tokens--;
      return true;
    }
    return false;
  }
  refill() {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000;
    this.tokens = Math.min(this.capacity, this.tokens + elapsed * this.refillRate);
    this.lastRefill = now;
  }
}</code></pre>

<h3>2. Leaky Bucket - "Xô lỗ đáy"</h3>
<p>Request vào xô. Xô rò rỉ theo tốc độ cố định (vd 10 req/s). Xô đầy → từ chối. Smooth traffic.</p>

<h3>3. Fixed Window - "Khung giờ"</h3>
<p>Đếm trong khung 1 phút: cho phép tối đa 100 request. Đầu phút sau reset.</p>
<pre><code>requests[userId][currentMinute]++
if (requests[userId][currentMinute] > 100) deny();</code></pre>
<p>Nhược: có thể nổ 200 req trong 2 giây giáp ranh phút.</p>

<h3>4. Sliding Window - "Khung trượt"</h3>
<p>Đếm số request trong 60 giây gần nhất, không theo "đầu phút".</p>

<h2>📍 Đặt rate limit ở đâu?</h2>
<ul>
  <li><strong>API Gateway</strong>: phổ biến nhất (Kong, Cloudflare, AWS API Gateway).</li>
  <li><strong>Nginx</strong>: <code>limit_req_zone</code>.</li>
  <li><strong>Application code</strong>: chi tiết hơn (vd login: 5 lần/phút).</li>
</ul>

<h2>📝 Nginx config</h2>
<pre><code># Giới hạn 10 req/s mỗi IP, burst 20
limit_req_zone $binary_remote_addr zone=mylimit:10m rate=10r/s;

server {
  location /api/ {
    limit_req zone=mylimit burst=20 nodelay;
    proxy_pass http://backend;
  }
}</code></pre>

<h2>📤 Response chuẩn</h2>
<pre><code>HTTP/1.1 429 Too Many Requests
Retry-After: 60
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1715600000

{ "error": "Bạn gọi quá nhanh, thử lại sau 60 giây" }</code></pre>

<h2>🎯 Chiến lược phân tầng</h2>
<table>
  <tr><th>Tầng</th><th>Limit ví dụ</th></tr>
  <tr><td>Per IP</td><td>1000 req/giờ</td></tr>
  <tr><td>Per User</td><td>10000 req/giờ</td></tr>
  <tr><td>Per Endpoint</td><td>/login: 5/phút, /search: 100/phút</td></tr>
  <tr><td>Per Plan</td><td>Free: 100/day, Pro: 100K/day</td></tr>
</table>

<div class="callout fun">
<div class="callout-title">😎 Cool fact</div>
<p>GitHub API rate limit: 5000 request/giờ cho authenticated user, chỉ 60 cho anonymous. Mỗi response đều có header <code>X-RateLimit-Remaining</code> để client biết còn bao nhiêu.</p>
</div>
`
  },

  /* ============================================================
   * CHƯƠNG 18: SECURITY
   * ============================================================ */
  {
    group: "🏛️ Phần 3: Kiến trúc nâng cao",
    icon: "🔐",
    title: "Chương 18: Security - Bảo mật cơ bản",
    content: `
<h1>Chương 18: Security</h1>
<p class="subtitle">Khoá cửa nhà bạn trước khi đi ngủ 🔒</p>

<h2>🛡️ Tam giác CIA</h2>
<div class="cards">
  <div class="card"><div class="emoji">🤐</div><h4>Confidentiality</h4><p>Chỉ người được phép xem.</p></div>
  <div class="card"><div class="emoji">✅</div><h4>Integrity</h4><p>Không ai sửa được trộm.</p></div>
  <div class="card"><div class="emoji">⏰</div><h4>Availability</h4><p>Luôn truy cập được khi cần.</p></div>
</div>

<h2>🔑 Authentication vs Authorization</h2>
<ul>
  <li><strong>Authentication</strong>: <em>"Bạn là ai?"</em> - login, OTP, biometric.</li>
  <li><strong>Authorization</strong>: <em>"Bạn được phép làm gì?"</em> - RBAC, ABAC.</li>
</ul>

<h2>🗝️ Hash mật khẩu</h2>
<p>❌ KHÔNG BAO GIỜ lưu mật khẩu plaintext!</p>
<pre><code>// ❌ Tệ
db.insert({ email, password: '123456' });

// ❌ Hash không salt - bị rainbow table
const hash = md5(password);

// ✅ bcrypt với salt + cost
const bcrypt = require('bcrypt');
const hash = await bcrypt.hash(password, 12);
// $2b$12$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy

// Khi login
const isValid = await bcrypt.compare(inputPwd, hashFromDB);</code></pre>

<h2>🪪 JWT - Json Web Token</h2>
<p>Token gồm 3 phần ngăn cách bởi dấu chấm: <code>header.payload.signature</code></p>
<pre><code>{
  "header": { "alg": "HS256", "typ": "JWT" },
  "payload": { "userId": 123, "role": "admin", "exp": 1715600000 },
  "signature": "HMAC_SHA256(header.payload, SECRET)"
}</code></pre>

<p>Server không cần lưu session - chỉ verify chữ ký.</p>

<h2>🦹 Các tấn công phổ biến</h2>
<h3>1. SQL Injection</h3>
<pre><code>// ❌ NGUY HIỂM
db.query("SELECT * FROM users WHERE name='" + input + "'");

// User nhập: ' OR '1'='1
// → SELECT * FROM users WHERE name='' OR '1'='1' (lấy hết user!)

// ✅ Dùng prepared statement
db.query("SELECT * FROM users WHERE name = ?", [input]);</code></pre>

<h3>2. XSS - Cross-Site Scripting</h3>
<pre><code>// ❌ User comment: &lt;script&gt;steal(document.cookie)&lt;/script&gt;
document.innerHTML = userComment;

// ✅ Escape HTML
const safe = userComment
  .replace(/&/g, '&amp;')
  .replace(/&lt;/g, '&amp;lt;')
  .replace(/&gt;/g, '&amp;gt;');</code></pre>

<h3>3. CSRF - Cross-Site Request Forgery</h3>
<p>Web độc lừa browser bạn gửi request lên bank.com. Phòng chống: CSRF token.</p>

<h3>4. DDoS</h3>
<p>Botnet flood server. Phòng: rate limit, CDN, Cloudflare.</p>

<h2>🔐 HTTPS - Bắt buộc</h2>
<p>Free SSL với Let's Encrypt. Không có lý do dùng HTTP thuần năm 2026.</p>

<h2>🎭 Principle of Least Privilege</h2>
<p>User chỉ có quyền tối thiểu cần thiết.</p>
<ul>
  <li>App dùng DB user không có quyền DROP TABLE.</li>
  <li>Service A không cần đọc DB của service B.</li>
  <li>Junior dev không cần access prod.</li>
</ul>

<h2>🔍 OWASP Top 10</h2>
<p>10 lỗ hổng phổ biến nhất theo OWASP - hãy thuộc lòng:</p>
<ol>
  <li>Broken Access Control</li>
  <li>Cryptographic Failures</li>
  <li>Injection (SQL, NoSQL, Command)</li>
  <li>Insecure Design</li>
  <li>Security Misconfiguration</li>
  <li>Vulnerable Components</li>
  <li>Identification & Auth Failures</li>
  <li>Software & Data Integrity Failures</li>
  <li>Security Logging Failures</li>
  <li>Server-Side Request Forgery (SSRF)</li>
</ol>

<div class="callout warn">
<div class="callout-title">⚠️ Cảnh báo</div>
<p>Đừng tự viết hệ thống auth. Dùng library đã được kiểm chứng: Auth0, Firebase Auth, Keycloak, Passport.js.</p>
</div>
`
  },

  /* ============================================================
   * CHƯƠNG 19: OBSERVABILITY
   * ============================================================ */
  {
    group: "🏛️ Phần 3: Kiến trúc nâng cao",
    icon: "🔭",
    title: "Chương 19: Logging, Monitoring, Tracing",
    content: `
<h1>Chương 19: Observability</h1>
<p class="subtitle">Bạn không sửa được thứ bạn không thấy 🔭</p>

<h2>🩺 3 trụ cột Observability</h2>
<div class="cards">
  <div class="card"><div class="emoji">📝</div><h4>Logs</h4><p>Sự kiện rời rạc, có timestamp.</p></div>
  <div class="card"><div class="emoji">📊</div><h4>Metrics</h4><p>Số liệu định lượng theo thời gian.</p></div>
  <div class="card"><div class="emoji">🧭</div><h4>Traces</h4><p>Đường đi của 1 request qua nhiều service.</p></div>
</div>

<h2>📝 Logging</h2>
<h3>Log Levels</h3>
<ul>
  <li><code>DEBUG</code>: Chi tiết để dev xem.</li>
  <li><code>INFO</code>: Sự kiện bình thường (user login).</li>
  <li><code>WARN</code>: Bất thường nhưng chưa lỗi.</li>
  <li><code>ERROR</code>: Có lỗi, cần xử lý.</li>
  <li><code>FATAL</code>: Sập app.</li>
</ul>

<h3>Structured Logging</h3>
<pre><code>// ❌ Khó parse
console.log('User 123 logged in at 2026-01-15 from IP 1.2.3.4');

// ✅ JSON structured
logger.info({
  event: 'user_login',
  userId: 123,
  ip: '1.2.3.4',
  timestamp: new Date().toISOString()
});</code></pre>

<h3>Centralized Logs - ELK Stack</h3>
<ul>
  <li><strong>E</strong>lasticsearch: lưu, search log.</li>
  <li><strong>L</strong>ogstash: thu thập, parse.</li>
  <li><strong>K</strong>ibana: dashboard, query.</li>
</ul>
<p>Hoặc: Loki + Grafana, Splunk, Datadog.</p>

<h2>📊 Metrics</h2>
<h3>4 Golden Signals (Google SRE)</h3>
<ol>
  <li><strong>Latency</strong>: Bao lâu? p50, p95, p99.</li>
  <li><strong>Traffic</strong>: Bao nhiêu? RPS (req/s).</li>
  <li><strong>Errors</strong>: Bao nhiêu lỗi? 4xx, 5xx rate.</li>
  <li><strong>Saturation</strong>: Tài nguyên đầy chưa? CPU, RAM, disk.</li>
</ol>

<h3>Prometheus + Grafana</h3>
<pre><code># Code expose metric
const promClient = require('prom-client');
const httpDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration',
  labelNames: ['method', 'route', 'status']
});

app.use((req, res, next) => {
  const end = httpDuration.startTimer();
  res.on('finish', () => {
    end({ method: req.method, route: req.path, status: res.statusCode });
  });
  next();
});

app.get('/metrics', (req, res) => res.send(promClient.register.metrics()));</code></pre>

<h2>🧭 Distributed Tracing</h2>
<p>Request đi qua 5 service. Lỗi 500 ở đâu? Trace giúp bạn theo dấu.</p>
<pre><code>Trace ID: abc-123
├─ API Gateway      (10ms)
├─ User Service     (5ms)
├─ Order Service    (200ms) ⚠️
│   └─ DB query     (180ms) ← Đây mới là thủ phạm!
└─ Notification     (8ms)</code></pre>
<p>Công cụ: <strong>Jaeger, Zipkin, Datadog APM, OpenTelemetry</strong>.</p>

<h2>🚨 Alerting</h2>
<ul>
  <li>Error rate > 1% trong 5 phút → page on-call.</li>
  <li>p99 latency > 2s → notify Slack.</li>
  <li>Disk > 80% → email DevOps.</li>
</ul>

<div class="callout tip">
<div class="callout-title">💡 Alert fatigue</div>
<p>Quá nhiều alert = không ai để ý. Chỉ alert những gì cần hành động ngay. Phần còn lại để dashboard.</p>
</div>

<h2>📈 SLI / SLO / SLA</h2>
<ul>
  <li><strong>SLI</strong> (Indicator): metric đo chất lượng (uptime, latency).</li>
  <li><strong>SLO</strong> (Objective): mục tiêu nội bộ (99.9% uptime).</li>
  <li><strong>SLA</strong> (Agreement): cam kết với khách (99.95%, không thì bồi thường).</li>
</ul>
<p>99.9% uptime = 8.76 giờ downtime/năm. 99.99% = 52 phút/năm. 99.999% = 5 phút - "five nines".</p>
`
  },

  /* ============================================================
   * CHƯƠNG 20: SEARCH ENGINE
   * ============================================================ */
  {
    group: "🏛️ Phần 3: Kiến trúc nâng cao",
    icon: "🔎",
    title: "Chương 20: Search Engine - Tìm kim trong đụn cỏ",
    content: `
<h1>Chương 20: Search Engine</h1>
<p class="subtitle">Làm sao Google tìm 1 từ trong tỷ trang web trong 0.5 giây? 🔎</p>

<h2>📚 Tại sao SQL LIKE không đủ?</h2>
<pre><code>SELECT * FROM products WHERE name LIKE '%phở%';</code></pre>
<ul>
  <li>Full table scan - chậm với 10M sản phẩm.</li>
  <li>Không hiểu "phở bò" ≈ "pho bo" ≈ "PHỞ BÒ".</li>
  <li>Không xếp hạng độ liên quan.</li>
  <li>Không gợi ý "phở bof" → "phở bò".</li>
</ul>

<h2>🔑 Inverted Index</h2>
<p>Lật ngược bảng: thay vì <em>document → từ</em>, ta lưu <em>từ → list documents</em>.</p>
<pre><code>Document 1: "Tôi yêu phở bò"
Document 2: "Phở gà ngon"
Document 3: "Bò kho ngon"

Inverted index:
"phở" → [1, 2]
"bò"  → [1, 3]
"gà"  → [2]
"ngon"→ [2, 3]

Search "phở bò" → intersect → [1]</code></pre>

<h2>⚙️ Quy trình tổng quát</h2>
<ol>
  <li><strong>Tokenize</strong>: tách câu thành từ.</li>
  <li><strong>Normalize</strong>: lowercase, bỏ dấu, stemming ("running" → "run").</li>
  <li><strong>Remove stop words</strong>: bỏ "the", "is", "và"...</li>
  <li><strong>Index</strong>: cập nhật inverted index.</li>
  <li><strong>Query</strong>: tokenize query, tra index, ranking.</li>
</ol>

<h2>📊 Ranking - BM25, TF-IDF</h2>
<ul>
  <li><strong>TF</strong> (Term Frequency): từ xuất hiện nhiều trong document → liên quan hơn.</li>
  <li><strong>IDF</strong> (Inverse Doc Frequency): từ hiếm trong toàn corpus → giá trị cao hơn.</li>
  <li><strong>BM25</strong>: cải tiến của TF-IDF, là chuẩn hiện nay.</li>
</ul>

<h2>🚀 Elasticsearch - Vua tìm kiếm</h2>
<pre><code>// Index
PUT /products/_doc/1
{
  "name": "Phở bò tái nạm",
  "price": 50000,
  "tags": ["vietnamese", "noodle"]
}

// Search
GET /products/_search
{
  "query": {
    "multi_match": {
      "query": "pho bo",
      "fields": ["name^3", "tags"],
      "fuzziness": "AUTO"
    }
  }
}</code></pre>

<p>Kết quả ranking theo độ liên quan, hỗ trợ typo (fuzziness), boost field quan trọng (^3).</p>

<h2>🎯 Tính năng nâng cao</h2>
<div class="cards">
  <div class="card"><div class="emoji">💡</div><h4>Auto-complete</h4><p>Edge n-gram, prefix tree.</p></div>
  <div class="card"><div class="emoji">🌐</div><h4>Geo search</h4><p>"quán phở gần tôi 2km".</p></div>
  <div class="card"><div class="emoji">📊</div><h4>Faceting</h4><p>Lọc theo giá, thương hiệu.</p></div>
  <div class="card"><div class="emoji">🧠</div><h4>Vector search</h4><p>Semantic - hiểu nghĩa, không chỉ từ.</p></div>
</div>

<h2>🏗️ Kiến trúc</h2>
<pre><code>[App DB] --change events--> [Indexer] --> [Elasticsearch]
                                                  ↑
[User] -- search query ---------------------------┘</code></pre>

<p>DB là "source of truth". ES chỉ là index để search nhanh. Sync 2 chiều qua CDC (change data capture) hoặc message queue.</p>

<div class="callout fun">
<div class="callout-title">😆 Vui</div>
<p>Google index 100+ tỷ trang web, search trả về trong 0.5s. Bí mật: hàng triệu server, inverted index khổng lồ chia shard, ranking dùng AI.</p>
</div>
`
  },

  /* ============================================================
   * CHƯƠNG 21: STORAGE - BLOB
   * ============================================================ */
  {
    group: "🏛️ Phần 3: Kiến trúc nâng cao",
    icon: "🗂️",
    title: "Chương 21: Object Storage - Kho ảnh và video",
    content: `
<h1>Chương 21: Object Storage</h1>
<p class="subtitle">Lưu trữ ảnh, video, file lớn ở đâu? 🗂️</p>

<h2>🤔 Tại sao không lưu trong DB?</h2>
<ul>
  <li>DB tối ưu cho row nhỏ, không phải file MB/GB.</li>
  <li>Backup DB sẽ siêu nặng.</li>
  <li>Đọc/ghi file lớn từ DB chậm.</li>
  <li>Không tận dụng CDN dễ dàng.</li>
</ul>

<h2>📦 Object Storage là gì?</h2>
<p>Lưu file dưới dạng "object", mỗi object có:</p>
<ul>
  <li><strong>Key</strong>: đường dẫn (vd <code>avatars/user-123.jpg</code>).</li>
  <li><strong>Data</strong>: nội dung file.</li>
  <li><strong>Metadata</strong>: kích thước, content-type, custom tags.</li>
</ul>

<p><strong>Vua</strong>: AWS S3. Anh em: Google Cloud Storage, Azure Blob, MinIO (self-host).</p>

<h2>💻 Code upload file</h2>
<pre><code>const AWS = require('aws-sdk');
const s3 = new AWS.S3();

// Upload trực tiếp (qua server)
async function uploadAvatar(userId, fileBuffer) {
  const key = \`avatars/\${userId}.jpg\`;
  await s3.putObject({
    Bucket: 'my-app',
    Key: key,
    Body: fileBuffer,
    ContentType: 'image/jpeg'
  }).promise();
  return \`https://cdn.example.com/\${key}\`;
}</code></pre>

<h2>🚀 Pre-signed URL - "Upload trực tiếp"</h2>
<p>Đừng để file đi qua server (tốn băng thông). Cho client URL có chữ ký, upload thẳng lên S3.</p>

<pre><code>// Backend tạo URL
const url = s3.getSignedUrl('putObject', {
  Bucket: 'my-app',
  Key: 'uploads/' + uuid(),
  Expires: 300, // hết hạn 5 phút
  ContentType: 'image/jpeg'
});
res.json({ uploadUrl: url });

// Frontend upload thẳng
await fetch(uploadUrl, {
  method: 'PUT',
  body: file,
  headers: { 'Content-Type': 'image/jpeg' }
});</code></pre>

<div class="diagram">
<svg viewBox="0 0 600 180" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="70" width="80" height="40" rx="8" fill="#ff5e7a"/>
  <text x="60" y="95" text-anchor="middle" fill="white" font-size="12">Client</text>
  <rect x="200" y="70" width="80" height="40" rx="8" fill="#6c5ce7"/>
  <text x="240" y="95" text-anchor="middle" fill="white" font-size="12">Backend</text>
  <rect x="380" y="70" width="80" height="40" rx="8" fill="#00d2a8"/>
  <text x="420" y="95" text-anchor="middle" fill="white" font-size="12">S3</text>

  <line x1="100" y1="85" x2="200" y2="85" stroke="#5a5a72"/>
  <text x="150" y="80" text-anchor="middle" font-size="10">1. Xin URL</text>
  <line x1="200" y1="100" x2="100" y2="100" stroke="#5a5a72"/>
  <text x="150" y="115" text-anchor="middle" font-size="10">2. Trả URL ký</text>
  <line x1="100" y1="130" x2="380" y2="100" stroke="#f9a826" stroke-width="2"/>
  <text x="240" y="155" text-anchor="middle" font-size="10" fill="#f9a826">3. PUT file trực tiếp</text>
</svg>
<div class="diagram-caption">Pre-signed URL flow</div>
</div>

<h2>🌐 Serve qua CDN</h2>
<pre><code>S3 bucket: photos.example.com
CloudFront: https://cdn.example.com (cache từ S3)

User → CDN edge gần nhất → nếu miss thì lấy từ S3 → cache</code></pre>

<h2>🎯 Best practices</h2>
<ul>
  <li><strong>Bucket private</strong>: chỉ truy cập qua URL ký hoặc CDN.</li>
  <li><strong>Versioning</strong>: bật để khôi phục khi xoá nhầm.</li>
  <li><strong>Lifecycle</strong>: file > 90 ngày → chuyển sang storage rẻ (Glacier).</li>
  <li><strong>Compression</strong>: gzip text, optimize ảnh.</li>
  <li><strong>Naming</strong>: <code>2026/01/15/uuid.jpg</code> để dễ quản lý.</li>
</ul>

<h2>📸 Image processing</h2>
<p>Ảnh upload 5MB. Display thumbnail chỉ cần 50KB.</p>
<ul>
  <li>Resize on-the-fly: <code>image.com/photo.jpg?w=200&h=200</code>.</li>
  <li>Pre-generate khi upload (queue worker).</li>
  <li>Service: imgix, Cloudinary, AWS Image Optimizer.</li>
</ul>

<div class="callout tip">
<div class="callout-title">💡 Vui mà thật</div>
<p>S3 lưu trữ hàng nghìn tỷ object. Độ bền 99.999999999% (11 số 9). Bạn dễ trúng số hơn là mất file trên S3.</p>
</div>
`
  },

  /* ============================================================
   * CHƯƠNG 22: REAL-TIME
   * ============================================================ */
  {
    group: "🏛️ Phần 3: Kiến trúc nâng cao",
    icon: "⚡",
    title: "Chương 22: Realtime - Tin nhắn không độ trễ",
    content: `
<h1>Chương 22: Realtime Systems</h1>
<p class="subtitle">Khi 1 giây là quá lâu ⚡</p>

<h2>🎯 Use cases</h2>
<ul>
  <li>Chat (Messenger, Zalo).</li>
  <li>Notification push.</li>
  <li>Collaboration (Google Docs, Figma).</li>
  <li>Live dashboard, stock price.</li>
  <li>Game, IoT, video call.</li>
</ul>

<h2>🛠️ 3 kỹ thuật</h2>

<h3>1. Polling - "Hỏi liên tục"</h3>
<pre><code>setInterval(() => {
  fetch('/messages').then(updateUI);
}, 2000);</code></pre>
<p>❌ Tốn tài nguyên, không thật sự realtime (delay 2s).</p>

<h3>2. Long Polling</h3>
<p>Client gửi request. Server "giữ" lại đến khi có data mới hoặc timeout.</p>
<pre><code>// Server giữ connection
app.get('/messages/wait', async (req, res) => {
  const newMsg = await waitForNewMessage(req.user, 30); // chờ tối đa 30s
  res.json(newMsg);
});

// Client: gọi xong gọi lại
async function listen() {
  while (true) {
    const msg = await fetch('/messages/wait').then(r => r.json());
    updateUI(msg);
  }
}</code></pre>

<h3>3. WebSocket - "Đường dây nóng"</h3>
<p>Kết nối 2 chiều, server có thể đẩy bất kỳ lúc nào.</p>
<pre><code>// Server (Node.js + ws)
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws, req) => {
  ws.userId = authenticate(req);

  ws.on('message', (data) => {
    const msg = JSON.parse(data);
    // Broadcast to all
    wss.clients.forEach(c => {
      if (c.readyState === WebSocket.OPEN) c.send(data);
    });
  });
});

// Client
const ws = new WebSocket('wss://chat.example.com');
ws.onmessage = (e) => addMessage(JSON.parse(e.data));
ws.send(JSON.stringify({ text: 'Hi!' }));</code></pre>

<h3>4. Server-Sent Events (SSE)</h3>
<p>Một chiều: server → client. Đơn giản hơn WebSocket cho notification.</p>
<pre><code>// Server
app.get('/events', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/event-stream' });
  setInterval(() => {
    res.write(\`data: \${JSON.stringify({ price: getPrice() })}\\n\\n\`);
  }, 1000);
});

// Client
const sse = new EventSource('/events');
sse.onmessage = (e) => console.log(JSON.parse(e.data));</code></pre>

<h2>🏗️ Kiến trúc chat realtime ở scale lớn</h2>
<div class="diagram">
<svg viewBox="0 0 600 250" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="100" width="80" height="40" rx="8" fill="#ff5e7a"/>
  <text x="60" y="125" text-anchor="middle" fill="white" font-size="11">Client A</text>
  <rect x="20" y="160" width="80" height="40" rx="8" fill="#ff5e7a"/>
  <text x="60" y="185" text-anchor="middle" fill="white" font-size="11">Client B</text>

  <rect x="160" y="30" width="120" height="35" rx="8" fill="#6c5ce7"/>
  <text x="220" y="52" text-anchor="middle" fill="white" font-size="11">WS Server 1</text>
  <rect x="160" y="100" width="120" height="35" rx="8" fill="#6c5ce7"/>
  <text x="220" y="122" text-anchor="middle" fill="white" font-size="11">WS Server 2</text>
  <rect x="160" y="170" width="120" height="35" rx="8" fill="#6c5ce7"/>
  <text x="220" y="192" text-anchor="middle" fill="white" font-size="11">WS Server 3</text>

  <rect x="340" y="100" width="100" height="35" rx="8" fill="#f9a826"/>
  <text x="390" y="122" text-anchor="middle" fill="white" font-size="11">Redis Pub/Sub</text>

  <rect x="480" y="100" width="100" height="35" rx="8" fill="#00d2a8"/>
  <text x="530" y="122" text-anchor="middle" fill="white" font-size="11">DB + Queue</text>

  <line x1="100" y1="120" x2="160" y2="50" stroke="#5a5a72"/>
  <line x1="100" y1="180" x2="160" y2="190" stroke="#5a5a72"/>
  <line x1="280" y1="117" x2="340" y2="117" stroke="#5a5a72"/>
  <line x1="440" y1="117" x2="480" y2="117" stroke="#5a5a72"/>
</svg>
<div class="diagram-caption">Nhiều WS server đồng bộ qua Redis Pub/Sub</div>
</div>

<h2>💡 Thách thức</h2>
<ul>
  <li><strong>Connection state</strong>: WS giữ kết nối → mỗi server giới hạn ~10K-100K connection.</li>
  <li><strong>Cross-server messaging</strong>: User A ở WS1, User B ở WS2 → cần Redis Pub/Sub.</li>
  <li><strong>Reconnection</strong>: Mất mạng → tự reconnect, sync missed messages.</li>
  <li><strong>Scaling</strong>: Sticky session, dùng IP hash ở LB.</li>
</ul>

<div class="callout tip">
<div class="callout-title">💡 Production tip</div>
<p>Dùng <strong>Socket.io</strong>, <strong>Pusher</strong>, <strong>Ably</strong>, <strong>SignalR</strong> thay vì code raw WebSocket. Chúng lo dùm reconnect, fallback, scaling.</p>
</div>
`
  },

  /* ============================================================
   * CHƯƠNG 23: BACKUP & DR
   * ============================================================ */
  {
    group: "🏛️ Phần 3: Kiến trúc nâng cao",
    icon: "💾",
    title: "Chương 23: Backup, Disaster Recovery, HA",
    content: `
<h1>Chương 23: Backup & Disaster Recovery</h1>
<p class="subtitle">Hy vọng điều tốt nhất, chuẩn bị cho tệ nhất 💾</p>

<h2>😱 Disaster scenarios</h2>
<ul>
  <li>Server cháy 🔥, ổ cứng hỏng.</li>
  <li>DBA gõ nhầm <code>DROP TABLE users;</code>.</li>
  <li>Ransomware mã hoá data.</li>
  <li>Data center mất điện cả khu vực.</li>
  <li>Bug delete sai user → 1 triệu account mất.</li>
</ul>

<h2>📦 Backup strategies</h2>
<h3>1. Full backup</h3>
<p>Sao lưu toàn bộ. Tốn dung lượng, restore nhanh.</p>

<h3>2. Incremental backup</h3>
<p>Chỉ sao lưu thay đổi từ backup trước. Tiết kiệm, nhưng restore phải apply theo chuỗi.</p>

<h3>3. Differential backup</h3>
<p>Sao lưu thay đổi từ lần full backup gần nhất.</p>

<h2>🎯 Rule 3-2-1</h2>
<ul>
  <li><strong>3</strong> bản sao data.</li>
  <li>Lưu trên <strong>2</strong> loại media khác nhau.</li>
  <li><strong>1</strong> bản offsite (vùng địa lý khác).</li>
</ul>

<h2>⏱️ RPO & RTO</h2>
<div class="cards">
  <div class="card"><div class="emoji">🕒</div><h4>RPO (Recovery Point Objective)</h4><p>Chấp nhận mất bao nhiêu data? VD: 1 giờ → backup mỗi giờ.</p></div>
  <div class="card"><div class="emoji">⏰</div><h4>RTO (Recovery Time Objective)</h4><p>Bao lâu phải khôi phục? VD: 30 phút → cần infra auto failover.</p></div>
</div>

<h2>🏥 High Availability (HA)</h2>
<h3>Active-Passive</h3>
<p>1 server chính, 1 server standby. Server chính chết → switchover.</p>

<h3>Active-Active</h3>
<p>Nhiều server cùng phục vụ. Tốt hơn HA + scale.</p>

<h2>🌍 Multi-Region</h2>
<p>Datacenter 1 ở Singapore, datacenter 2 ở US. Một region chết, region kia tiếp quản.</p>

<pre><code>Primary region (Singapore)        Standby region (US)
[App Servers]                     [App Servers]
[DB Master] -----async replicate----→ [DB Replica]
[S3 bucket] -----cross-region-------→ [S3 bucket]

Failover: DNS đổi điểm về US, promote DB replica thành master</code></pre>

<h2>🧪 Disaster Recovery Drill</h2>
<p>Backup mà không test = không có backup.</p>
<ul>
  <li>Mỗi quý chạy restore 1 bản backup ra môi trường test.</li>
  <li>Mỗi 6 tháng: chaos engineering - cố tình tắt 1 region xem có failover ổn không.</li>
  <li>Netflix có "Chaos Monkey" tự random kill server prod.</li>
</ul>

<h2>📐 Strategies theo budget</h2>
<table>
  <tr><th>Strategy</th><th>RTO</th><th>RPO</th><th>Cost</th></tr>
  <tr><td>Backup & Restore</td><td>Giờ - ngày</td><td>Giờ</td><td>$</td></tr>
  <tr><td>Pilot Light</td><td>Giờ</td><td>Phút</td><td>$$</td></tr>
  <tr><td>Warm Standby</td><td>Phút</td><td>Giây</td><td>$$$</td></tr>
  <tr><td>Multi-site Active-Active</td><td>Giây</td><td>~0</td><td>$$$$</td></tr>
</table>

<div class="callout warn">
<div class="callout-title">⚠️ Câu chuyện thật</div>
<p>2017: GitLab DBA xoá nhầm DB production. Phát hiện 5/6 backup không hoạt động. May còn 1 cái cũ 6 tiếng. Mất 6h data. Bài học: <strong>test backup thường xuyên</strong>.</p>
</div>
`
  },

];

window.CHAPTERS.push(..._PART3);
