/* =========================================================
 * CHƯƠNG 26: FACEBOOK NEWSFEED - DEEP DIVE
 * Ranking ML, graph storage, photo storage (Haystack)
 * ========================================================= */

window.CHAPTERS = window.CHAPTERS || [];

window.CHAPTERS.push({
  group: "🎯 Phần 4: Case Study huyền thoại",
  icon: "📘",
  title: "Chương 26: Facebook Newsfeed - 3 tỷ user (Deep Dive)",
  content: `
<h1>Chương 26: Facebook Newsfeed</h1>
<p class="subtitle">Bài toán ranking AI cho 3 tỷ user 📘</p>

<h2>🎯 Khác Twitter chỗ nào?</h2>
<table>
<tr><th>Đặc điểm</th><th>Twitter</th><th>Facebook</th></tr>
<tr><td>Relationship</td><td>1 chiều (follow)</td><td>2 chiều (friend) + follow</td></tr>
<tr><td>Sort</td><td>Chronological (chính)</td><td>ML ranking</td></tr>
<tr><td>Content type</td><td>Chủ yếu text + media</td><td>Đa dạng: post, photo album, video, event, ad, group, marketplace</td></tr>
<tr><td>Privacy</td><td>Public/Protected</td><td>Friends, friends of friends, custom list, only me</td></tr>
<tr><td>Engagement</td><td>Like, retweet, reply</td><td>6 reactions, comment threaded, share + tag, save</td></tr>
</table>

<h2>📋 Bước 1: Requirements</h2>

<h3>Functional</h3>
<ul>
<li>Post: text, photo (1-30 ảnh), video, link preview, location, feeling.</li>
<li>Newsfeed - ranked AI, không chronological.</li>
<li>Friend system, follow without friend.</li>
<li>Privacy controls per-post.</li>
<li>Reactions, comments (threaded), shares.</li>
<li>Notification (like, comment, tag, friend request).</li>
<li>Stories, Reels (như Instagram).</li>
</ul>

<h3>Non-functional</h3>
<ul>
<li>3B user, 2B DAU.</li>
<li>Newsfeed P99 < 500ms (acceptable, vì có ML).</li>
<li>Highly available - không sập.</li>
<li>Multi-region (latency &lt; 200ms toàn cầu).</li>
</ul>

<h2>📊 Bước 2: Capacity</h2>

<pre><code>2B DAU
Avg user view feed 5 lần/ngày → 10B feed views/day = 115K/s avg, 350K/s peak

Posts:
- 30% DAU post/ngày = 600M post/day = 7000 post/s
- Avg post 5 KB (text + metadata)
- 5 năm: 600M × 5 KB × 365 × 5 = 5.5 PB metadata

Photos:
- 350M ảnh upload/day (FB lưu &gt; 250B ảnh)
- Avg 1MB sau optimize → 350 TB/day → 640 PB/5 năm

Graph:
- 2B user × 200 friend avg × 8 byte = 3.2 TB edges</code></pre>

<h2>🏗️ Bước 3: Architecture</h2>

<div class="diagram">
<svg viewBox="0 0 780 420" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="200" width="80" height="40" rx="8" fill="#ff5e7a"/>
  <text x="60" y="225" text-anchor="middle" fill="white" font-size="11">Client</text>

  <rect x="130" y="200" width="100" height="40" rx="8" fill="#6c5ce7"/>
  <text x="180" y="225" text-anchor="middle" fill="white" font-size="11">Edge / CDN</text>

  <rect x="260" y="200" width="100" height="40" rx="8" fill="#6c5ce7"/>
  <text x="310" y="225" text-anchor="middle" fill="white" font-size="11">Web Tier</text>

  <rect x="400" y="20" width="120" height="35" rx="8" fill="#6c5ce7"/>
  <text x="460" y="42" text-anchor="middle" fill="white" font-size="11">Feed Service</text>
  <rect x="400" y="70" width="120" height="35" rx="8" fill="#6c5ce7"/>
  <text x="460" y="92" text-anchor="middle" fill="white" font-size="11">Post Service</text>
  <rect x="400" y="120" width="120" height="35" rx="8" fill="#6c5ce7"/>
  <text x="460" y="142" text-anchor="middle" fill="white" font-size="11">Graph Service (TAO)</text>
  <rect x="400" y="170" width="120" height="35" rx="8" fill="#6c5ce7"/>
  <text x="460" y="192" text-anchor="middle" fill="white" font-size="11">Ranking Service</text>
  <rect x="400" y="220" width="120" height="35" rx="8" fill="#6c5ce7"/>
  <text x="460" y="242" text-anchor="middle" fill="white" font-size="11">Comment Service</text>
  <rect x="400" y="270" width="120" height="35" rx="8" fill="#6c5ce7"/>
  <text x="460" y="292" text-anchor="middle" fill="white" font-size="11">Notification</text>
  <rect x="400" y="320" width="120" height="35" rx="8" fill="#6c5ce7"/>
  <text x="460" y="342" text-anchor="middle" fill="white" font-size="11">Ads Service</text>

  <rect x="560" y="20" width="120" height="35" rx="8" fill="#00d2a8"/>
  <text x="620" y="42" text-anchor="middle" fill="white" font-size="11">MySQL (sharded)</text>
  <rect x="560" y="70" width="120" height="35" rx="8" fill="#00d2a8"/>
  <text x="620" y="92" text-anchor="middle" fill="white" font-size="11">TAO Cache</text>
  <rect x="560" y="120" width="120" height="35" rx="8" fill="#00d2a8"/>
  <text x="620" y="142" text-anchor="middle" fill="white" font-size="11">Memcache (huge)</text>
  <rect x="560" y="170" width="120" height="35" rx="8" fill="#f9a826"/>
  <text x="620" y="192" text-anchor="middle" fill="white" font-size="11">ML Feature Store</text>
  <rect x="560" y="220" width="120" height="35" rx="8" fill="#f9a826"/>
  <text x="620" y="242" text-anchor="middle" fill="white" font-size="11">Model Serving (TF)</text>
  <rect x="560" y="270" width="120" height="35" rx="8" fill="#00d2a8"/>
  <text x="620" y="292" text-anchor="middle" fill="white" font-size="11">Haystack (photo)</text>
  <rect x="560" y="320" width="120" height="35" rx="8" fill="#00d2a8"/>
  <text x="620" y="342" text-anchor="middle" fill="white" font-size="11">Kafka / Scribe</text>

  <line x1="100" y1="220" x2="130" y2="220" stroke="#5a5a72"/>
  <line x1="230" y1="220" x2="260" y2="220" stroke="#5a5a72"/>
  <line x1="360" y1="220" x2="400" y2="38" stroke="#5a5a72"/>
  <line x1="360" y1="220" x2="400" y2="88" stroke="#5a5a72"/>
  <line x1="360" y1="220" x2="400" y2="138" stroke="#5a5a72"/>
  <line x1="360" y1="220" x2="400" y2="188" stroke="#5a5a72"/>
  <line x1="360" y1="220" x2="400" y2="238" stroke="#5a5a72"/>
</svg>
<div class="diagram-caption">Facebook architecture (đơn giản hoá từ thực tế hàng ngàn service)</div>
</div>

<h2>🕸️ Bước 4: Social Graph - TAO</h2>

<p>Facebook tự build <strong>TAO</strong> (The Associations and Objects) - graph DB phân tán built on MySQL + Memcache.</p>

<h3>Data model</h3>
<pre><code>Objects:    user, post, photo, comment, page, group...
Each object: id (64-bit), type, version, time, data (blob)

Associations: edges between objects
  Examples:
    user --friend--&gt; user
    user --likes----&gt; post
    user --comments-&gt; post
    user --tagged_in--&gt; photo
    user --member_of--&gt; group

Each assoc: id1, atype, id2, time, data</code></pre>

<h3>Query patterns</h3>
<pre><code>// Friend list of user 5
assoc_get(5, "friend", limit=200)

// Who liked post 100?
assoc_get(100, "liked_by", limit=50)

// Photos user X tagged in
assoc_get(X, "tagged_in")</code></pre>

<h3>Storage layer</h3>
<ul>
<li>Master MySQL shard theo <code>id1 % N</code>.</li>
<li>Read replica trong cùng region.</li>
<li>TAO cache (in-memory) - 99% read hit Memcache.</li>
<li>Write: write to master → invalidate cache → async replicate.</li>
</ul>

<h2>🎯 Bước 5: Newsfeed Ranking Pipeline</h2>

<h3>4 Stage Pipeline</h3>

<pre><code>┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  Inventory   │ → │   Filter      │ → │   Scoring    │ → │   Ranking    │
│  10000 posts │    │   3000        │    │   ML model   │    │   Top 30     │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘</code></pre>

<h3>Stage 1: Inventory</h3>
<p>Tìm tất cả "candidate posts" - tweet user MIGHT see:</p>
<ul>
<li>Post của bạn bè (close friend ưu tiên).</li>
<li>Post của page user follow.</li>
<li>Post của group user là member.</li>
<li>Post được bạn bè comment / react (viral).</li>
<li>Recommended (suggested page, friend of friend).</li>
<li>Time range: 7 ngày qua (older posts low priority).</li>
</ul>

<h3>Stage 2: Filter</h3>
<ul>
<li>Privacy: post có visible với user này không.</li>
<li>Blocked, muted, hidden.</li>
<li>Đã xem (dedupe).</li>
<li>Đã hide/snooze.</li>
<li>Spam, low quality.</li>
</ul>

<h3>Stage 3: Scoring (ML)</h3>
<p>Đây là <strong>tim</strong> của Facebook. Mỗi post predicted 4 probability:</p>
<pre><code>score = (
  w1 * P(like)       +
  w2 * P(comment)    +
  w3 * P(share)      +
  w4 * P(watch_video) +
  w5 * P(click_link) -
  w6 * P(hide)       -    // negative signal
  w7 * P(report)
) * time_decay(post_age)</code></pre>

<p>Mỗi probability từ một <strong>deep neural network</strong>:</p>
<ul>
<li>Input features (~hundreds): user features, post features, social features, context.</li>
<li>Model: multi-task learning - 1 model predict nhiều output.</li>
<li>Trained on petabytes data, retrain mỗi vài giờ.</li>
</ul>

<h3>Features ví dụ</h3>
<table>
<tr><th>Category</th><th>Features</th></tr>
<tr><td>User</td><td>age, gender, location, language, device, history engagement</td></tr>
<tr><td>Post</td><td>content type (photo/video/text), word count, has_link, hashtag</td></tr>
<tr><td>Author</td><td>follower count, post frequency, prev engagement rate</td></tr>
<tr><td>Affinity</td><td>user-author interaction count last 30 days, common groups</td></tr>
<tr><td>Engagement velocity</td><td>likes per hour, comment count, share count</td></tr>
<tr><td>Context</td><td>time of day, day of week, recent session activity</td></tr>
</table>

<h3>Stage 4: Diversity & Re-ranking</h3>
<ul>
<li>Không show 5 post liên tiếp của cùng 1 người.</li>
<li>Không show 5 video liên tiếp.</li>
<li>Mix với ads (1 ad mỗi 4-5 post).</li>
<li>Inject "suggested" content (page recommendation).</li>
</ul>

<h2>⚡ Bước 6: Feed Generation Strategy</h2>

<p>Vấn đề: ranking ML expensive (~100ms cho 1000 candidates). Mỗi user 5 view/ngày × 2B = 10B ranking computations.</p>

<h3>Approach: Pre-compute + On-demand</h3>

<pre><code>// Pre-compute (offline)
Mỗi 30 phút, batch job:
  Cho mỗi active user:
    Tính top 500 candidates
    Run lightweight scoring
    Cache vào "Feed Store" (Redis-like)

// On-demand (online)
User vào feed:
  1. Lấy 500 pre-computed candidates từ Feed Store
  2. Real-time re-rank top 30 (full ML model)
  3. Mix ads + diversity
  4. Return 10 posts (load more khi scroll)</code></pre>

<p>Trade-off: pre-compute tốn storage, real-time tốn CPU. Hybrid balance.</p>

<h2>📸 Bước 7: Photo Storage - Haystack</h2>

<p>Facebook có 250+ tỷ ảnh, mỗi ảnh 4-5 size (thumbnail, small, medium, large, original). Total 1.25 trillion files.</p>

<h3>Vấn đề với filesystem thường</h3>
<ul>
<li>Mỗi ảnh = 1 file → trillion inode → metadata khổng lồ.</li>
<li>Mỗi lookup = 3 disk I/O (directory, inode, data).</li>
<li>Backup, replication không feasible.</li>
</ul>

<h3>Haystack design</h3>
<pre><code>// Concept: gom nhiều ảnh vào 1 file lớn
Haystack store file: 100 GB chứa ~1M ảnh

Layout:
[Header][Photo1][Photo2][Photo3]...[PhotoN][Index]

Mỗi photo:
  - id, key, alt_key, size, data, checksum

In-memory index per store file:
  Map: photo_id → offset trong file

Lookup:
  1. Photo ID → which store file (Directory)
  2. In-memory index → offset
  3. Single seek + read</code></pre>

<h3>Layers</h3>
<table>
<tr><th>Layer</th><th>Role</th></tr>
<tr><td>Haystack Cache</td><td>Hot photos in memory</td></tr>
<tr><td>Haystack Store</td><td>Disk storage, append-only</td></tr>
<tr><td>Haystack Directory</td><td>Photo → store machine mapping</td></tr>
<tr><td>CDN (edge)</td><td>Cache for end users</td></tr>
</table>

<h3>Write flow</h3>
<pre><code>1. User uploads photo via Web Tier
2. Web tier → Haystack Directory: assign logical volume
3. Upload to 3 replica stores (different racks)
4. Update Directory: photo_id → (volume_id, offset)
5. Return URL: https://photo.fbcdn.net/{volume}/{photoId}</code></pre>

<h3>Read flow</h3>
<pre><code>1. CDN edge first (hit rate ~99%)
2. CDN miss → Haystack Cache
3. Cache miss → Directory → Haystack Store
4. Single disk seek → return bytes</code></pre>

<h2>💬 Bước 8: Comment System</h2>

<p>1 viral post có 1M+ comment. Cần:</p>
<ul>
<li>Pagination (cursor-based).</li>
<li>Threading (reply to comment).</li>
<li>Top comments (rank by engagement, not time).</li>
</ul>

<h3>Schema</h3>
<pre><code>CREATE TABLE comments (
  id BIGINT PRIMARY KEY,            -- Snowflake
  post_id BIGINT,                    -- partition key
  user_id BIGINT,
  parent_comment_id BIGINT,          -- threading
  content TEXT,
  like_count INT,
  reply_count INT,
  created_at TIMESTAMP
) PARTITION BY HASH(post_id);

INDEX (post_id, created_at DESC);   -- newest first
INDEX (post_id, like_count DESC);   -- top comments</code></pre>

<h3>API</h3>
<pre><code>GET /posts/{postId}/comments?cursor=xxx&sort=top&limit=20

Response:
{
  "comments": [...],
  "next_cursor": "yyy"
}</code></pre>

<h2>🔔 Bước 9: Notification</h2>

<p>1 celebrity post → 10K reactions trong 1 phút → 10K notification cho author?</p>

<h3>Aggregation</h3>
<p>Gộp nhiều event: "John, Mary và 998 người khác đã thích bài viết của bạn."</p>

<pre><code>// Naive: 1 notification per event (spam)
// Smart: aggregate

Notification table:
  user_id, type, target_id, actor_count, last_actor, updated_at

ON event "like" arrives:
  UPSERT notification WHERE user_id=author AND type='like' AND target_id=postId
    INCR actor_count
    SET last_actor = newLiker
    SET updated_at = NOW()</code></pre>

<h3>Delivery channels</h3>
<ul>
<li>In-app: WebSocket / SSE - realtime.</li>
<li>Push: FCM/APNs - khi app closed.</li>
<li>Email digest: nếu user không seen sau 24h.</li>
</ul>

<h2>🧪 Bước 10: A/B Testing & Gradual Rollout</h2>

<p>Facebook chạy ~10K experiment cùng lúc. Mỗi user trong nhiều experiment.</p>

<pre><code>// Experiment assignment (deterministic)
function getVariant(userId, experimentId) {
  const hash = hashFunction(userId + experimentId);
  return hash % 100 < experiment.percentage ? 'treatment' : 'control';
}

// Metrics
metric track:
  - DAU/MAU
  - Session length
  - Engagement (like, comment, share rate)
  - Revenue (ad revenue per user)
  - Negative (hide, report rate)

Statistical significance test → ship hay không</code></pre>

<h2>🌍 Bước 11: Multi-Region & Replication</h2>

<ul>
<li>Active-Active: nhiều region cùng phục vụ.</li>
<li>User pinned to home region (data locality).</li>
<li>Cross-region replication: async via Wormhole (Facebook's CDC).</li>
<li>Conflict resolution: last-write-wins cho non-critical (likes), versioned vector clocks cho critical.</li>
</ul>

<h2>🧠 Bước 12: Follow-up Questions</h2>

<h3>Q1: Privacy - "Only friends of friends"?</h3>
<p>Tốn kém. Pre-compute set "friends of friends" mỗi 24h cho mỗi user → cache. Khi check visibility: O(1) set lookup.</p>

<h3>Q2: Block user X - mọi nơi không thấy nhau?</h3>
<p>Block list cached per user. Filter ở 3 chỗ: feed, search, profile. Khi A block B, B vẫn không biết.</p>

<h3>Q3: GraphQL cho mobile API?</h3>
<p>Facebook tạo ra GraphQL chính vì mobile bandwidth issue. 1 query → đủ data cho cả screen, thay vì N REST call.</p>

<h3>Q4: Memcache invalidation strategy?</h3>
<p>Facebook dùng <strong>McSqueal</strong>: parse MySQL binlog → publish invalidation event qua Wormhole → tất cả Memcache cluster invalidate.</p>

<h3>Q5: Feed personalization vs filter bubble?</h3>
<p>Inject diversity: random "suggested" content, content từ ngoài bubble. Cân bằng engagement và editorial diversity.</p>

<h3>Q6: Edge cases content moderation?</h3>
<ul>
<li>Pre-publish: AI classifier (image, text) phát hiện NSFW, hate speech.</li>
<li>Post-publish: user report → human reviewer queue.</li>
<li>High-risk: livestream killer cases → real-time AI + immediate takedown.</li>
</ul>

<h3>Q7: Ad insertion - không slow feed?</h3>
<p>Ad service riêng, ad auction trên separate path. Ad fetched parallel với feed. Inject ở client sau khi nhận cả 2.</p>

<h3>Q8: Stories (24h expire)?</h3>
<p>TTL trong storage (DynamoDB-like). Materialized view: <code>active_stories</code> per user, sort by time. Cron xoá expired.</p>

<h2>🎤 Senior Pitch</h2>
<div class="callout fun">
<div class="callout-title">🚀 Pitch 3 phút</div>
<p>"Tôi design FB Newsfeed với <strong>4-stage ranking pipeline</strong>: Inventory (10K candidates) → Filter (3K) → ML Scoring (multi-task DNN predicting engagement probabilities) → Diversity rerank. <strong>Social graph</strong> dùng custom TAO (MySQL + Memcache, 99% cache hit). <strong>Photo</strong> qua Haystack - append-only blob store + CDN. <strong>Feed</strong> pre-computed mỗi 30 phút, real-time re-rank top 30 khi user load. <strong>Comments</strong> sharded by post_id với top-rank index. <strong>Multi-region</strong> active-active, async replication via Wormhole. <strong>Memcache</strong> invalidation qua MySQL binlog parsing. Ranking model retrain mỗi vài giờ."</p>
</div>

<h2>📚 Key insights khác Twitter</h2>
<ul>
<li><strong>ML-driven feed</strong> phức tạp hơn nhiều chronological - cần feature store, model serving, A/B platform.</li>
<li><strong>Graph DB tự custom (TAO)</strong> - SQL không đủ, generic graph DB chậm. Haystack tương tự cho photos.</li>
<li><strong>Privacy là first-class</strong> - mọi query phải qua privacy check.</li>
<li><strong>Diversity vs Engagement</strong> - tension giữa metric và experience.</li>
<li><strong>Memcache khổng lồ</strong> (~petabyte) là backbone giảm tải MySQL.</li>
</ul>
`
});
