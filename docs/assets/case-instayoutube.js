/* =========================================================
 * CHƯƠNG 30: INSTAGRAM, YOUTUBE & TỔNG KẾT - DEEP DIVE
 * ========================================================= */

window.CHAPTERS = window.CHAPTERS || [];

window.CHAPTERS.push({
  group: "🎯 Phần 4: Case Study huyền thoại",
  icon: "📸",
  title: "Chương 30: Instagram, YouTube & Tổng kết hành trình (Deep Dive)",
  content: `
<h1>Chương 30: Instagram, YouTube & Lời kết</h1>
<p class="subtitle">2 case cuối cùng + framework để tự design bất cứ hệ thống gì 🎓</p>

<h2>━━━━━━━━━━━━━━━━━━━━━━━━</h2>
<h2>📸 PHẦN 1: INSTAGRAM</h2>

<h3>📋 Requirements</h3>
<ul>
<li>Post: 1-10 photos/videos, filter, caption, hashtag, location, tag friends.</li>
<li>Feed - ranked AI.</li>
<li>Stories (24h ephemeral).</li>
<li>Reels (short video, TikTok-style).</li>
<li>Direct Message.</li>
<li>Search, hashtag, location-based discovery.</li>
<li>Profile, follow/unfollow.</li>
<li>Likes, comments, save.</li>
</ul>

<h3>📊 Scale</h3>
<pre><code>2B MAU, 500M DAU
500M Stories/day
95M photos/videos posted/day
Avg 100MB upload per user per month
Total media stored: ~100 PB</code></pre>

<h3>🏗️ Architecture Highlights</h3>

<h4>1. Photo Upload Pipeline</h4>
<pre><code>1. Client capture/select photo
2. Client-side: resize to multiple sizes, apply filter, generate JPEG
3. Request pre-signed URL from Upload Service
4. PUT to S3 (Facebook's f4/Haystack actually)
5. After upload complete, client calls Post Service:
   POST /posts { mediaIds, caption, location, ... }
6. Post Service:
   - Persist post metadata to Cassandra
   - Update user profile post count
   - Trigger fan-out (event to Kafka)
   - Generate thumbnails async via worker
7. Fan-out workers:
   - Get author's followers
   - Push post_id to follower feed cache (Redis)
   - Like Twitter hybrid: push for normal, pull for celeb</code></pre>

<h4>2. Stories - Ephemeral 24h</h4>

<pre><code>Storage:
  Cassandra TTL = 24h (auto-delete)

Schema:
  stories (
    user_id (partition key),
    story_id (cluster key, time-based),
    media_url,
    created_at,
    expires_at,
    viewers (set&lt;user_id, viewed_at&gt;)
  )

Story bar at top of feed:
  For each followee, has active story?
  Pre-computed list cached per user, refresh every minute
  Order: AI rank (close friends, recent interaction)

Viewer list:
  When B views A's story:
    ADD B to viewers set
    Push event to A (notification)</code></pre>

<h4>3. Reels - Short Video Feed</h4>

<p>Different from main feed - infinite vertical scroll, autoplay, algorithm-driven.</p>

<pre><code>Architecture similar to TikTok For You Page:
- Candidate generation:
  - User embedding (deep model) → query similar videos
  - Hashtag/audio-based matching
  - Trending in user's region
- Ranking model:
  - Predict: watch_time, like, share, follow
  - Compose score
  - Diversify (don't show 5 same-creator videos)
- Pre-fetch next 5 videos in advance
- Track watch_time precisely (8s threshold, 50% threshold, full watch)

Key insight: Reels uses MUCH more aggressive personalization than main feed.
Watch time is THE metric.</code></pre>

<h4>4. Direct Messages</h4>

<p>Similar to WhatsApp but lighter:</p>
<ul>
<li>No E2E by default (recently optional for some chats).</li>
<li>WebSocket connection.</li>
<li>Message stored in Cassandra (vs WhatsApp deletes).</li>
<li>Cross-device sync via server (no E2E complexity).</li>
</ul>

<h4>5. Search</h4>

<pre><code>Elasticsearch index types:
- Users: username, name, bio, follower_count
- Hashtags: tag name, post_count, trending_score
- Locations: name, geo, post_count
- Posts: caption, hashtags, location, time

Ranking:
- Personalization: bias toward users in user's social graph
- Recency boost for hashtags
- Geographic relevance for locations

Auto-complete:
- Edge n-gram tokenizer
- Personalized suggestions via user history</code></pre>

<h3>🔑 Tech Stack</h3>
<table>
<tr><th>Layer</th><th>Tech</th></tr>
<tr><td>Backend</td><td>Django (Python) + Cinder (C++)</td></tr>
<tr><td>DB</td><td>PostgreSQL (sharded), Cassandra</td></tr>
<tr><td>Cache</td><td>Memcached + TAO (from Facebook)</td></tr>
<tr><td>Photo</td><td>Haystack (Facebook)</td></tr>
<tr><td>Search</td><td>Elasticsearch</td></tr>
<tr><td>ML</td><td>PyTorch + custom feature platform</td></tr>
<tr><td>Stream</td><td>Kafka</td></tr>
</table>

<div class="callout fun">
<div class="callout-title">🐍 Surprise</div>
<p>Instagram backend chính dùng <strong>Python (Django)</strong> phục vụ 2B user. Họ contribute lại upstream nhiều optimization. Critical paths được rewrite sang C++ (Cinder = Instagram's CPython fork).</p>
</div>

<h2>━━━━━━━━━━━━━━━━━━━━━━━━</h2>
<h2>📺 PHẦN 2: YOUTUBE</h2>

<h3>📋 Requirements</h3>
<ul>
<li>Video upload (up to 12h, 256GB, 8K).</li>
<li>Streaming với ABR.</li>
<li>Search.</li>
<li>Recommendation (homepage, "Up Next").</li>
<li>Live streaming.</li>
<li>Comments, likes, subscriptions.</li>
<li>Monetization (ads, channel memberships).</li>
<li>YouTube Shorts (TikTok-style).</li>
</ul>

<h3>📊 Scale</h3>
<pre><code>2.7B MAU
500h video uploaded/minute = 720K hours/day
1B hours watched/day
~5B videos watched/day
Total storage: exabytes (uncertain exact)
Bandwidth: peak ~100 Tbps via Google's own CDN</code></pre>

<h3>🎥 Upload & Encoding Pipeline</h3>

<pre><code>1. Client uploads via resumable HTTP (chunked, can pause)
2. Raw file → Google Cloud Storage (GCS)
3. Trigger pipeline:
   - Container demux (mp4, mkv, mov, ...)
   - Validate, virus scan
   - Generate thumbnails (multiple, ML picks best)
4. Chunk video for parallel encoding
5. Encode farm (Google Cloud, custom hardware):
   For each profile (~50-100 variants):
     - Resolution: 144p, 240p, 360p, 480p, 720p, 1080p, 1440p, 4K, 8K
     - Codec: H.264 (compat), VP9 (efficient), AV1 (newest)
     - HDR variants
   Use VCN (YouTube custom codec) for storage efficiency
6. Generate manifest (DASH, HLS)
7. Distribute to Google's global CDN edge nodes
8. Content ID scan: detect copyright (audio + video fingerprint)
9. ML classifiers: NSFW, hate speech, spam → may auto-restrict
10. Set video.status = "ready"
11. Notify uploader, push to subscribers if subscribed
12. Available worldwide ~minutes to hours after upload</code></pre>

<h3>🌐 Google Global CDN</h3>

<p>YouTube uses Google's <strong>internal CDN</strong>:</p>
<ul>
<li>Google has private fiber network connecting datacenters worldwide.</li>
<li>Cache nodes (Google Global Cache - GGC) embedded in ISPs (similar to Netflix Open Connect).</li>
<li>QUIC protocol (Google invented) for faster delivery.</li>
<li>HTTP/3 mainstream now.</li>
</ul>

<h3>🎯 Recommendation - 2 Stages</h3>

<h4>Stage 1: Candidate Generation</h4>
<p>From billion videos → ~hundreds candidates.</p>

<pre><code>// Approach: Deep Neural Network for embedding
User vector U (from history, demographics, context)
Video vector V (from metadata, watch patterns)

similarity = U · V

Use ANN (Approximate Nearest Neighbor):
  Search ~hundreds videos with highest similarity to U
  Tools: FAISS, ScaNN

Multiple "channels" of candidates:
  - Similar to recent watches
  - Topic-based
  - Trending
  - Subscribed channels
  - Trending in country</code></pre>

<h4>Stage 2: Ranking</h4>
<p>~hundreds candidates → rank top 20 for display.</p>

<pre><code>Deep model with hundreds features:
- Video features (length, age, view_count, like_ratio)
- User features (preferences, recent history)
- Cross features (user × video interaction)
- Context (device, time, prev video)

Output: predicted watch_time (key metric!)

Why watch_time not click? → Click-bait optimization avoided.
"Up Next" optimization → keep user on platform.

Loss: weighted logistic regression on watch_time</code></pre>

<div class="callout tip">
<div class="callout-title">🤔 Tại sao optimize cho "Watch Time" thay vì "Click"?</div>
<p>Những năm đầu, YouTube optimize ranking cho số lượt click. Kết quả? <strong>Đại dịch Clickbait</strong>: thumbnail sốc, tiêu đề lừa đảo, người dùng click vào xem 5 giây rồi thoát. Trải nghiệm tệ, quảng cáo không ai xem. Khi họ đổi thuật toán sang tối ưu <strong>Watch Time (tổng thời gian xem)</strong>, clickbait chết ngay lập tức vì video dở không giữ chân người dùng được. Bài học: metric bạn chọn để tối ưu sẽ quyết định hành vi của toàn bộ ecosystem.</p>
</div>

<h3>💬 Comment System (1M+ comments on viral video)</h3>

<pre><code>Schema (Spanner / Bigtable):
  video_id (partition),
  comment_id (Snowflake),
  parent_comment_id,
  author_id,
  content,
  like_count,
  reply_count,
  created_at

Indexes:
  by (video_id, created_at DESC) → newest first
  by (video_id, score DESC)      → top comments

Score = function(likes, replies, recency, author_reputation)
Re-compute every few minutes for popular videos

Pagination: cursor-based (last seen comment_id)

Spam filter: ML model on insert</code></pre>

<h3>📺 Live Streaming</h3>

<p>Different from VOD:</p>
<ul>
<li>Real-time encoding (no batch).</li>
<li>Low latency required (1-30s acceptable, &lt;2s for "low latency" mode).</li>
<li>Multi-bitrate transcoding live.</li>
</ul>

<pre><code>1. Streamer pushes RTMP/SRT to YouTube ingest
2. Live transcoder: real-time generate 5-7 bitrate variants
3. Segment into 2-6 second chunks
4. Push chunks to CDN edges (HLS / LL-HLS)
5. Viewers fetch chunks via standard HLS player
6. Chat: separate system - WebSocket, sharded by stream_id
7. Super Chat / Donate: dedicated path with payment integration

Latency budget:
  Ingest → encode: 1-3s
  CDN distribution: 1-3s
  Player buffer: 2-5s
  Total: 4-11s end-to-end</code></pre>

<h2>━━━━━━━━━━━━━━━━━━━━━━━━</h2>
<h2>🎓 PHẦN 3: TỔNG KẾT - FRAMEWORK PHỎNG VẤN</h2>

<h3>📋 The RESHADED Framework</h3>

<table>
<tr><th>Step</th><th>Time</th><th>Activity</th></tr>
<tr><td>R - Requirements</td><td>5 min</td><td>Functional + Non-functional + Constraints</td></tr>
<tr><td>E - Estimation</td><td>5 min</td><td>QPS, Storage, Bandwidth, Cache size</td></tr>
<tr><td>S - System interface (API)</td><td>3 min</td><td>Endpoints, request/response</td></tr>
<tr><td>H - High-level design</td><td>5 min</td><td>Boxes & arrows, main components</td></tr>
<tr><td>A - API & Data Model</td><td>5 min</td><td>Schema, indexes</td></tr>
<tr><td>D - Detailed component design</td><td>10 min</td><td>Deep dive 2-3 critical components</td></tr>
<tr><td>E - Evaluation (trade-offs)</td><td>5 min</td><td>Discuss alternatives, why this choice</td></tr>
<tr><td>D - Discussion (bottlenecks)</td><td>5 min</td><td>Scale, edge cases, failures</td></tr>
</table>

<h3>🎯 Common Patterns Cheat Sheet</h3>

<h4>1. Read-heavy system</h4>
<ul>
<li>Caching (Redis, Memcached, CDN).</li>
<li>Read replicas.</li>
<li>Denormalization.</li>
<li>Pre-computation (materialized view).</li>
</ul>

<h4>2. Write-heavy system</h4>
<ul>
<li>Message queue (Kafka) - buffer and batch.</li>
<li>Async processing.</li>
<li>Sharding by key.</li>
<li>Write-optimized DB (Cassandra, HBase).</li>
</ul>

<h4>3. Real-time system</h4>
<ul>
<li>WebSocket / SSE for push.</li>
<li>Sticky session (LB IP hash).</li>
<li>Redis Pub/Sub for cross-server.</li>
<li>Event-driven architecture.</li>
</ul>

<h4>4. Geo / spatial</h4>
<ul>
<li>Geohash, Quadtree, or H3.</li>
<li>Redis Geo or PostGIS.</li>
<li>Pre-aggregated grid metrics.</li>
</ul>

<h4>5. Search</h4>
<ul>
<li>Elasticsearch / OpenSearch.</li>
<li>Inverted index.</li>
<li>BM25 + ML re-ranking.</li>
<li>Vector search for semantic (FAISS).</li>
</ul>

<h4>6. Feed / Timeline</h4>
<ul>
<li>Push (fan-out on write) cho normal user.</li>
<li>Pull (fan-out on read) cho celebrities.</li>
<li>Hybrid - WINNER.</li>
<li>Pre-compute + cache.</li>
</ul>

<h4>7. Payment / Transactional</h4>
<ul>
<li>ACID DB (Postgres, MySQL).</li>
<li>Idempotency keys.</li>
<li>Saga pattern for distributed.</li>
<li>2PC for cross-system.</li>
<li>Audit log.</li>
</ul>

<h4>8. Streaming / Video</h4>
<ul>
<li>Chunked storage (HLS/DASH).</li>
<li>ABR algorithm in client.</li>
<li>CDN with edge caches.</li>
<li>Per-title encoding optimization.</li>
</ul>

<h4>9. Distributed counter</h4>
<ul>
<li>Redis INCR (eventual).</li>
<li>Sharded counter (n shards, SUM on read).</li>
<li>HyperLogLog (approximate, cheap).</li>
<li>Count-Min Sketch (top-k).</li>
</ul>

<h4>10. ID generation</h4>
<ul>
<li>UUID (random, easy, longer).</li>
<li>Snowflake (time-ordered, 64-bit, distributed).</li>
<li>Ticket Server (centralized counter shards).</li>
</ul>

<h3>⚖️ Trade-off Decisions</h3>

<table>
<tr><th>Trade-off</th><th>When to choose A</th><th>When to choose B</th></tr>
<tr><td>SQL vs NoSQL</td><td>Complex queries, transactions</td><td>Scale, simple access patterns</td></tr>
<tr><td>Sync vs Async</td><td>User waiting for result</td><td>Non-critical, can delay</td></tr>
<tr><td>Strong vs Eventual</td><td>Money, inventory</td><td>Social, content</td></tr>
<tr><td>Push vs Pull</td><td>Few followers per user</td><td>Many followers (celebrity)</td></tr>
<tr><td>Microservices vs Monolith</td><td>Big team, independent scaling</td><td>Small team, simplicity</td></tr>
<tr><td>Premature optimization</td><td>Never</td><td>Profile first, then optimize</td></tr>
</table>

<h3>💡 10 Bài Học Vàng cho Phỏng Vấn</h3>

<ol>
<li><strong>Always clarify first</strong>. Asking questions = senior signal.</li>
<li><strong>Estimate before designing</strong>. Numbers drive decisions.</li>
<li><strong>Start simple, scale later</strong>. Don't overengineer in step 1.</li>
<li><strong>Draw diagrams</strong>. Visual > verbal.</li>
<li><strong>State assumptions out loud</strong>. Interviewer corrects you.</li>
<li><strong>Discuss trade-offs explicitly</strong>. "We could do X or Y. I choose X because Z."</li>
<li><strong>Don't pretend to know</strong>. "I'd research this if real" beats fake confidence.</li>
<li><strong>Drive the conversation</strong>. Don't wait for questions, propose next topic.</li>
<li><strong>Code is rarely asked</strong>. Conceptual design > syntax.</li>
<li><strong>Show data-driven thinking</strong>. "P99 200ms means..." beats "fast".</li>
</ol>

<h3>📚 Recommended Further Study</h3>

<h4>Books (deepening)</h4>
<ul>
<li><strong>Designing Data-Intensive Applications</strong> - Martin Kleppmann (must-read)</li>
<li><strong>System Design Interview Vol 1 & 2</strong> - Alex Xu</li>
<li><strong>Building Microservices</strong> - Sam Newman</li>
<li><strong>Site Reliability Engineering</strong> - Google SRE book (free online)</li>
</ul>

<h4>Engineering blogs</h4>
<ul>
<li>High Scalability (highscalability.com)</li>
<li>Netflix Tech Blog</li>
<li>Uber Engineering</li>
<li>Discord Engineering</li>
<li>Meta Engineering</li>
<li>AWS Architecture Blog</li>
<li>Google Cloud Blog</li>
</ul>

<h4>YouTube channels</h4>
<ul>
<li>ByteByteGo (Alex Xu)</li>
<li>Gaurav Sen</li>
<li>Hussein Nasser</li>
<li>System Design Interview channel</li>
</ul>

<h4>Hands-on practice</h4>
<ul>
<li>Build mini-versions: chat app, URL shortener, social feed.</li>
<li>Deploy on AWS/GCP free tier.</li>
<li>Load test with k6 or locust.</li>
<li>Mock interview: pramp.com, leetcode.com.</li>
</ul>

<h3>🎯 Top 30 Design Interview Questions</h3>
<ol>
<li>Design URL shortener (bit.ly)</li>
<li>Design Twitter</li>
<li>Design Instagram feed</li>
<li>Design YouTube</li>
<li>Design Netflix</li>
<li>Design Uber / Lyft</li>
<li>Design WhatsApp / Messenger</li>
<li>Design Dropbox / Google Drive</li>
<li>Design Google Search</li>
<li>Design Google Maps</li>
<li>Design Tinder</li>
<li>Design Spotify</li>
<li>Design Airbnb</li>
<li>Design Stack Overflow</li>
<li>Design Reddit</li>
<li>Design Pastebin</li>
<li>Design Web Crawler</li>
<li>Design Distributed Cache</li>
<li>Design Rate Limiter</li>
<li>Design Notification System</li>
<li>Design News Feed</li>
<li>Design Typeahead Suggestion</li>
<li>Design Yelp / Nearby Friends</li>
<li>Design Stock Exchange</li>
<li>Design Online Auction (eBay)</li>
<li>Design Distributed Logging</li>
<li>Design Hotel Booking</li>
<li>Design Payment System</li>
<li>Design Ride Estimation</li>
<li>Design Ad Click Aggregator</li>
</ol>

<h2>🎉 Lời chia tay</h2>
<div class="callout fun">
<div class="callout-title">🚀 Bạn đã hoàn thành 30 chương ~ 350 trang!</div>
<p>Bạn vừa đi qua một hành trình từ quán phở vỉa hè đến WhatsApp 2 tỷ user, từ HTTP basic đến E2E Signal Protocol, từ <code>SELECT * FROM users</code> đến petabyte-scale Cassandra clusters.</p>
<p>System Design là <strong>nghệ thuật cân đối</strong> giữa: simplicity vs scalability, cost vs performance, consistency vs availability. Không có "đúng nhất", chỉ có "phù hợp nhất với context hiện tại".</p>
<p>Mỗi hệ thống lớn bạn vừa học - WhatsApp, Netflix, Uber - đều bắt đầu từ những bug đơn giản, server đơn lẻ, code dirty của những engineer giống bạn. Sự khác biệt là họ <strong>liên tục học, đo, refactor</strong>. Bạn cũng vậy.</p>
<p>Đừng sợ thiết kế "không đủ enterprise". Hãy bắt đầu, deploy, đo, rồi cải tiến. Khi bạn build đến điểm cần shard DB hay add cache layer, bạn sẽ <em>cảm nhận được tại sao</em> chứ không chỉ học thuộc lòng nữa.</p>
<p>Chúc bạn build được những hệ thống đỉnh cao - và quan trọng hơn, build được sự nghiệp engineering bạn yêu thích! 🍜→🚀</p>
</div>

<p style="text-align:center; font-size: 20px; margin: 40px 0;">
🎓 <strong>End of Course - 30 chapters completed!</strong><br>
<em>"In engineering, the journey is the destination."</em><br>
</p>
`
});
