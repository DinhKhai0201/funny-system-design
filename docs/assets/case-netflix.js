/* =========================================================
 * CHƯƠNG 27: NETFLIX - DEEP DIVE
 * Video pipeline, CDN (Open Connect), recommendation, ABR
 * ========================================================= */

window.CHAPTERS = window.CHAPTERS || [];

window.CHAPTERS.push({
  group: "🎯 Phần 4: Case Study huyền thoại",
  icon: "🎬",
  title: "Chương 27: Netflix - Streaming toàn cầu (Deep Dive)",
  content: `
<h1>Chương 27: Netflix</h1>
<p class="subtitle">Phục vụ 230M user xem 4K mượt - phép thuật engineering 🎬</p>

<h2>📋 Bước 1: Requirements</h2>

<h3>Functional</h3>
<ul>
<li>Browse catalog (movies, series, originals).</li>
<li>Search.</li>
<li>Stream video chất lượng adaptive (144p → 4K Dolby Vision).</li>
<li>Multi-device (TV, mobile, laptop, console).</li>
<li>Personalized recommendation, "Continue watching".</li>
<li>Profiles trong 1 account, parental control.</li>
<li>Subtitles, multiple audio tracks.</li>
<li>Download offline.</li>
</ul>

<h3>Non-functional</h3>
<ul>
<li>230M subscribers, peak 60M concurrent.</li>
<li>Video start &lt; 2s (key UX metric).</li>
<li>0 buffer during playback (rebuffer rate target &lt; 0.5%).</li>
<li>99.99% availability.<ul>
  <li>Chỉ lưu trữ danh mục, recommendation, user profile.</li>
  <li>Không lưu video! Control plane chạy 100% trên AWS.</li>
</ul>

<div class="callout tip">
<div class="callout-title">🤔 Tại sao Data Plane không dùng AWS S3 + CloudFront?</div>
<p>Ban đầu Netflix có dùng! Nhưng khi traffic đạt mức chiếm 15% <strong>toàn bộ băng thông Internet thế giới</strong>, chi phí egress AWS (phí tải data ra ngoài) trở nên quá đắt. Hơn nữa, AWS không thể đặt server bên trong ISP (như Viettel, FPT) được. Bằng cách tự build Open Connect Appliances (OCA) và đặt <strong>ngay trong tủ rack của ISP</strong>, Netflix tiết kiệm hàng tỷ đô la băng thông và mang video sát người dùng nhất có thể.</p>
</div>

<h2>📊 Bước 2: Capacity</h2>

<pre><code>230M subscriber, peak ~30% concurrent = 70M streams
Avg bitrate (mix 720p-4K): 5 Mbps
Total bandwidth: 70M × 5 Mbps = 350 Tbps 🤯
(So sánh: cả internet VN ~25 Tbps)

Storage:
- ~20K titles × avg 1h × multiple encodings (1200 variants)
- 1 title ~10 TB encoded (all variants)
- Total: 200 PB

Daily views: 1 tỷ stream/day, avg 1h watch time = 1 tỷ hours/day

Encoding compute:
- 1 movie 2h → 1000 CPU-hours encode
- Re-encode catalog quarterly với codec mới</code></pre>

<h2>🏗️ Bước 3: Architecture Overview</h2>

<div class="diagram">
<svg viewBox="0 0 780 380" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="170" width="80" height="40" rx="8" fill="#ff5e7a"/>
  <text x="60" y="195" text-anchor="middle" fill="white" font-size="11">Client (TV/App)</text>

  <rect x="130" y="100" width="120" height="35" rx="8" fill="#6c5ce7"/>
  <text x="190" y="122" text-anchor="middle" fill="white" font-size="11">AWS - Control Plane</text>
  <rect x="130" y="240" width="120" height="35" rx="8" fill="#f9a826"/>
  <text x="190" y="262" text-anchor="middle" fill="white" font-size="11">Open Connect (CDN)</text>

  <rect x="290" y="20" width="120" height="35" rx="8" fill="#6c5ce7"/>
  <text x="350" y="42" text-anchor="middle" fill="white" font-size="11">Zuul (API Gateway)</text>
  <rect x="290" y="70" width="120" height="35" rx="8" fill="#6c5ce7"/>
  <text x="350" y="92" text-anchor="middle" fill="white" font-size="11">User Service</text>
  <rect x="290" y="120" width="120" height="35" rx="8" fill="#6c5ce7"/>
  <text x="350" y="142" text-anchor="middle" fill="white" font-size="11">Catalog Service</text>
  <rect x="290" y="170" width="120" height="35" rx="8" fill="#6c5ce7"/>
  <text x="350" y="192" text-anchor="middle" fill="white" font-size="11">Recommendation</text>
  <rect x="290" y="220" width="120" height="35" rx="8" fill="#6c5ce7"/>
  <text x="350" y="242" text-anchor="middle" fill="white" font-size="11">Playback Service</text>
  <rect x="290" y="270" width="120" height="35" rx="8" fill="#6c5ce7"/>
  <text x="350" y="292" text-anchor="middle" fill="white" font-size="11">Billing</text>
  <rect x="290" y="320" width="120" height="35" rx="8" fill="#6c5ce7"/>
  <text x="350" y="342" text-anchor="middle" fill="white" font-size="11">Encoding Pipeline</text>

  <rect x="450" y="20" width="140" height="35" rx="8" fill="#00d2a8"/>
  <text x="520" y="42" text-anchor="middle" fill="white" font-size="11">Cassandra (views)</text>
  <rect x="450" y="70" width="140" height="35" rx="8" fill="#00d2a8"/>
  <text x="520" y="92" text-anchor="middle" fill="white" font-size="11">MySQL (billing)</text>
  <rect x="450" y="120" width="140" height="35" rx="8" fill="#00d2a8"/>
  <text x="520" y="142" text-anchor="middle" fill="white" font-size="11">Elasticsearch</text>
  <rect x="450" y="170" width="140" height="35" rx="8" fill="#00d2a8"/>
  <text x="520" y="192" text-anchor="middle" fill="white" font-size="11">S3 (master files)</text>
  <rect x="450" y="220" width="140" height="35" rx="8" fill="#00d2a8"/>
  <text x="520" y="242" text-anchor="middle" fill="white" font-size="11">EVCache (memcache)</text>
  <rect x="450" y="270" width="140" height="35" rx="8" fill="#00d2a8"/>
  <text x="520" y="292" text-anchor="middle" fill="white" font-size="11">Kafka (events)</text>

  <rect x="620" y="20" width="140" height="35" rx="8" fill="#f9a826"/>
  <text x="690" y="42" text-anchor="middle" fill="white" font-size="11">Spark (ML training)</text>
  <rect x="620" y="70" width="140" height="35" rx="8" fill="#f9a826"/>
  <text x="690" y="92" text-anchor="middle" fill="white" font-size="11">Eureka (discovery)</text>
  <rect x="620" y="120" width="140" height="35" rx="8" fill="#f9a826"/>
  <text x="690" y="142" text-anchor="middle" fill="white" font-size="11">Hystrix (circuit)</text>
  <rect x="620" y="170" width="140" height="35" rx="8" fill="#f9a826"/>
  <text x="690" y="192" text-anchor="middle" fill="white" font-size="11">Atlas (metrics)</text>

  <line x1="100" y1="190" x2="130" y2="115" stroke="#5a5a72"/>
  <line x1="100" y1="190" x2="130" y2="257" stroke="#f9a826" stroke-width="2"/>
  <text x="55" y="280" font-size="9" fill="#f9a826">video data</text>
</svg>
<div class="diagram-caption">Netflix - tách Control plane (AWS) và Data plane (Open Connect CDN)</div>
</div>

<h2>🌐 Bước 4: Open Connect - CDN tự build</h2>

<p>Đây là <strong>khác biệt lớn nhất</strong> của Netflix so với mọi streaming khác.</p>

<h3>Vấn đề</h3>
<p>Nếu dùng generic CDN (Akamai, CloudFront), 350 Tbps × giá CDN = hàng tỷ USD/năm. Không khả thi.</p>

<h3>Giải pháp: Open Connect Appliance (OCA)</h3>
<p>Server custom (chạy FreeBSD) Netflix <strong>tặng miễn phí</strong> cho ISP:</p>
<ul>
<li>Netflix lắp đặt OCA trong datacenter ISP.</li>
<li>Pre-load video phổ biến mỗi đêm (cron 2-6 AM local time).</li>
<li>User của ISP đó stream từ OCA local → tốc độ tối đa, không qua internet quốc tế.</li>
<li>ISP tiết kiệm băng thông quốc tế. Win-win.</li>
</ul>

<h3>Capacity</h3>
<ul>
<li>17,000+ OCA tại 1,000+ địa điểm.</li>
<li>Mỗi OCA: 200-400 TB SSD/HDD, 100-400 Gbps network.</li>
<li>Total CDN capacity: ~200+ Tbps.</li>
</ul>

<h3>OCA tiers</h3>
<table>
<tr><th>Tier</th><th>Position</th><th>Content</th></tr>
<tr><td>Embedded</td><td>Trong ISP network</td><td>Top 10-20% popular titles</td></tr>
<tr><td>IX (Internet Exchange)</td><td>Tại IX point</td><td>Top 30-50% titles</td></tr>
<tr><td>S3 Origin</td><td>AWS</td><td>Toàn bộ catalog</td></tr>
</table>

<h3>Prefetch algorithm</h3>
<p>Mỗi đêm, dựa trên prediction:</p>
<ul>
<li>Lịch sử xem region đó.</li>
<li>Trending hiện tại.</li>
<li>New release.</li>
<li>OCA size & content cũ → quyết định pre-load gì, xoá gì (LFU).</li>
</ul>

<h2>🎥 Bước 5: Video Encoding Pipeline</h2>

<h3>Input</h3>
<p>Studio gửi master file: Apple ProRes 422 HQ, 4K, 60fps - mỗi giờ ~600 GB.</p>

<h3>Pipeline (Reloaded - Netflix's current)</h3>

<pre><code>1. INGEST
   - Receive master file via Aspera
   - Validate: codec, resolution, audio tracks
   - Backup to S3 Glacier

2. CHUNKING
   - Split master into 60-second chunks
   - Parallel encoding by chunk (massive speedup)

3. ENCODING (parallelized on EC2 fleet)
   For each chunk:
     For each output profile (~1200 combinations):
       - Resolution: 144p, 240p, 360p, 480p, 720p, 1080p, 4K, 8K
       - Codec: H.264, H.265 (HEVC), VP9, AV1
       - Bitrate ladder: 235 kbps → 25 Mbps
       - Audio: stereo, 5.1, Atmos
       - HDR: SDR, HDR10, Dolby Vision

4. PER-TITLE OPTIMIZATION
   Netflix breakthrough: bitrate ladder PER MOVIE, không cùng template
   - Cartoon: ít chi tiết → bitrate thấp vẫn đẹp
   - Action: nhiều chi tiết → cần bitrate cao
   - Save 20-30% bandwidth

5. PER-CHUNK OPTIMIZATION (newer)
   - Scene tĩnh: bitrate thấp
   - Scene fast action: bitrate cao
   - Save thêm 10-20%

6. ASSEMBLE
   - Combine chunks → final files
   - Generate manifest (HLS / DASH)
   - Quality verification: PSNR, VMAF score

7. PACKAGING
   - DRM encryption (Widevine, FairPlay, PlayReady)
   - Subtitles in multiple languages
   - Generate thumbnails for preview

8. DISTRIBUTE
   - Upload to S3
   - Distribute to OCAs based on regional popularity</code></pre>

<h3>VMAF - Netflix's quality metric</h3>
<p>Netflix tự build <strong>VMAF</strong> (Video Multi-Method Assessment Fusion): ML model rate video quality như mắt người. Open source, dùng để optimize bitrate.</p>

<h2>📡 Bước 6: Adaptive Bitrate Streaming</h2>

<h3>HLS (HTTP Live Streaming)</h3>

<pre><code>master.m3u8
#EXTM3U
#EXT-X-STREAM-INF:BANDWIDTH=5000000,RESOLUTION=1920x1080
1080p/index.m3u8

#EXT-X-STREAM-INF:BANDWIDTH=2500000,RESOLUTION=1280x720
720p/index.m3u8

#EXT-X-STREAM-INF:BANDWIDTH=1000000,RESOLUTION=854x480
480p/index.m3u8

---
1080p/index.m3u8
#EXTM3U
#EXT-X-TARGETDURATION:6
#EXTINF:6.0,
seg0.ts
#EXTINF:6.0,
seg1.ts
...</code></pre>

<h3>ABR algorithm in client</h3>

<pre><code>function chooseQuality() {
  const bw = estimateBandwidth();    // Moving avg recent throughput
  const buffer = currentBufferSec();
  const networkStable = stdDev(recentBw) / mean(recentBw) < 0.2;

  // Buffer-based: nếu buffer thấp → giảm chất lượng
  if (buffer < 5) return downgrade();
  if (buffer > 30 && networkStable) return upgrade();

  // Throughput-based: chọn quality &lt; 80% bandwidth
  return highestQualityWithBitrate(bw * 0.8);
}</code></pre>

<h3>Netflix's ML-based ABR</h3>
<p>Thay thuật toán heuristic bằng deep RL model: input (network, buffer, device), output (next quality). Train on millions playback session.</p>

<h2>🎯 Bước 7: Recommendation System</h2>

<p>80% Netflix viewing đến từ gợi ý. Đây là core competitive advantage.</p>

<h3>Multi-layered approach</h3>

<h4>Layer 1: Personalized rows</h4>
<p>Trang chủ có ~40 rows, mỗi row personalized:</p>
<ul>
<li>"Continue Watching"</li>
<li>"Because you watched X"</li>
<li>"Top picks for you"</li>
<li>"Trending now"</li>
<li>"New releases"</li>
<li>"Top 10 in your country"</li>
</ul>

<h4>Layer 2: Row selection & ordering</h4>
<p>Mỗi user thấy rows khác nhau, thứ tự khác. ML model predict P(click row) cho mỗi candidate row.</p>

<h4>Layer 3: Title selection in each row</h4>
<p>20 titles candidate → choose top 6 visible.</p>

<h4>Layer 4: Artwork selection</h4>
<p><strong>Mỗi user thấy poster phim khác nhau!</strong></p>
<ul>
<li>10+ artwork variants per title.</li>
<li>Multi-armed bandit chọn variant nào click cao nhất.</li>
<li>Personalized: fan rom-com thấy poster có nam chính, fan action thấy poster có scene đánh nhau.</li>
</ul>

<h3>Algorithms</h3>
<table>
<tr><th>Approach</th><th>Use case</th></tr>
<tr><td>Collaborative Filtering (Matrix Factorization)</td><td>"User giống bạn xem gì"</td></tr>
<tr><td>Content-Based</td><td>Genre, actor, director similarity</td></tr>
<tr><td>Deep Learning (DNN)</td><td>Final ranking, multi-modal features</td></tr>
<tr><td>Reinforcement Learning</td><td>Artwork selection (contextual bandit)</td></tr>
<tr><td>Knowledge Graph</td><td>Relationship between content</td></tr>
</table>

<h3>Cold start problem</h3>
<p>User mới đăng ký, chưa xem gì? Onboarding hỏi 3-5 titles user thích → kickstart vector embedding.</p>

<h2>▶️ Bước 8: Playback Flow</h2>

<pre><code>1. User clicks "Play" on title X
2. Client → Playback Service (Zuul Gateway)
3. Playback Service:
   - Check entitlement (subscription active, region allowed)
   - Generate license token (DRM)
   - Find optimal OCA: query Open Connect Routing
     Input: user's network info, ISP, geolocation
     Output: list of OCA URLs ranked by proximity
   - Return: { manifestUrl, licenseUrl, ocaUrls }

4. Client requests manifest.m3u8 from OCA
5. OCA returns manifest with chunk URLs
6. Client downloads chunks, starts decoding
7. Player applies ABR algorithm
8. Every 30s: client reports metrics (rebuffer, quality switches, errors)
9. End of playback: viewing history updated → Cassandra
10. Event published to Kafka for downstream (recommendation refresh, billing)</code></pre>

<h2>🛡️ Bước 9: DRM & Security</h2>

<ul>
<li><strong>3 DRM providers</strong>: Widevine (Chrome/Android), FairPlay (Apple), PlayReady (Microsoft/Xbox).</li>
<li>Video encrypted with AES-128, key encrypted with device key.</li>
<li>License request goes through Netflix's license server.</li>
<li>Output protection: HDCP required for 4K/HDR.</li>
<li>Forensic watermarking: high-value content có watermark vô hình.</li>
</ul>

<h2>📊 Bước 10: Microservices Architecture</h2>

<p>Netflix có 1000+ microservices, mọi service trên AWS. Famous OSS từ Netflix:</p>

<table>
<tr><th>Tool</th><th>Purpose</th></tr>
<tr><td>Zuul</td><td>API Gateway - routing, auth</td></tr>
<tr><td>Eureka</td><td>Service discovery</td></tr>
<tr><td>Hystrix</td><td>Circuit breaker</td></tr>
<tr><td>Ribbon</td><td>Client-side load balancing</td></tr>
<tr><td>Atlas</td><td>Real-time metrics</td></tr>
<tr><td>Chaos Monkey</td><td>Random kill services</td></tr>
<tr><td>Spinnaker</td><td>Deployment pipeline</td></tr>
<tr><td>EVCache</td><td>Memcache wrapper</td></tr>
</table>

<h3>Resilience Patterns</h3>
<pre><code>// Circuit breaker example
@HystrixCommand(
  fallbackMethod = "getDefaultRecommendations",
  commandProperties = {
    @HystrixProperty(name = "execution.isolation.thread.timeoutInMilliseconds", value = "1000"),
    @HystrixProperty(name = "circuitBreaker.errorThresholdPercentage", value = "50")
  }
)
public List&lt;Movie&gt; getRecommendations(String userId) {
  return recommendationService.fetch(userId);
}

public List&lt;Movie&gt; getDefaultRecommendations(String userId) {
  return cached.getOrDefault(userId, popularMovies());   // Graceful degradation
}</code></pre>

<h2>🌪️ Bước 11: Chaos Engineering</h2>

<p>Netflix invented this discipline. Cố tình gây lỗi để test resilience.</p>

<ul>
<li><strong>Chaos Monkey</strong>: random kill EC2 instances trong production.</li>
<li><strong>Chaos Kong</strong>: tắt cả 1 AWS region.</li>
<li><strong>Latency Monkey</strong>: thêm artificial delay vào service calls.</li>
<li><strong>Conformity Monkey</strong>: kill instances không follow best practices.</li>
</ul>

<p>Result: hệ thống quen với failure → multi-region failover hoàn hảo.</p>

<h2>💾 Bước 12: Database Choices</h2>

<table>
<tr><th>Data</th><th>Store</th><th>Why</th></tr>
<tr><td>Viewing history</td><td>Cassandra</td><td>Write-heavy, eventual consistency OK</td></tr>
<tr><td>User account, billing</td><td>MySQL (sharded) + RDS</td><td>ACID needed</td></tr>
<tr><td>Catalog metadata</td><td>Cassandra</td><td>Read-heavy, denormalized</td></tr>
<tr><td>Search index</td><td>Elasticsearch</td><td>Full-text, faceting</td></tr>
<tr><td>Cache</td><td>EVCache (Memcache)</td><td>Hot reads</td></tr>
<tr><td>Session</td><td>Redis</td><td>Fast K-V</td></tr>
<tr><td>Analytics</td><td>S3 → Spark → Druid</td><td>Petabyte scale</td></tr>
<tr><td>Events</td><td>Kafka</td><td>8 trillion/day</td></tr>
</table>

<h2>🧠 Bước 13: Follow-up Questions</h2>

<h3>Q1: Live streaming (sự kiện thể thao)?</h3>
<p>Khác VOD: realtime encoding, low latency, massive simultaneous start (60M cùng vào 1 lúc).</p>
<ul>
<li>Multi-bitrate live encoder cluster.</li>
<li>WebRTC hoặc LL-HLS cho low-latency.</li>
<li>Pre-warm OCA, surge capacity.</li>
<li>Netflix Tudum boxing match (Tyson vs Paul 2024): học bài đắt giá về buffer.</li>
</ul>

<h3>Q2: Offline download?</h3>
<p>Same encoding, encrypted with device-specific key. Track expiry per device. Re-validate license periodically.</p>

<h3>Q3: Multi-profile in 1 account?</h3>
<p>Profile_id trong viewing history, recommendation, "Continue Watching". Profile picker UI tách biệt khỏi auth.</p>

<h3>Q4: Subtitle delivery?</h3>
<p>WebVTT or SRT files, served separately. Multiple languages per title. CDN cached.</p>

<h3>Q5: "Continue Watching" - chính xác ở second?</h3>
<p>Client report position mỗi 30 giây + on pause. Cassandra upsert. Cross-device sync: WebSocket push update.</p>

<h3>Q6: Recommendation update khi user xem xong?</h3>
<p>Event → Kafka. Stream processor update real-time embedding. Next session: fetch latest embedding.</p>

<h3>Q7: Region không có OCA?</h3>
<p>Fallback to AWS CloudFront. Higher latency, higher cost, but works.</p>

<h3>Q8: Catalog availability theo region?</h3>
<p>Rights management table. Mỗi title có map: country → available, contract_expiry. Filter ở Catalog Service.</p>

<h3>Q9: How Netflix saves cost in encoding?</h3>
<ul>
<li>Per-title bitrate ladder (vs fixed ladder).</li>
<li>Per-chunk optimization.</li>
<li>AV1 codec (50% smaller than H.264).</li>
<li>Spot instances for batch encoding (90% cost saving).</li>
</ul>

<h3>Q10: Tracing across 1000 services?</h3>
<p>Mỗi request gắn trace ID, propagate qua mọi service call. Aggregate in Zipkin-like system. Find bottleneck quickly.</p>

<h2>🎤 Senior Pitch</h2>
<div class="callout fun">
<div class="callout-title">🚀 Pitch 3 phút</div>
<p>"Netflix tách <strong>2 plane</strong>: Control plane trên AWS (microservices, billing, recommendation, metadata), Data plane trên <strong>Open Connect</strong> CDN tự build - 17K servers tại 1K ISP locations. Encoding pipeline parallelized trên EC2: chunk video, encode ~1200 variants (codec × resolution × bitrate × HDR) với <strong>per-title</strong> và <strong>per-chunk optimization</strong> (VMAF-driven). Playback: client xin manifest, dùng <strong>ABR algorithm</strong> (Netflix research RL-based) chọn quality. Recommendation: <strong>multi-layer</strong> - row selection, title selection, artwork selection - dùng matrix factorization + deep learning + contextual bandit. Resilience: <strong>Hystrix circuit breaker</strong> + graceful degradation + <strong>Chaos engineering</strong>. Multi-region active-active trên AWS, có thể tắt 1 region không sập."</p>
</div>

<h2>📚 Key insights độc nhất</h2>
<ul>
<li><strong>Open Connect</strong> = competitive moat. Không ai khác làm được scale này.</li>
<li><strong>Per-title encoding</strong> save hàng tỷ USD bandwidth/năm.</li>
<li><strong>Recommendation = retention</strong>. Không phải tính năng phụ, mà là core product.</li>
<li><strong>Chaos engineering</strong> birth right here. Build for failure from day 1.</li>
<li><strong>Streaming là I/O-bound problem</strong>, không phải CPU-bound như web app.</li>
</ul>
`
});
