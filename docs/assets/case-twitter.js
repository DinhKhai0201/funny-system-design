/* =========================================================
 * CHƯƠNG 25: TWITTER/X - DEEP DIVE
 * Capacity, fan-out strategy, timeline, search, trends
 * ========================================================= */

window.CHAPTERS = window.CHAPTERS || [];

window.CHAPTERS.push({
  group: "🎯 Phần 4: Case Study huyền thoại",
  icon: "🐦",
  title: "Chương 25: Twitter/X - Newsfeed cho 500M users (Deep Dive)",
  content: `
<h1>Chương 25: Twitter / X</h1>
<p class="subtitle">Bài toán fan-out kinh điển - 6000 tweet/giây, 500M user 🐦</p>

<h2>📋 Bước 1: Requirements</h2>

<h3>Functional</h3>
<ul>
<li>Post tweet (280 ký tự, text + media).</li>
<li>Follow / unfollow user.</li>
<li>Home timeline - tweet của người mình follow, theo thời gian.</li>
<li>User timeline - tweet của 1 user cụ thể.</li>
<li>Search (tweet, hashtag, user).</li>
<li>Like, retweet, reply.</li>
<li>Notification (mention, like, follow).</li>
<li>Trending topics theo geo.</li>
</ul>

<h3>Non-functional</h3>
<ul>
<li>Read-heavy: Read:Write = 1000:1 (timeline xem nhiều hơn post).</li>
<li>Home timeline latency P99 < 200ms.</li>
<li>Tweet visible với follower trong vài giây.</li>
<li>Eventual consistency OK cho like count.</li>
</ul>

<h2>📊 Bước 2: Capacity Estimation</h2>

<pre><code>500M user, 200M DAU
50% DAU post → 100M post/day = ~1150 tweet/s avg
Peak = 3x = 3500 tweet/s
Read = 1000x = 3.5M timeline view/s peak

Storage tweet:
- Tweet: 280 char × 4 byte (UTF-8) + metadata ≈ 1.5 KB
- 100M × 1.5KB × 365 × 5 = 270 TB cho 5 năm
- Media (image/video): 1MB avg × 30M media/day = 30TB/day → 55 PB/5 năm

Storage timeline cache:
- Mỗi user: 800 tweet ID gần nhất × 8 byte = 6.4 KB
- 200M DAU × 6.4 KB = 1.3 TB RAM</code></pre>

<h2>🏗️ Bước 3: High-Level Architecture</h2>

<div class="diagram">
<svg viewBox="0 0 760 380" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="170" width="80" height="40" rx="8" fill="#ff5e7a"/>
  <text x="60" y="195" text-anchor="middle" fill="white" font-size="11">Client</text>

  <rect x="140" y="170" width="100" height="40" rx="8" fill="#6c5ce7"/>
  <text x="190" y="195" text-anchor="middle" fill="white" font-size="11">API Gateway</text>

  <rect x="280" y="40" width="120" height="35" rx="8" fill="#6c5ce7"/>
  <text x="340" y="62" text-anchor="middle" fill="white" font-size="11">Tweet Service</text>
  <rect x="280" y="100" width="120" height="35" rx="8" fill="#6c5ce7"/>
  <text x="340" y="122" text-anchor="middle" fill="white" font-size="11">Timeline Service</text>
  <rect x="280" y="160" width="120" height="35" rx="8" fill="#6c5ce7"/>
  <text x="340" y="182" text-anchor="middle" fill="white" font-size="11">User Service</text>
  <rect x="280" y="220" width="120" height="35" rx="8" fill="#6c5ce7"/>
  <text x="340" y="242" text-anchor="middle" fill="white" font-size="11">Search Service</text>
  <rect x="280" y="280" width="120" height="35" rx="8" fill="#6c5ce7"/>
  <text x="340" y="302" text-anchor="middle" fill="white" font-size="11">Notification Service</text>

  <rect x="440" y="20" width="120" height="35" rx="8" fill="#f9a826"/>
  <text x="500" y="42" text-anchor="middle" fill="white" font-size="11">Fan-out Worker</text>

  <rect x="440" y="80" width="120" height="35" rx="8" fill="#f9a826"/>
  <text x="500" y="102" text-anchor="middle" fill="white" font-size="11">Redis Timeline</text>

  <rect x="600" y="20" width="120" height="35" rx="8" fill="#00d2a8"/>
  <text x="660" y="42" text-anchor="middle" fill="white" font-size="11">Tweet DB (shard)</text>
  <rect x="600" y="80" width="120" height="35" rx="8" fill="#00d2a8"/>
  <text x="660" y="102" text-anchor="middle" fill="white" font-size="11">Social Graph DB</text>
  <rect x="600" y="140" width="120" height="35" rx="8" fill="#00d2a8"/>
  <text x="660" y="162" text-anchor="middle" fill="white" font-size="11">Media Store (S3)</text>
  <rect x="600" y="200" width="120" height="35" rx="8" fill="#00d2a8"/>
  <text x="660" y="222" text-anchor="middle" fill="white" font-size="11">Elasticsearch</text>
  <rect x="600" y="260" width="120" height="35" rx="8" fill="#00d2a8"/>
  <text x="660" y="282" text-anchor="middle" fill="white" font-size="11">Kafka (events)</text>

  <line x1="100" y1="190" x2="140" y2="190" stroke="#5a5a72"/>
  <line x1="240" y1="190" x2="280" y2="58" stroke="#5a5a72"/>
  <line x1="240" y1="190" x2="280" y2="118" stroke="#5a5a72"/>
  <line x1="240" y1="190" x2="280" y2="178" stroke="#5a5a72"/>
  <line x1="240" y1="190" x2="280" y2="238" stroke="#5a5a72"/>
  <line x1="240" y1="190" x2="280" y2="298" stroke="#5a5a72"/>
  <line x1="400" y1="58" x2="440" y2="38" stroke="#5a5a72"/>
  <line x1="400" y1="118" x2="440" y2="98" stroke="#5a5a72"/>
  <line x1="560" y1="38" x2="600" y2="38" stroke="#5a5a72"/>
  <line x1="560" y1="98" x2="600" y2="98" stroke="#5a5a72"/>
</svg>
<div class="diagram-caption">Twitter architecture - microservices với fan-out worker</div>
</div>

<h2>💾 Bước 4: Database Schema</h2>

<h3>Tweet (sharded theo tweet_id - Snowflake)</h3>
<pre><code>CREATE TABLE tweets (
  id BIGINT PRIMARY KEY,        -- Snowflake ID (time-sorted)
  user_id BIGINT NOT NULL,
  content VARCHAR(280),
  media_url TEXT,
  parent_tweet_id BIGINT,       -- reply / retweet
  created_at TIMESTAMP,
  like_count INT DEFAULT 0,
  retweet_count INT DEFAULT 0,
  reply_count INT DEFAULT 0
);

-- Shard by tweet_id (Snowflake = time-ordered → spread evenly)
-- Hoặc shard by user_id nếu hay query "tweets của user X"</code></pre>

<h3>Social graph - relationships</h3>
<pre><code>CREATE TABLE follows (
  follower_id BIGINT,
  followee_id BIGINT,
  created_at TIMESTAMP,
  PRIMARY KEY (follower_id, followee_id)
);

CREATE INDEX idx_followee ON follows(followee_id);
-- Query "ai follow tôi" và "tôi follow ai" đều fast</code></pre>

<h3>Likes (high write volume)</h3>
<pre><code>-- Cassandra/Redis tốt hơn SQL ở đây
CREATE TABLE likes (
  tweet_id BIGINT,
  user_id BIGINT,
  created_at TIMESTAMP,
  PRIMARY KEY (tweet_id, user_id)
);

-- Aggregate count cache trong Redis
INCR tweet:like_count:{tweet_id}</code></pre>

<h2>📰 Bước 5: Vấn đề lớn - Timeline Generation</h2>

<p>Đây là <strong>core challenge</strong>. Có 3 approach:</p>

<h3>Approach 1: Pull / Fan-out on Read</h3>
<pre><code>// Khi user A vào timeline
function getTimeline(userId) {
  const followees = follows.where({follower_id: userId});  // 1000 người
  const tweets = tweets
    .where({user_id: IN followees})
    .orderBy('created_at DESC')
    .limit(50);
  return tweets;
}</code></pre>

<p><strong>Phân tích:</strong></p>
<ul>
<li>✅ Đơn giản, không cần storage extra.</li>
<li>✅ Tweet xoá → biến mất ngay.</li>
<li>❌ Chậm: query qua 1000 user mỗi lần refresh.</li>
<li>❌ Read traffic 3.5M/s → DB không gánh nổi.</li>
</ul>

<h3>Approach 2: Push / Fan-out on Write ⭐</h3>
<pre><code>// Khi A post tweet
function onTweet(tweet) {
  saveTweet(tweet);
  const followers = follows.where({followee_id: tweet.user_id});

  for (const f of followers) {
    redis.lpush(\`timeline:\${f}\`, tweet.id);
    redis.ltrim(\`timeline:\${f}\`, 0, 799);   // keep 800
  }
}

// Đọc timeline cực nhanh
function getTimeline(userId) {
  const ids = redis.lrange(\`timeline:\${userId}\`, 0, 49);
  return tweets.where({id: IN ids});
}</code></pre>

<p><strong>Phân tích:</strong></p>
<ul>
<li>✅ Read O(1) - chỉ đọc Redis.</li>
<li>❌ <strong>Celebrity problem</strong>: Elon Musk có 150M follower → mỗi tweet cần ghi 150M Redis entries.</li>
<li>❌ Nếu A có 10M follower và post 100 tweet/ngày → 1 tỷ ghi/ngày chỉ riêng A.</li>
<li>❌ Inactive user vẫn tốn storage timeline.</li>
</ul>

<h3>Approach 3: Hybrid (Twitter thực tế) ⭐⭐⭐</h3>
<p>Phân loại user:</p>
<ul>
<li><strong>Regular user</strong> (&lt; 10K follower): Push - fan-out khi post.</li>
<li><strong>Celebrity</strong> (&gt; 10K follower): Pull - không fan-out, follower phải query khi xem timeline.</li>
</ul>

<pre><code>function getHomeTimeline(userId) {
  // 1. Tweet từ regular followees (đã push vào Redis)
  const pushedTweets = redis.lrange(\`timeline:\${userId}\`, 0, 200);

  // 2. Tweet từ celebrity (pull on read)
  const celebrities = follows
    .where({follower_id: userId})
    .join(users.where({follower_count: '>', 10000}));

  const celebTweets = tweets
    .where({user_id: IN celebrities, created_at: '>', lastSeen})
    .limit(200);

  // 3. Merge + sort by time + rank
  return merge(pushedTweets, celebTweets)
    .sortBy('created_at DESC')
    .limit(50);
}</code></pre>

<h3>Phân tích Hybrid</h3>
<table>
<tr><th>User type</th><th>Strategy</th><th>Lý do</th></tr>
<tr><td>Regular (push)</td><td>Fan-out khi post</td><td>Ít follower, write rẻ, read nhanh</td></tr>
<tr><td>Celebrity (pull)</td><td>Query khi đọc timeline</td><td>Follower quá nhiều, push tốn kém</td></tr>
<tr><td>Active follower</td><td>Có cache</td><td>Đọc nhiều, cache hợp lý</td></tr>
<tr><td>Inactive follower</td><td>Lazy load</td><td>Tiết kiệm storage</td></tr>
</table>

<h2>🌀 Bước 6: Fan-out Worker chi tiết</h2>

<pre><code>// 1. User A post tweet → Tweet Service
POST /tweets { content: "Hi" }
  ↓
2. Tweet Service:
   - Generate tweet_id (Snowflake)
   - INSERT vào Tweet DB
   - Publish event "tweet.created" → Kafka
  ↓
3. Fan-out Worker (consumer Kafka):
   - Lấy follower list (cache friendly)
   - Nếu A là celebrity (>10K follower) → skip
   - Phân chunk 1000 follower / batch
   - For each chunk:
     PIPELINE Redis:
       LPUSH timeline:f1 tweet_id
       LTRIM timeline:f1 0 799
       LPUSH timeline:f2 ...
     EXEC
  ↓
4. Inactive user filter:
   - Nếu follower không login 30 ngày → skip
   - Giảm 50% write</code></pre>

<h2>🔥 Bước 7: Trending Topics</h2>

<p>Twitter trending: hashtag nào hot trong 5 phút qua, theo region.</p>

<h3>Naive approach</h3>
<pre><code>-- Quá chậm với hàng tỷ tweet
SELECT hashtag, COUNT(*) FROM tweets
WHERE created_at > NOW() - INTERVAL 5 MIN
GROUP BY hashtag
ORDER BY count DESC LIMIT 10;</code></pre>

<h3>Stream processing approach ⭐</h3>
<pre><code>Tweet → Kafka → Flink/Spark Streaming
  ↓
Extract hashtags from each tweet
  ↓
Tumbling window 5 min, group by (hashtag, region)
  ↓
Count using Count-Min Sketch (probabilistic, low memory)
  ↓
Top-K via min-heap (size 100)
  ↓
Write to Redis Sorted Set:
  ZADD trending:US 9854 "#worldcup"
  ZADD trending:VN 3210 "#sea_games"

API: ZREVRANGE trending:US 0 9 WITHSCORES → top 10</code></pre>

<h3>Count-Min Sketch là gì?</h3>
<p>Khi có hàng triệu hashtag, lưu count chính xác từng cái tốn RAM. Count-Min Sketch dùng hash để approximate count, sai số nhỏ, RAM ít.</p>

<h2>🔍 Bước 8: Search</h2>

<p>Search tweet: full-text + filter time + filter user. SQL không kham nổi.</p>

<pre><code>// Pipeline indexing
Tweet POST → Kafka → Indexer → Elasticsearch

// ES mapping
PUT /tweets/_mapping
{
  "properties": {
    "user_id": { "type": "keyword" },
    "content": { "type": "text", "analyzer": "twitter_analyzer" },
    "hashtags": { "type": "keyword" },
    "created_at": { "type": "date" },
    "location": { "type": "geo_point" }
  }
}

// Search query
GET /tweets/_search
{
  "query": {
    "bool": {
      "must": { "match": { "content": "election" } },
      "filter": [
        { "range": { "created_at": { "gte": "now-1d" } } },
        { "term": { "hashtags": "vote2024" } }
      ]
    }
  },
  "sort": [{ "created_at": "desc" }]
}</code></pre>

<h2>📸 Bước 9: Media Upload</h2>

<pre><code>1. Client xin pre-signed URL
   POST /media/upload-url → { url: s3_presigned, mediaId }
2. Client PUT file thẳng lên S3 (không qua server)
3. S3 trigger Lambda:
   - Validate, scan virus
   - Generate thumbnail, variants (1080p, 720p, 480p video)
   - Update mediaId.status = "ready"
4. Client POST tweet kèm mediaId
5. Tweet rendering: lấy URL từ S3 + CDN
   https://cdn.twitter.com/media/{mediaId}/720p.jpg</code></pre>

<h2>💬 Bước 10: Like / Retweet (write-heavy)</h2>

<p>1 tweet viral có 10M like trong 1 giờ → 2780 like/s vào 1 row. Nguy hiểm!</p>

<h3>Counter pattern</h3>
<pre><code>// ❌ SAI - lock contention
UPDATE tweets SET like_count = like_count + 1 WHERE id = ?;

// ✅ Đúng - dùng Redis atomic INCR
INCR tweet:likes:{tweetId}
SADD tweet:liked_by:{tweetId} {userId}     -- track unique
ZADD user:liked_tweets:{userId} {ts} {tweetId}

// Async: sync về DB mỗi 30s (eventually consistent)</code></pre>

<h2>📈 Bước 11: Scaling Numbers</h2>

<table>
<tr><th>Component</th><th>Strategy</th><th>Size</th></tr>
<tr><td>Tweet DB</td><td>Sharded MySQL by tweet_id</td><td>1000+ shards</td></tr>
<tr><td>Social Graph</td><td>FlockDB (Twitter custom) hoặc dgraph</td><td>500 servers</td></tr>
<tr><td>Timeline Cache</td><td>Redis cluster</td><td>~2 TB RAM</td></tr>
<tr><td>Media</td><td>S3 + CDN (CloudFront)</td><td>50+ PB</td></tr>
<tr><td>Search</td><td>Elasticsearch cluster</td><td>100+ nodes</td></tr>
<tr><td>Streaming</td><td>Kafka + Flink</td><td>8T messages/day</td></tr>
</table>

<h2>🧠 Bước 12: Follow-up Questions thường gặp</h2>

<h3>Q1: Làm sao tránh duplicate tweet nếu network retry?</h3>
<p>Client gen idempotency key (UUID). Server check Redis SET NX 5 phút.</p>

<h3>Q2: Reply / thread structure?</h3>
<p>Tweet có <code>parent_tweet_id</code>. Build conversation tree với recursive query (limit depth) hoặc materialized path.</p>

<h3>Q3: Mention @user?</h3>
<p>Khi post, parse mention. Publish event "user.mentioned" → Notification Service ghi notification + push.</p>

<h3>Q4: Read receipt cho DM?</h3>
<p>Tương tự WhatsApp - WebSocket bi-directional, mỗi message có status sent/delivered/read.</p>

<h3>Q5: Spam / bot detection?</h3>
<ul>
<li>Rule-based: post quá nhanh, có link đáng nghi.</li>
<li>ML model: nội dung, tần suất, network pattern.</li>
<li>Captcha khi tạo account, signal: device fingerprint, IP reputation.</li>
</ul>

<h3>Q6: GDPR - user xoá account?</h3>
<p>Soft delete + async cron xoá vĩnh viễn. Anonymize tweet content. Notify downstream services qua Kafka.</p>

<h3>Q7: Real-time tweet update (như mũi tên "X new tweets")?</h3>
<p>Server-Sent Events từ Timeline Service. Hoặc WebSocket. Long polling fallback cho client cũ.</p>

<h3>Q8: Tweet edit?</h3>
<p>Lưu version: <code>tweets_history(tweet_id, version, content, edited_at)</code>. Display "edited" badge. Limit thời gian edit 30 phút.</p>

<h2>🎤 Tổng kết Senior Pitch</h2>
<div class="callout fun">
<div class="callout-title">🚀 Pitch 3 phút</div>
<p>"Tôi sẽ design Twitter với <strong>hybrid fan-out</strong>: regular user dùng push (fan-out on write vào Redis timeline cache), celebrity dùng pull. Tweet ID dùng <strong>Snowflake</strong> để time-sortable và shard-friendly. Tweet DB sharded by tweet_id (hoặc user_id nếu cần query user timeline). <strong>Social graph</strong> dùng graph DB (FlockDB). <strong>Search</strong> qua Elasticsearch index từ Kafka stream. <strong>Trending</strong> dùng Flink + Count-Min Sketch trên Kafka. <strong>Like</strong> dùng Redis atomic counter, async flush. <strong>Media</strong> upload trực tiếp S3 pre-signed URL. Total cost ước $1M/tháng cho 200M DAU."</p>
</div>

<h2>📚 Key insights</h2>
<ul>
<li><strong>Read:Write ratio quyết định kiến trúc</strong>: read-heavy → push model + cache.</li>
<li><strong>Celebrity problem là kinh điển</strong>: hybrid là answer chuẩn.</li>
<li><strong>Eventually consistent</strong> chấp nhận được cho social - không phải bank.</li>
<li><strong>Snowflake ID</strong> là vũ khí mọi system phân tán nên có.</li>
<li><strong>Stream processing</strong> (Kafka + Flink) là backbone cho trending, analytics, ML features.</li>
</ul>
`
});
