/* =========================================================
 * CHƯƠNG 24-30: CASE STUDY HỆ THỐNG NỔI TIẾNG
 * Short URL, Facebook, Netflix, Uber, Twitter, Instagram, WhatsApp
 * ========================================================= */

window.CHAPTERS = window.CHAPTERS || [];
const _PART4 = [

  /* ============================================================
   * CHƯƠNG 24: SHORT URL
   * ============================================================ */
  {
    group: "🎯 Phần 4: Case Study huyền thoại",
    icon: "🔗",
    title: "Chương 24: Thiết kế Short URL (Bit.ly, TinyURL)",
    content: `
<h1>Chương 24: Short URL Service</h1>
<p class="subtitle">Biến URL dài 200 ký tự thành bit.ly/xy7k 🔗</p>

<h2>📋 Yêu cầu</h2>
<h3>Functional</h3>
<ul>
  <li>POST long URL → trả short URL.</li>
  <li>GET short URL → redirect đến long URL.</li>
  <li>Custom alias: <code>bit.ly/my-link</code>.</li>
  <li>Có thể đặt thời hạn (expire).</li>
  <li>Thống kê click count.</li>
</ul>

<h3>Non-functional</h3>
<ul>
  <li>Read >> Write (100:1).</li>
  <li>Latency < 100ms.</li>
  <li>Availability cao - link không được sập.</li>
  <li>Short URL không trùng, không đoán được.</li>
</ul>

<h2>📊 Ước tính capacity</h2>
<pre><code>500 triệu URL mới / tháng = ~200 URL/giây (write)
Read 100x = 20,000 / giây
Storage: 500M URL/tháng × 5 năm × 500 byte = 15 TB
Cache hot URL: top 20% = 100GB RAM</code></pre>

<h2>🔢 Cách tạo Short URL?</h2>
<h3>Cách 1: Hash (MD5) + cắt</h3>
<pre><code>short = base62(md5(longUrl))[0..7]</code></pre>
<p>❌ Có thể trùng. Không deterministic nếu user muốn link khác cho cùng URL.</p>

<h3>Cách 2: Counter + Base62 ⭐</h3>
<p>Mỗi URL có 1 ID tăng dần. Convert ID sang base62 (a-z, A-Z, 0-9 = 62 ký tự).</p>
<pre><code>ID 1         → "1"
ID 100       → "1C"
ID 1000000   → "4c92"
ID 56800235  → "abc1234"

7 ký tự base62 = 62^7 = 3.5 × 10^12 URL khác nhau!</code></pre>

<h3>Code Base62</h3>
<pre><code>const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function encode(num) {
  let s = '';
  while (num > 0) {
    s = CHARS[num % 62] + s;
    num = Math.floor(num / 62);
  }
  return s.padStart(7, 'A');
}

function decode(str) {
  let num = 0;
  for (const c of str) num = num * 62 + CHARS.indexOf(c);
  return num;
}

console.log(encode(125));      // "AAAAACB"
console.log(decode('AAAAACB')); // 125</code></pre>

<h3>Cách 3: Tránh single counter bottleneck</h3>
<p>Dùng <strong>ID generator</strong> như Twitter Snowflake (64-bit: timestamp + machine + sequence) hoặc dải ID pre-allocate cho từng server.</p>

<h2>🏗️ Kiến trúc</h2>
<div class="diagram">
<svg viewBox="0 0 700 280" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="120" width="80" height="40" rx="8" fill="#ff5e7a"/>
  <text x="60" y="145" text-anchor="middle" fill="white" font-size="11">Client</text>

  <rect x="140" y="120" width="100" height="40" rx="8" fill="#6c5ce7"/>
  <text x="190" y="145" text-anchor="middle" fill="white" font-size="11">Load Balancer</text>

  <rect x="280" y="60" width="100" height="35" rx="8" fill="#6c5ce7"/>
  <text x="330" y="83" text-anchor="middle" fill="white" font-size="11">App Server 1</text>
  <rect x="280" y="120" width="100" height="35" rx="8" fill="#6c5ce7"/>
  <text x="330" y="142" text-anchor="middle" fill="white" font-size="11">App Server 2</text>
  <rect x="280" y="180" width="100" height="35" rx="8" fill="#6c5ce7"/>
  <text x="330" y="202" text-anchor="middle" fill="white" font-size="11">App Server 3</text>

  <rect x="420" y="40" width="100" height="35" rx="8" fill="#f9a826"/>
  <text x="470" y="62" text-anchor="middle" fill="white" font-size="11">ID Generator</text>

  <rect x="420" y="120" width="100" height="35" rx="8" fill="#f9a826"/>
  <text x="470" y="142" text-anchor="middle" fill="white" font-size="11">Redis Cache</text>

  <rect x="560" y="80" width="100" height="35" rx="8" fill="#00d2a8"/>
  <text x="610" y="102" text-anchor="middle" fill="white" font-size="11">DB (sharded)</text>
  <rect x="560" y="140" width="100" height="35" rx="8" fill="#00d2a8"/>
  <text x="610" y="162" text-anchor="middle" fill="white" font-size="11">Analytics DB</text>

  <line x1="100" y1="140" x2="140" y2="140" stroke="#5a5a72"/>
  <line x1="240" y1="140" x2="280" y2="140" stroke="#5a5a72"/>
  <line x1="380" y1="140" x2="420" y2="140" stroke="#5a5a72"/>
  <line x1="520" y1="140" x2="560" y2="100" stroke="#5a5a72"/>
  <line x1="520" y1="140" x2="560" y2="160" stroke="#5a5a72"/>
</svg>
<div class="diagram-caption">Kiến trúc URL Shortener</div>
</div>

<h2>💾 Schema DB</h2>
<pre><code>CREATE TABLE urls (
  id BIGINT PRIMARY KEY,                  -- 56800235
  short_code VARCHAR(8) UNIQUE,           -- "abc1234"
  long_url TEXT NOT NULL,
  user_id BIGINT,
  created_at TIMESTAMP,
  expires_at TIMESTAMP,
  click_count BIGINT DEFAULT 0
);

CREATE INDEX idx_short ON urls(short_code);</code></pre>

<h2>🔄 Flow tạo URL</h2>
<pre><code>POST /shorten { url: "https://very-long-url..." }

1. Validate URL
2. Check cache: long → short? (idempotent)
3. ID = idGenerator.next()
4. short = base62(ID)
5. INSERT urls (id, short_code, long_url, ...)
6. Set Redis: short:abc1234 → longUrl (TTL 1 ngày)
7. Return { short: "https://bit.ly/abc1234" }</code></pre>

<h2>🔄 Flow redirect</h2>
<pre><code>GET /abc1234

1. Check Redis: short:abc1234
   - HIT → redirect 302
2. MISS → DB lookup WHERE short_code='abc1234'
3. Set Redis cache
4. Async: tăng click_count, ghi analytics
5. HTTP 302 redirect to long_url</code></pre>

<h2>🚀 Tối ưu nâng cao</h2>
<ul>
  <li><strong>Cache LRU</strong>: 20% URL chiếm 80% traffic.</li>
  <li><strong>CDN edge</strong>: redirect ngay tại edge.</li>
  <li><strong>Bloom Filter</strong>: trước khi query DB, check nhanh có tồn tại không.</li>
  <li><strong>Analytics async</strong>: dùng Kafka, không block redirect.</li>
  <li><strong>Multi-region</strong>: link không sập dù 1 region chết.</li>
</ul>

<div class="callout fun">
<div class="callout-title">🎯 Câu hỏi phỏng vấn</div>
<p>"Làm sao đảm bảo short URL không bị đoán được?" → Trộn ID với salt, hoặc dùng hash + check collision. Khi đó người dùng không enumerate được URL của người khác.</p>
</div>
`
  },

  /* ============================================================
   * CHƯƠNG 25: TWITTER
   * ============================================================ */
  {
    group: "🎯 Phần 4: Case Study huyền thoại",
    icon: "🐦",
    title: "Chương 25: Thiết kế Twitter/X (Tweet 280 ký tự, 500M users)",
    content: `
<h1>Chương 25: Thiết kế Twitter</h1>
<p class="subtitle">Mỗi giây 6000 tweet, mỗi ngày 500 triệu tweet 🐦</p>

<h2>📋 Yêu cầu</h2>
<ul>
  <li>Post tweet (text, hình, video).</li>
  <li>Follow user.</li>
  <li>Newsfeed (timeline) - tweet của người bạn follow.</li>
  <li>Search tweet, hashtag.</li>
  <li>Like, retweet, comment.</li>
  <li>Trending topics.</li>
</ul>

<h2>📊 Số liệu</h2>
<pre><code>500M user, 200M DAU
500M tweet/ngày = ~6000 tweet/giây
Read:Write = 1000:1 (đọc nhiều hơn ghi nhiều)
Avg tweet: 100 byte text + media URL
Storage: 500M × 500B/ngày = 250GB/ngày = 90TB/năm</code></pre>

<h2>🏗️ Schema</h2>
<pre><code>users (id, username, name, bio, followers_count)
tweets (id, user_id, content, media_url, created_at, like_count)
follows (follower_id, followee_id, created_at)
likes (user_id, tweet_id, created_at)</code></pre>

<h2>📰 Vấn đề lớn: Timeline generation</h2>
<p>User vào trang chủ, cần thấy tweet của những người họ follow, sắp xếp theo thời gian. Có 2 cách:</p>

<h3>1. Fan-out on Read (Pull model)</h3>
<p>Khi user A vào timeline:</p>
<pre><code>SELECT * FROM tweets
WHERE user_id IN (SELECT followee_id FROM follows WHERE follower_id = A)
ORDER BY created_at DESC LIMIT 50;</code></pre>
<p>❌ Chậm khi A follow 1000 người. ❌ Query chạy mỗi lần refresh.</p>

<h3>2. Fan-out on Write (Push model) ⭐</h3>
<p>Khi A tweet, copy tweet đó vào timeline cache của tất cả followers của A.</p>
<pre><code>// A có 1000 followers
A tweet "Hello!"
→ For each follower F:
    redis.lpush('timeline:F', tweetId)
    redis.ltrim('timeline:F', 0, 800)  // giữ 800 tweet gần nhất

User F vào timeline:
→ redis.lrange('timeline:F', 0, 50) // nhanh!</code></pre>

<h3>3. Hybrid - Cách Twitter làm</h3>
<p>Với user thường: push. Với <strong>celebrity</strong> (10M+ followers): pull. Trộn 2 nguồn khi user vào timeline.</p>

<div class="diagram">
<svg viewBox="0 0 600 220" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="20" width="100" height="35" rx="8" fill="#ff5e7a"/>
  <text x="70" y="42" text-anchor="middle" fill="white" font-size="11">User tweets</text>

  <rect x="180" y="20" width="120" height="35" rx="8" fill="#6c5ce7"/>
  <text x="240" y="42" text-anchor="middle" fill="white" font-size="11">Tweet Service</text>

  <rect x="350" y="20" width="100" height="35" rx="8" fill="#00d2a8"/>
  <text x="400" y="42" text-anchor="middle" fill="white" font-size="11">Tweet DB</text>

  <rect x="180" y="90" width="120" height="35" rx="8" fill="#f9a826"/>
  <text x="240" y="112" text-anchor="middle" fill="white" font-size="11">Fan-out worker</text>

  <rect x="350" y="90" width="100" height="35" rx="8" fill="#f9a826"/>
  <text x="400" y="112" text-anchor="middle" fill="white" font-size="11">Follower list</text>

  <rect x="180" y="160" width="120" height="35" rx="8" fill="#6c5ce7"/>
  <text x="240" y="182" text-anchor="middle" fill="white" font-size="11">Redis timelines</text>

  <line x1="120" y1="37" x2="180" y2="37" stroke="#5a5a72"/>
  <line x1="300" y1="37" x2="350" y2="37" stroke="#5a5a72"/>
  <line x1="240" y1="55" x2="240" y2="90" stroke="#5a5a72"/>
  <line x1="300" y1="107" x2="350" y2="107" stroke="#5a5a72"/>
  <line x1="240" y1="125" x2="240" y2="160" stroke="#5a5a72"/>
</svg>
<div class="diagram-caption">Twitter Fan-out flow</div>
</div>

<h2>🔥 Trending Topics</h2>
<p>Hashtag #worldcup đang được nhắc 10000 lần/phút.</p>
<ul>
  <li>Mỗi tweet có hashtag → publish vào Kafka.</li>
  <li>Stream processor (Flink/Spark) đếm count theo cửa sổ 5 phút.</li>
  <li>Top N hashtag → Redis sorted set.</li>
  <li>Trending API đọc từ Redis.</li>
</ul>

<h2>🔍 Search</h2>
<p>Elasticsearch index tweet. Khi POST tweet → publish vào ES qua Kafka. Search → query ES.</p>

<h2>🧠 Câu hỏi nâng cao</h2>
<ul>
  <li><strong>Mention/notification</strong>: tweet có @user → publish notification event.</li>
  <li><strong>Spam/bot detection</strong>: ML model phân loại.</li>
  <li><strong>Image upload</strong>: pre-signed URL S3, async transcode.</li>
  <li><strong>Edit tweet</strong>: lưu version, hiển thị "edited".</li>
</ul>

<h2>🌐 Geo Distribution</h2>
<p>User Việt Nam đọc tweet user Mỹ. Đặt edge cache ở từng region. Tweet replicate global nhưng eventually consistent.</p>

<div class="callout tip">
<div class="callout-title">💡 Bí mật</div>
<p>Twitter sản sinh ID tweet bằng <strong>Snowflake</strong>: 64-bit, timestamp(41) + datacenter(5) + worker(5) + sequence(12). Mỗi ms tạo được 4096 ID không trùng, không cần central DB.</p>
</div>
`
  },

  /* ============================================================
   * CHƯƠNG 26: FACEBOOK NEWSFEED
   * ============================================================ */
  {
    group: "🎯 Phần 4: Case Study huyền thoại",
    icon: "📘",
    title: "Chương 26: Facebook Newsfeed - Tỷ post mỗi ngày",
    content: `
<h1>Chương 26: Facebook Newsfeed</h1>
<p class="subtitle">3 tỷ user, hàng tỷ post mỗi ngày 📘</p>

<h2>🎭 Khác Twitter ở đâu?</h2>
<ul>
  <li>Newsfeed <strong>không theo thời gian</strong> mà theo <strong>ranking AI</strong>.</li>
  <li>Đa dạng content: post, photo album, video, sự kiện, ad.</li>
  <li>Quan hệ 2 chiều (friend) thay vì 1 chiều (follow).</li>
  <li>Privacy phức tạp: only me, friends, public, custom list.</li>
</ul>

<h2>🏗️ Component chính</h2>
<ol>
  <li><strong>Post Service</strong>: tạo post, lưu DB + S3.</li>
  <li><strong>Feed Service</strong>: tổng hợp candidate posts.</li>
  <li><strong>Ranking Service</strong>: ML model xếp hạng.</li>
  <li><strong>Storage</strong>: posts, edges (friendship), engagements.</li>
  <li><strong>Cache</strong>: Memcached khổng lồ.</li>
  <li><strong>ML Pipeline</strong>: train + serve model.</li>
</ol>

<h2>🎯 Ranking signals</h2>
<table>
  <tr><th>Signal</th><th>Mô tả</th></tr>
  <tr><td>Affinity</td><td>Bạn tương tác với người này nhiều không?</td></tr>
  <tr><td>Weight</td><td>Loại post: video > photo > text</td></tr>
  <tr><td>Time decay</td><td>Post mới được ưu tiên</td></tr>
  <tr><td>Engagement</td><td>Like/comment/share rate</td></tr>
  <tr><td>Negative signals</td><td>Bạn ẩn / báo cáo bao giờ chưa</td></tr>
</table>

<h2>⚙️ Pipeline tạo feed</h2>
<pre><code>1. INVENTORY: Lấy ~10,000 candidate post (từ bạn bè 1 tuần qua)
2. FEATURE EXTRACTION: với mỗi post, tính ~hundreds features
3. SCORING: ML model dự đoán: P(like), P(comment), P(share), P(skip)
4. RANKING: score = w1*P(like) + w2*P(comment) - w3*P(skip) - ...
5. DIVERSITY: tránh 10 post cùng một người
6. RETURN top 30 to user</code></pre>

<h2>📦 Edge Rank (lịch sử)</h2>
<p>Công thức cũ:</p>
<pre><code>EdgeRank = Σ (Affinity × Weight × TimeDecay)</code></pre>
<p>Bây giờ phức tạp hơn nhiều với deep learning, nhưng concept tương tự.</p>

<h2>🗄️ Lưu friendship - Graph DB</h2>
<p>Bạn bè = đồ thị. Câu hỏi "bạn của bạn của tôi" cần graph traversal hiệu quả.</p>
<ul>
  <li>SQL: bảng <code>friendships(user_a, user_b)</code> + index.</li>
  <li>Graph DB: Neo4j, Cassandra, hoặc TAO (Facebook tự code).</li>
</ul>

<h2>📷 Photo storage - Haystack</h2>
<p>Facebook lưu 350+ tỷ ảnh. Họ tự build <strong>Haystack</strong>:</p>
<ul>
  <li>Gom nhiều ảnh vào 1 large file (giảm filesystem overhead).</li>
  <li>Index in-memory trỏ tới offset.</li>
  <li>Replicate 3 lần.</li>
  <li>CDN cache hot photo ở edge.</li>
</ul>

<h2>💬 Comment & Live updates</h2>
<p>WebSocket / SSE đẩy update realtime: ai mới like, comment mới đến.</p>

<h2>🚀 Optimization Tricks</h2>
<ul>
  <li><strong>Memcached</strong> khổng lồ (10+ TB RAM) cache mọi thứ.</li>
  <li><strong>BigPipe</strong>: chia trang thành pagelets, stream song song.</li>
  <li><strong>HHVM</strong>: PHP compiler tăng tốc 5x.</li>
  <li><strong>MySQL + sharding</strong> theo user_id.</li>
</ul>

<h2>🧪 A/B Testing</h2>
<p>Mỗi user có thể trong nhiều experiment. Mỗi feature mới rollout 1%, theo dõi metric, scale dần lên 100%. Facebook chạy ~10,000 experiment cùng lúc.</p>

<div class="callout fun">
<div class="callout-title">😆 Vui</div>
<p>Bạn refresh newsfeed Facebook 1 lần = ~150 server cùng làm việc cho bạn trong 0.5 giây.</p>
</div>
`
  },

  /* ============================================================
   * CHƯƠNG 27: NETFLIX
   * ============================================================ */
  {
    group: "🎯 Phần 4: Case Study huyền thoại",
    icon: "🎬",
    title: "Chương 27: Netflix - Streaming video toàn cầu",
    content: `
<h1>Chương 27: Netflix Streaming</h1>
<p class="subtitle">200 triệu user xem 4K mượt mà - phép thuật nào? 🎬</p>

<h2>📋 Thách thức</h2>
<ul>
  <li>Streaming video 4K = ~25 Mbps/user.</li>
  <li>200M user × peak 30% = 60M concurrent.</li>
  <li>60M × 25Mbps = 1500 Tbps - lớn hơn cả internet 1 nước!</li>
  <li>Không buffer, không giật.</li>
  <li>Đa dạng device: TV, mobile, laptop, console.</li>
  <li>Recommendation cá nhân hoá.</li>
</ul>

<h2>🌐 Open Connect - CDN tự build</h2>
<p>Netflix không thuê CDN. Họ tặng <strong>server miễn phí cho ISP</strong>:</p>
<ul>
  <li>Mỗi ISP có vài server Netflix trong datacenter của họ.</li>
  <li>Video cache sẵn trên đó.</li>
  <li>User truy cập = ISP nội bộ = tốc độ tối đa, không tốn băng thông quốc tế.</li>
  <li>Win-win: Netflix tiết kiệm bandwidth, ISP giảm tải đường truyền.</li>
</ul>

<h2>🎥 Video Encoding Pipeline</h2>
<pre><code>1. Upload master file (Apple ProRes ~10TB cho 1 phim 2h)
2. Validate & QC
3. Encode thành ~1200 versions:
   - Resolution: 144p, 240p, 360p, 480p, 720p, 1080p, 4K
   - Codec: H.264, H.265 (HEVC), AV1, VP9
   - Bitrate khác nhau
   - Audio: stereo, 5.1, Atmos
4. Generate thumbnails, subtitles
5. Distribute to Open Connect servers worldwide
6. Sẵn sàng phục vụ</code></pre>

<h2>📡 Adaptive Bitrate Streaming (HLS/DASH)</h2>
<p>Video chia thành nhiều segment 2-10 giây. Mỗi segment có nhiều phiên bản chất lượng. Player tự chọn dựa trên băng thông hiện tại.</p>
<pre><code>master.m3u8
├── 1080p/index.m3u8
│   ├── seg1.ts (2 giây)
│   ├── seg2.ts
│   └── ...
├── 720p/...
└── 480p/...

Player: mạng nhanh → chọn 1080p
        mạng chậm → đột ngột xuống 480p (không buffer)</code></pre>

<h2>🧠 Recommendation System</h2>
<p>80% nội dung xem đến từ gợi ý của Netflix.</p>
<h3>Các loại model</h3>
<ul>
  <li><strong>Collaborative filtering</strong>: "Người giống bạn cũng xem...".</li>
  <li><strong>Content-based</strong>: dựa trên thể loại, diễn viên, đạo diễn.</li>
  <li><strong>Deep learning</strong>: dự đoán bạn sẽ thích phim X với xác suất ?%.</li>
  <li><strong>Contextual</strong>: thời gian, thiết bị, mood.</li>
</ul>

<h3>Personalized Artwork</h3>
<p>Mỗi user thấy poster phim khác nhau! Netflix A/B test poster nào "hấp dẫn" user nhất.</p>

<h2>🏗️ Microservices</h2>
<p>Netflix có 1000+ microservice, viết bằng Java, Python, Node.js. Một số service nổi tiếng:</p>
<div class="cards">
  <div class="card"><div class="emoji">🚪</div><h4>Zuul</h4><p>API Gateway tự build.</p></div>
  <div class="card"><div class="emoji">🌪️</div><h4>Hystrix</h4><p>Circuit breaker.</p></div>
  <div class="card"><div class="emoji">🎯</div><h4>Eureka</h4><p>Service discovery.</p></div>
  <div class="card"><div class="emoji">🐒</div><h4>Chaos Monkey</h4><p>Cố tình kill service để test resilience.</p></div>
</div>

<h2>🌍 Multi-region Active-Active</h2>
<p>Netflix chạy trên AWS, multi-region (US East, US West, EU). Nếu 1 region chết, traffic tự fail-over sang region khác trong vài phút. Họ <strong>thường xuyên</strong> tắt 1 region để test!</p>

<h2>💾 Data stack</h2>
<ul>
  <li><strong>Cassandra</strong>: viewing history, user state.</li>
  <li><strong>MySQL</strong>: billing, accounts.</li>
  <li><strong>Elasticsearch</strong>: search.</li>
  <li><strong>Kafka</strong>: 8 trillion messages/ngày.</li>
  <li><strong>S3 + Spark</strong>: data warehouse, ML training.</li>
</ul>

<div class="callout fun">
<div class="callout-title">🍿 Fun fact</div>
<p>Mỗi tối lúc 8pm, Netflix tiêu thụ ~15% toàn bộ băng thông internet toàn cầu. Open Connect đảm bảo 99% data đó không cần đi qua đường trục internet quốc tế.</p>
</div>
`
  },

  /* ============================================================
   * CHƯƠNG 28: UBER
   * ============================================================ */
  {
    group: "🎯 Phần 4: Case Study huyền thoại",
    icon: "🚗",
    title: "Chương 28: Uber - Matching tài xế & khách trong 30 giây",
    content: `
<h1>Chương 28: Uber / Grab</h1>
<p class="subtitle">Bài toán "ai gần ai" với hàng triệu xe đang di chuyển 🚗</p>

<h2>📋 Yêu cầu</h2>
<ul>
  <li>Khách đặt xe → tìm tài xế gần nhất trong vài giây.</li>
  <li>Track vị trí tài xế realtime.</li>
  <li>Tính ETA, giá tiền.</li>
  <li>Payment, rating.</li>
  <li>Surge pricing khi cầu > cung.</li>
</ul>

<h2>📊 Scale</h2>
<pre><code>30M trips/day worldwide
15M active drivers
Mỗi tài xế gửi GPS mỗi 4 giây
= 15M × 15 lần/phút = 225M update/phút = 3.75M/giây 🤯</code></pre>

<h2>🗺️ Geospatial Indexing - Vấn đề "ai gần"</h2>
<p>Naive: lưu (driver_id, lat, lng) và query <code>WHERE distance < 1km</code>. Không scale!</p>

<h3>Giải pháp 1: Geohash</h3>
<p>Encode (lat, lng) thành string. Tiền tố chung = gần nhau.</p>
<pre><code>(21.0285, 105.8542)  → "w7eq..."  Hà Nội
(21.0286, 105.8543)  → "w7eq..."  rất gần
(10.7626, 106.6602)  → "w3gv..."  Sài Gòn (khác xa)</code></pre>

<h3>Giải pháp 2: Quadtree</h3>
<p>Chia bản đồ thành 4 ô. Ô nào có > N điểm thì chia tiếp.</p>

<h3>Giải pháp 3: H3 - Uber's hexagonal grid ⭐</h3>
<p>Uber tự code H3: chia thế giới thành lục giác đều. Lục giác có lợi thế là <strong>khoảng cách từ tâm đến 6 hàng xóm bằng nhau</strong> (vuông thì không).</p>

<div class="diagram">
<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
  <g fill="none" stroke="#6c5ce7" stroke-width="1.5">
    <polygon points="100,40 130,55 130,85 100,100 70,85 70,55"/>
    <polygon points="160,40 190,55 190,85 160,100 130,85 130,55"/>
    <polygon points="220,40 250,55 250,85 220,100 190,85 190,55"/>
    <polygon points="130,100 160,115 160,145 130,160 100,145 100,115"/>
    <polygon points="190,100 220,115 220,145 190,160 160,145 160,115"/>
    <polygon points="250,100 280,115 280,145 250,160 220,145 220,115"/>
  </g>
  <circle cx="190" cy="100" r="6" fill="#ff5e7a"/>
  <text x="200" y="105" font-size="11" fill="currentColor">Driver</text>
  <circle cx="160" cy="115" r="5" fill="#00d2a8"/>
  <circle cx="220" cy="115" r="5" fill="#00d2a8"/>
  <text x="280" y="170" font-size="11" fill="currentColor">→ ô lục giác = "neighborhood"</text>
</svg>
<div class="diagram-caption">Uber H3 - lưới lục giác</div>
</div>

<h2>📡 GPS update flow</h2>
<pre><code>Driver app → GPS mỗi 4s → API Gateway → Kafka

Worker đọc Kafka:
1. Update Redis Geo: GEOADD drivers lng lat driverId
2. Cập nhật ETA, status

Khi khách đặt:
1. GEOSEARCH drivers FROMLONLAT lng lat BYRADIUS 3km
2. Lấy top 20 driver gần nhất
3. Filter: đang available, rating, vehicle type
4. Gửi request đồng thời tới 5 driver
5. Driver đầu tiên accept → match!</code></pre>

<h2>💰 Surge Pricing</h2>
<p>Khu vực có nhu cầu cao + ít xe → tăng giá để:</p>
<ul>
  <li>Khuyến khích tài xế đổ về khu đó.</li>
  <li>Giảm nhu cầu (người không gấp sẽ chờ).</li>
</ul>
<p>Real-time tính cho từng hex cell mỗi 30 giây.</p>

<h2>🗺️ ETA & Routing</h2>
<p>Tính đường đi qua đồ thị đường phố:</p>
<ul>
  <li>Dijkstra / A* algorithm.</li>
  <li>Cập nhật weight theo traffic realtime.</li>
  <li>Dùng OSRM, Valhalla, hoặc Google Maps API.</li>
</ul>

<h2>💳 Payment & idempotency</h2>
<p>Critical: không được charge khách 2 lần!</p>
<pre><code>POST /charge
Idempotency-Key: abc-123

// Server: lưu kết quả với key này
// Lần gọi tiếp với cùng key → trả kết quả cũ, không charge nữa</code></pre>

<h2>🏗️ Service breakdown</h2>
<div class="cards">
  <div class="card"><div class="emoji">📍</div><h4>Location Service</h4><p>Track GPS tất cả driver.</p></div>
  <div class="card"><div class="emoji">🎯</div><h4>Matching Service</h4><p>Match khách - tài xế.</p></div>
  <div class="card"><div class="emoji">🛣️</div><h4>Routing Service</h4><p>Tính đường, ETA.</p></div>
  <div class="card"><div class="emoji">💰</div><h4>Pricing Service</h4><p>Surge, fare calculation.</p></div>
  <div class="card"><div class="emoji">💳</div><h4>Payment Service</h4><p>Thanh toán, refund.</p></div>
  <div class="card"><div class="emoji">🔔</div><h4>Notification</h4><p>Push, SMS, in-app.</p></div>
</div>

<div class="callout tip">
<div class="callout-title">💡 Bài học</div>
<p>Đối với <strong>geo</strong>, đừng dùng SQL <code>SELECT WHERE distance &lt; X</code>. Dùng Redis Geo, PostGIS, hoặc Elasticsearch geo_point. Nhanh gấp 1000 lần.</p>
</div>
`
  },

  /* ============================================================
   * CHƯƠNG 29: WHATSAPP / MESSENGER
   * ============================================================ */
  {
    group: "🎯 Phần 4: Case Study huyền thoại",
    icon: "💬",
    title: "Chương 29: WhatsApp - 2 tỷ user, mã hoá đầu-cuối",
    content: `
<h1>Chương 29: WhatsApp / Messenger</h1>
<p class="subtitle">2 tỷ user, 100 tỷ tin nhắn/ngày, mã hoá end-to-end 💬</p>

<h2>📋 Yêu cầu</h2>
<ul>
  <li>1-1 chat, group chat (tối đa 1024 người).</li>
  <li>Text, image, video, voice, file.</li>
  <li>Online status, typing indicator, read receipt.</li>
  <li>End-to-end encryption.</li>
  <li>Offline → delivery khi online lại.</li>
  <li>Multi-device sync.</li>
</ul>

<h2>📊 Scale</h2>
<pre><code>2B user, 1B DAU
100B message/day = 1.16M msg/giây
WhatsApp từng dùng ~50 server Erlang phục vụ 900M user!</code></pre>

<h2>🔗 Persistent connection</h2>
<p>Mỗi client giữ WebSocket / XMPP connection với server. Server biết user nào online, push tin nhắn realtime.</p>

<div class="diagram">
<svg viewBox="0 0 600 220" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="80" width="80" height="40" rx="8" fill="#ff5e7a"/>
  <text x="60" y="105" text-anchor="middle" fill="white" font-size="11">User A</text>
  <rect x="20" y="140" width="80" height="40" rx="8" fill="#ff5e7a"/>
  <text x="60" y="165" text-anchor="middle" fill="white" font-size="11">User B</text>

  <rect x="160" y="60" width="120" height="35" rx="8" fill="#6c5ce7"/>
  <text x="220" y="83" text-anchor="middle" fill="white" font-size="11">Chat Server 1</text>
  <rect x="160" y="115" width="120" height="35" rx="8" fill="#6c5ce7"/>
  <text x="220" y="138" text-anchor="middle" fill="white" font-size="11">Chat Server 2</text>

  <rect x="340" y="80" width="120" height="35" rx="8" fill="#f9a826"/>
  <text x="400" y="103" text-anchor="middle" fill="white" font-size="11">Message Queue</text>

  <rect x="500" y="40" width="80" height="35" rx="8" fill="#00d2a8"/>
  <text x="540" y="62" text-anchor="middle" fill="white" font-size="11">Msg DB</text>
  <rect x="500" y="100" width="80" height="35" rx="8" fill="#00d2a8"/>
  <text x="540" y="122" text-anchor="middle" fill="white" font-size="11">Offline Store</text>
  <rect x="500" y="160" width="80" height="35" rx="8" fill="#00d2a8"/>
  <text x="540" y="182" text-anchor="middle" fill="white" font-size="11">User Presence</text>

  <line x1="100" y1="100" x2="160" y2="80" stroke="#5a5a72"/>
  <line x1="100" y1="160" x2="160" y2="130" stroke="#5a5a72"/>
  <line x1="280" y1="97" x2="340" y2="97" stroke="#5a5a72"/>
  <line x1="460" y1="97" x2="500" y2="57" stroke="#5a5a72"/>
  <line x1="460" y1="97" x2="500" y2="117" stroke="#5a5a72"/>
</svg>
<div class="diagram-caption">WhatsApp message flow</div>
</div>

<h2>🔄 Flow gửi tin nhắn</h2>
<pre><code>A gửi "Hi B"

1. A → WS Server 1: { to: B, content: "Hi B" }
2. Server 1 → DB: lưu message (id, from, to, content)
3. Server 1 → Server 1 trả ACK cho A (status: sent ✓)
4. Lookup: B đang ở WS Server 2 (qua Redis presence)
5. Server 1 → Server 2 (qua MQ): "msg cho B"
6. Server 2 → B: push message
7. B device ACK → Server 2 (delivered ✓✓)
8. B đọc → ACK đọc → A thấy ✓✓ xanh</code></pre>

<h2>📤 Offline message</h2>
<p>B đang offline. Message phải được lưu, gửi khi B online lại.</p>
<ul>
  <li>Lưu vào "pending queue" theo userId.</li>
  <li>B online → đọc queue → gửi.</li>
  <li>WhatsApp <strong>xoá tin sau khi delivered</strong> (không lưu server vĩnh viễn).</li>
</ul>

<h2>🔐 End-to-end Encryption (Signal Protocol)</h2>
<p>Server không đọc được nội dung. Cách hoạt động (đơn giản hoá):</p>
<ol>
  <li>Mỗi user có cặp khoá public/private.</li>
  <li>A muốn gửi B → lấy public key của B từ server.</li>
  <li>A mã hoá tin nhắn bằng public key B.</li>
  <li>Server chỉ thấy ciphertext.</li>
  <li>B nhận, dùng private key của mình để giải mã.</li>
  <li>Mỗi tin nhắn có khoá riêng (Double Ratchet) - dù key cũ bị leak, tin nhắn cũ vẫn an toàn.</li>
</ol>

<h2>👥 Group chat</h2>
<p>Group 1000 người - A gửi → server fan-out tới 999 người.</p>
<p>Với E2E: A mã hoá tin nhắn 999 lần (1 cho mỗi receiver)? → Nặng! Giải pháp: <strong>sender key</strong> - mỗi member group có shared key.</p>

<h2>📲 Push notification khi user kill app</h2>
<p>WS connection mất khi app bị kill. Dùng <strong>APNs (iOS) / FCM (Android)</strong> để wake up app.</p>
<pre><code>Server không gửi WS được nữa
→ Gọi FCM/APNs với deviceToken của B
→ Hệ điều hành B push notification
→ B mở app → reconnect WS → đồng bộ tin nhắn mới</code></pre>

<h2>📷 Media (image, video, voice)</h2>
<ul>
  <li>Upload media lên S3-like storage.</li>
  <li>Mã hoá file bằng symmetric key K.</li>
  <li>Gửi qua chat: <code>{ mediaUrl, encryptionKey K mã hoá bằng E2E }</code>.</li>
  <li>Receiver tải file, giải mã.</li>
</ul>

<h2>🟢 Online status & Typing</h2>
<p>Lightweight events qua WS, không lưu DB. Có thể trễ vài giây - ai care 😄.</p>

<div class="callout fun">
<div class="callout-title">🤯 WhatsApp Magic</div>
<p>Năm 2014, WhatsApp có <strong>32 engineer</strong> phục vụ <strong>450 triệu user</strong>. Bí mật: Erlang/OTP - ngôn ngữ chuyên cho concurrent, fault-tolerant. 1 server xử lý 1 triệu kết nối WebSocket.</p>
</div>
`
  },

  /* ============================================================
   * CHƯƠNG 30: INSTAGRAM/YOUTUBE
   * ============================================================ */
  {
    group: "🎯 Phần 4: Case Study huyền thoại",
    icon: "📸",
    title: "Chương 30: Instagram, YouTube & Tổng kết hành trình",
    content: `
<h1>Chương 30: Instagram, YouTube & Tổng kết</h1>
<p class="subtitle">Chặng cuối - bonus 2 case + đúc kết 🎓</p>

<h2>📸 Instagram</h2>
<p>Giống Twitter + Facebook nhưng tập trung vào <strong>ảnh/video</strong>.</p>

<h3>Đặc thù</h3>
<ul>
  <li>Mỗi post 1-10 ảnh/video, có filter.</li>
  <li>Feed cá nhân hoá (ranking AI như FB).</li>
  <li>Stories - 24h tự xoá.</li>
  <li>Reels - short video.</li>
  <li>Direct message.</li>
</ul>

<h3>Stack</h3>
<ul>
  <li>Backend: Python (Django) - bạn đọc đúng đó, Python phục vụ tỷ user.</li>
  <li>DB: PostgreSQL (sharded), Cassandra.</li>
  <li>Cache: Memcached khổng lồ.</li>
  <li>Photo: S3-like + CDN.</li>
  <li>Search: Elasticsearch.</li>
  <li>ML: PyTorch cho recommendation, content moderation.</li>
</ul>

<h3>Stories - thuật toán xếp hạng</h3>
<p>Stories không theo thời gian, mà AI quyết ai hiện trước:</p>
<ul>
  <li>Bạn tương tác với người này gần đây.</li>
  <li>Story mới đăng vài phút.</li>
  <li>Bạn thường click vào story của họ.</li>
</ul>

<h2>📺 YouTube</h2>
<p>Streaming video lớn nhất thế giới: 500h video upload mỗi phút!</p>

<h3>Upload pipeline</h3>
<pre><code>1. User upload raw video (có thể 4K, 100GB)
2. Chunk upload to S3
3. Trigger job vào Kafka
4. Transcoding cluster:
   - Decode raw
   - Encode → 144p, 360p, 720p, 1080p, 4K
   - Multiple codecs: H.264, H.265, VP9, AV1
   - Generate thumbnail, preview
5. Distribute to CDN
6. AI scan: copyright (Content ID), spam, NSFW
7. Available to watch</code></pre>

<h3>Recommendation - "Up Next"</h3>
<p>2 giai đoạn:</p>
<ol>
  <li><strong>Candidate generation</strong>: từ millions video, chọn ~1000 ứng viên (collaborative filter).</li>
  <li><strong>Ranking</strong>: deep neural network xếp hạng dựa trên: watch time history, demographics, time of day, device...</li>
</ol>

<h3>Comment system</h3>
<p>Video viral có 1M+ comment. Cần:</p>
<ul>
  <li>Pagination, infinite scroll.</li>
  <li>Top comment dùng ranking (like, replies, age).</li>
  <li>Spam detection, moderation.</li>
</ul>

<h2>🎓 TỔNG KẾT - 10 bài học vàng</h2>

<h3>1. Start simple</h3>
<p>Monolith trước, microservices sau. YAGNI mạnh.</p>

<h3>2. Đo trước khi tối ưu</h3>
<p>Đừng đoán, hãy đo. Profile, log, metric. <em>"Premature optimization is the root of all evil"</em> - Donald Knuth.</p>

<h3>3. Caching là vũ khí mạnh nhất</h3>
<p>Cache giải quyết 80% bottleneck. CPU cache → RAM → Redis → CDN.</p>

<h3>4. Đọc nhiều, ghi ít - chiến lược khác nhau</h3>
<p>Read-heavy → cache + replica. Write-heavy → queue + batch + sharding.</p>

<h3>5. Async khi có thể</h3>
<p>Ghi DB → ok. Gửi email → ném queue. Train ML → batch job đêm. User chỉ chờ response cốt lõi.</p>

<h3>6. Mọi thứ đều có thể fail</h3>
<p>Mạng, server, DB, dependency. Code defensive: timeout, retry, circuit breaker, fallback.</p>

<h3>7. Idempotency</h3>
<p>Mỗi operation phải có thể thực hiện nhiều lần mà kết quả vẫn vậy. Đặc biệt quan trọng với payment, API.</p>

<h3>8. Observability từ ngày 1</h3>
<p>Logs, metrics, tracing. Không có chúng = bay trong sương mù.</p>

<h3>9. Trade-offs ở mọi quyết định</h3>
<p>CAP, ACID vs BASE, SQL vs NoSQL, monolith vs microservice... Không có "best", chỉ có "fit".</p>

<h3>10. Học từ Big Tech, nhưng đừng copy mù</h3>
<p>Google, Netflix dùng kiến trúc cho 1 tỷ user. App 100 user của bạn không cần Kubernetes cluster!</p>

<h2>🛠️ Bộ công cụ "sống còn"</h2>
<table>
  <tr><th>Domain</th><th>Tool</th></tr>
  <tr><td>Web framework</td><td>Express, Spring Boot, Django, FastAPI</td></tr>
  <tr><td>SQL</td><td>PostgreSQL, MySQL</td></tr>
  <tr><td>NoSQL</td><td>MongoDB, DynamoDB, Cassandra</td></tr>
  <tr><td>Cache</td><td>Redis, Memcached</td></tr>
  <tr><td>Search</td><td>Elasticsearch, OpenSearch</td></tr>
  <tr><td>Queue</td><td>Kafka, RabbitMQ, SQS</td></tr>
  <tr><td>LB</td><td>Nginx, HAProxy, ALB</td></tr>
  <tr><td>Container</td><td>Docker, Kubernetes</td></tr>
  <tr><td>Monitoring</td><td>Prometheus + Grafana, Datadog</td></tr>
  <tr><td>Tracing</td><td>Jaeger, Zipkin, OpenTelemetry</td></tr>
  <tr><td>Cloud</td><td>AWS, GCP, Azure</td></tr>
</table>

<h2>📚 Bước tiếp theo</h2>
<ol>
  <li><strong>Đọc sách</strong>: <em>Designing Data-Intensive Applications</em> (Martin Kleppmann) - kinh thánh.</li>
  <li><strong>Blog</strong>: High Scalability, Netflix Tech Blog, Uber Engineering, Discord Engineering.</li>
  <li><strong>YouTube</strong>: ByteByteGo, Hussein Nasser, Gaurav Sen.</li>
  <li><strong>Thực hành</strong>: tự build mini project mỗi pattern (chat, URL shortener, feed).</li>
  <li><strong>Phỏng vấn mock</strong>: pramp.com, leetcode system design.</li>
</ol>

<h2>🎉 Lời chia tay</h2>
<div class="callout fun">
<div class="callout-title">🚀 Hẹn gặp lại</div>
<p>Bạn đã đi qua 30 chương - từ quán phở vỉa hè đến Netflix, Uber. System Design là hành trình <strong>cả đời</strong>, không có điểm kết. Mỗi vấn đề mới = cơ hội học. Đừng sợ sai, chỉ sợ không làm. Chúc bạn build được những hệ thống đỉnh cao! 🍜→🚀</p>
</div>

<p style="text-align:center; font-size: 18px; margin: 40px 0;">
🎓 <strong>Bạn vừa hoàn thành 30 chương ~ 300 trang!</strong><br>
Chia sẻ kiến thức này tới bạn bè và tiếp tục code thật vui 💖
</p>
`
  }
];

window.CHAPTERS.push(..._PART4);
