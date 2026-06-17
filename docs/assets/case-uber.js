/* =========================================================
 * CHƯƠNG 28: UBER - DEEP DIVE
 * Geospatial, matching, surge pricing, ETA, dispatch
 * ========================================================= */

window.CHAPTERS = window.CHAPTERS || [];

window.CHAPTERS.push({
  group: "🎯 Phần 4: Case Study huyền thoại",
  icon: "🚗",
  title: "Chương 28: Uber / Grab - Ride Matching (Deep Dive)",
  content: `
<h1>Chương 28: Uber / Grab</h1>
<p class="subtitle">Match khách & tài xế trong 30 giây với millions of moving objects 🚗</p>

<h2>📋 Bước 1: Requirements</h2>

<h3>Functional</h3>
<ul>
<li>Tài xế bật app, gửi vị trí mỗi 4 giây.</li>
<li>Khách đặt xe → tìm tài xế gần nhất.</li>
<li>Match driver-rider (1-1 hoặc Uber Pool).</li>
<li>Realtime tracking: rider thấy xe đang tới.</li>
<li>ETA accurate (P50, P90).</li>
<li>Dynamic pricing (surge).</li>
<li>Payment, rating, history.</li>
<li>Multiple vehicle types (UberX, Pool, Premium, Eats).</li>
</ul>

<h3>Non-functional</h3>
<ul>
<li>30M trips/day worldwide (~350/s avg, peak 5K/s).</li>
<li>15M active drivers, 100M monthly active riders.</li>
<li>Match latency &lt; 3s.</li>
<li>Location update: 4s interval, low latency.</li>
<li>Reliable - payment không double charge.</li>
<li>Globally distributed - mỗi city là 1 market.</li>
</ul>

<h2>📊 Bước 2: Capacity</h2>

<pre><code>15M driver × update every 4s = 3.75M updates/second 🤯
30M trip/day × ~5 events/trip = 150M event/day = 1700/s avg

Storage:
- Location update: 100B × 3.75M/s = 375 MB/s → 32 TB/day
- Sau aggregation/compression: lưu 1 TB/day, 365 TB/năm
- Trip records: 30M × 5 KB = 150 GB/day, 55 TB/year

Bandwidth:
- Driver app uplink: 100B × 4s = 25 B/s per driver, total ~400 MB/s
- Map tile downloads, route data: ~1 GB/s peak</code></pre>

<h2>🏗️ Bước 3: Architecture</h2>

<div class="diagram">
<svg viewBox="0 0 780 420" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="40" width="100" height="40" rx="8" fill="#ff5e7a"/>
  <text x="70" y="65" text-anchor="middle" fill="white" font-size="11">Driver App</text>
  <rect x="20" y="160" width="100" height="40" rx="8" fill="#ff5e7a"/>
  <text x="70" y="185" text-anchor="middle" fill="white" font-size="11">Rider App</text>

  <rect x="160" y="100" width="120" height="40" rx="8" fill="#6c5ce7"/>
  <text x="220" y="125" text-anchor="middle" fill="white" font-size="11">API Gateway (Edge)</text>

  <rect x="320" y="20" width="120" height="30" rx="8" fill="#6c5ce7"/>
  <text x="380" y="40" text-anchor="middle" fill="white" font-size="11">Location Service</text>
  <rect x="320" y="60" width="120" height="30" rx="8" fill="#6c5ce7"/>
  <text x="380" y="80" text-anchor="middle" fill="white" font-size="11">DISCO (matching)</text>
  <rect x="320" y="100" width="120" height="30" rx="8" fill="#6c5ce7"/>
  <text x="380" y="120" text-anchor="middle" fill="white" font-size="11">Pricing Service</text>
  <rect x="320" y="140" width="120" height="30" rx="8" fill="#6c5ce7"/>
  <text x="380" y="160" text-anchor="middle" fill="white" font-size="11">Trip Service</text>
  <rect x="320" y="180" width="120" height="30" rx="8" fill="#6c5ce7"/>
  <text x="380" y="200" text-anchor="middle" fill="white" font-size="11">ETA Service</text>
  <rect x="320" y="220" width="120" height="30" rx="8" fill="#6c5ce7"/>
  <text x="380" y="240" text-anchor="middle" fill="white" font-size="11">Routing (OSRM)</text>
  <rect x="320" y="260" width="120" height="30" rx="8" fill="#6c5ce7"/>
  <text x="380" y="280" text-anchor="middle" fill="white" font-size="11">Payment Service</text>
  <rect x="320" y="300" width="120" height="30" rx="8" fill="#6c5ce7"/>
  <text x="380" y="320" text-anchor="middle" fill="white" font-size="11">Notification</text>
  <rect x="320" y="340" width="120" height="30" rx="8" fill="#6c5ce7"/>
  <text x="380" y="360" text-anchor="middle" fill="white" font-size="11">Driver Service</text>
  <rect x="320" y="380" width="120" height="30" rx="8" fill="#6c5ce7"/>
  <text x="380" y="400" text-anchor="middle" fill="white" font-size="11">Rider Service</text>

  <rect x="480" y="20" width="140" height="30" rx="8" fill="#f9a826"/>
  <text x="550" y="40" text-anchor="middle" fill="white" font-size="11">Redis Geo</text>
  <rect x="480" y="60" width="140" height="30" rx="8" fill="#f9a826"/>
  <text x="550" y="80" text-anchor="middle" fill="white" font-size="11">Kafka (events)</text>
  <rect x="480" y="100" width="140" height="30" rx="8" fill="#f9a826"/>
  <text x="550" y="120" text-anchor="middle" fill="white" font-size="11">Ringpop (sharding)</text>
  <rect x="480" y="140" width="140" height="30" rx="8" fill="#f9a826"/>
  <text x="550" y="160" text-anchor="middle" fill="white" font-size="11">H3 Grid Library</text>

  <rect x="640" y="20" width="120" height="30" rx="8" fill="#00d2a8"/>
  <text x="700" y="40" text-anchor="middle" fill="white" font-size="11">Cassandra (trips)</text>
  <rect x="640" y="60" width="120" height="30" rx="8" fill="#00d2a8"/>
  <text x="700" y="80" text-anchor="middle" fill="white" font-size="11">MySQL (user)</text>
  <rect x="640" y="100" width="120" height="30" rx="8" fill="#00d2a8"/>
  <text x="700" y="120" text-anchor="middle" fill="white" font-size="11">Postgres (geo)</text>
  <rect x="640" y="140" width="120" height="30" rx="8" fill="#00d2a8"/>
  <text x="700" y="160" text-anchor="middle" fill="white" font-size="11">Schemaless (KV)</text>
  <rect x="640" y="180" width="120" height="30" rx="8" fill="#00d2a8"/>
  <text x="700" y="200" text-anchor="middle" fill="white" font-size="11">Hudi (lake)</text>

  <line x1="120" y1="60" x2="160" y2="115" stroke="#5a5a72"/>
  <line x1="120" y1="180" x2="160" y2="125" stroke="#5a5a72"/>
</svg>
<div class="diagram-caption">Uber architecture (đơn giản hoá)</div>
</div>

<h2>🗺️ Bước 4: Geospatial Indexing (Core)</h2>

<p>Đây là <strong>core challenge</strong>: trong vài ms, tìm tài xế gần khách trong bán kính 2km.</p>

<h3>Naive approach (FAIL)</h3>
<pre><code>// O(N) - quét tất cả driver
SELECT id FROM drivers
WHERE distance(lat, lng, ?, ?) &lt; 2000
ORDER BY distance ASC LIMIT 20;</code></pre>

<p>15M driver - không thể scan toàn bộ.</p>

<h3>Approach 1: Geohash</h3>

<pre><code>Encode (lat, lng) → string base32
Càng nhiều ký tự → ô càng nhỏ

Geohash "u4pruydqqvj":
  u → quarter của trái đất
  u4 → smaller
  u4p → smaller
  ...
  u4pruydqqvj → ~1m precision

Properties:
  - Same prefix → nearby (approximate)
  - Indexable in SQL/Redis as string</code></pre>

<p><strong>Vấn đề</strong>: 2 điểm gần biên 2 cell có thể khác prefix. Cần query 9 cells xung quanh.</p>

<h3>Approach 2: Quadtree</h3>
<p>Recursive subdivide không gian thành 4 ô. Cell đầy thì split. Tree-based query.</p>
<p><strong>Vấn đề</strong>: cập nhật khó khi driver di chuyển - phải rebalance tree.</p>

<h3>Approach 3: H3 - Uber's Hexagonal Grid ⭐⭐⭐</h3>

<p>Uber tự build và open-source H3.</p>

<h4>Tại sao hexagon?</h4>
<table>
<tr><th>Shape</th><th>Neighbor distances</th></tr>
<tr><td>Square</td><td>4 cardinal cùng khoảng cách, 4 diagonal xa hơn 1.41x</td></tr>
<tr><td>Triangle</td><td>3 edge + 3 vertex neighbor - không đồng nhất</td></tr>
<tr><td><strong>Hexagon</strong></td><td><strong>6 neighbor cùng khoảng cách - perfect</strong></td></tr>
</table>

<h4>H3 properties</h4>
<ul>
<li>Trái đất chia thành ~122 base cells (cấp 0).</li>
<li>Mỗi cell có thể split thành 7 nhỏ hơn (cấp 1, cấp 2,...).</li>
<li>16 levels (cấp 0 = ~4000km, cấp 15 = ~1m²).</li>
<li>Mỗi cell có 64-bit unique ID.</li>
</ul>

<pre><code>// Pseudo API
h3.geoToH3(lat, lng, resolution=9)   // → H3 cell index
h3.h3ToGeo(h3Index)                   // → center lat/lng
h3.kRing(h3Index, k=2)                 // → cells within k-ring (neighbors)
h3.gridDistance(a, b)                  // → distance in cells</code></pre>

<h3>Sử dụng H3 trong matching</h3>

<pre><code>// Driver location update
function updateDriverLocation(driverId, lat, lng) {
  const h3Cell = h3.geoToH3(lat, lng, RES_9);     // ~150m cell

  // Atomic update Redis
  pipeline:
    HSET driver:{driverId} h3 {h3Cell}, lat {lat}, lng {lng}, ts {now}
    SADD cell:{h3Cell}:drivers {driverId}
    SREM cell:{prevCell}:drivers {driverId}    // remove from old cell
}

// Find nearby drivers
function findNearbyDrivers(lat, lng, radiusKm) {
  const centerCell = h3.geoToH3(lat, lng, RES_9);
  const k = Math.ceil(radiusKm / 0.15);          // 150m per cell at RES_9
  const cells = h3.kRing(centerCell, k);

  let candidates = [];
  for (const cell of cells) {
    const drivers = redis.smembers(\`cell:\${cell}:drivers\`);
    candidates = candidates.concat(drivers);
  }

  // Filter exact distance
  return candidates
    .map(d => ({...d, distance: haversine(lat, lng, d.lat, d.lng)}))
    .filter(d => d.distance &lt; radiusKm * 1000)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 20);
}</code></pre>

<h2>📡 Bước 5: Location Update Pipeline</h2>

<pre><code>Driver app: emit GPS every 4s
  ↓
Edge (closest data center): TCP/WebSocket
  ↓
Load Balancer
  ↓
Location Service (sharded by driver_id):
  - Validate (speed sanity, GPS accuracy)
  - Update Redis Geo
  - Publish event to Kafka:
      topic: location.updates
      key: driver_id
      value: { lat, lng, heading, speed, ts }
  ↓
Downstream consumers:
  - Trip Tracker (active trips)
  - Surge Pricing (calculate demand/supply)
  - Driver State Manager
  - Analytics (Hudi data lake)
  - ETA recalculation</code></pre>

<h3>Sharding strategy</h3>
<p>Uber dùng <strong>Ringpop</strong> - tự build consistent hashing library:</p>
<ul>
<li>Driver_id → hash → node in cluster.</li>
<li>Add/remove node: chỉ ảnh hưởng 1/N driver.</li>
<li>Each Location Service node holds state for assigned drivers.</li>
</ul>

<h2>🎯 Bước 6: DISCO - Matching Service</h2>

<p><strong>DISCO</strong> (Dispatch Optimization) - heart of Uber.</p>

<h3>Matching algorithm v1 (Naive)</h3>
<pre><code>// First Available Driver
1. Rider requests trip
2. Find 5 nearest available drivers
3. Send request to closest driver
4. Wait 15s for accept
5. Timeout → send to next driver
6. Repeat</code></pre>
<p><strong>Vấn đề</strong>: locally optimal, globally suboptimal. Driver A nhận xa thay vì để cho rider khác.</p>

<h3>Matching v2 - Global Optimization ⭐</h3>

<pre><code>Mỗi 1-2 giây, batch optimization:
  - Collect all active ride requests
  - Collect all available drivers in region
  - Build bipartite graph
  - Solve assignment problem (Hungarian algorithm or LP)
  - Minimize total: ETA + cost - utility

Cost function (simplified):
  cost(driver, rider) = α × ETA_pickup
                      + β × probability_cancel
                      - γ × driver_utility_score
                      + δ × completion_probability</code></pre>

<h3>Uber Pool / Shared rides</h3>
<p>NP-hard problem: ghép 2-3 rider có route tương tự vào 1 driver. Solution:</p>
<ul>
<li>Pre-compute possible match candidates.</li>
<li>Heuristic: route similarity score, detour limit (max +20% time).</li>
<li>Solve iteratively.</li>
</ul>

<h2>💰 Bước 7: Surge Pricing</h2>

<p>Khu vực demand > supply → tăng giá để:</p>
<ul>
<li>Khuyến khích driver tới khu vực đó.</li>
<li>Giảm demand (price-sensitive rider chờ).</li>
</ul>

<h3>Algorithm</h3>
<pre><code>Mỗi H3 cell (resolution 7, ~5km²), mỗi 30 giây:
  demand = số ride request 5 phút qua
  supply = số available driver in cell
  ratio = demand / max(supply, 1)

  surge_multiplier = clamp(
    base_function(ratio),
    1.0,
    5.0
  )

  // base_function example
  if ratio &lt; 0.5: 1.0
  elif ratio &lt; 1.0: 1.2
  elif ratio &lt; 2.0: 1.5
  elif ratio &lt; 5.0: 2.0
  else: 3.0+

Store in Redis: surge:{cellId} = 1.5x</code></pre>

<h3>Stream processing</h3>
<pre><code>Kafka location events + ride events
  ↓
Flink job: window 5 min per H3 cell
  ↓
Aggregate demand, supply
  ↓
Compute surge → Redis</code></pre>

<h3>Predictive surge</h3>
<ul>
<li>ML model predict demand 15-30 min ahead.</li>
<li>Send "heat map" to driver app → driver di chuyển tới khu nóng trước khi surge xảy ra.</li>
</ul>

<h2>🛣️ Bước 8: ETA & Routing</h2>

<h3>Components</h3>

<h4>1. Map data</h4>
<p>OpenStreetMap (OSM) + Uber's own corrections. Stored as graph (nodes = intersections, edges = roads with weights).</p>

<h4>2. Routing engine</h4>
<p>OSRM (Open Source Routing Machine) hoặc Uber Valhalla. Dùng <strong>Contraction Hierarchies</strong>:</p>
<ul>
<li>Pre-process: pre-compute shortcuts.</li>
<li>Query: 1-10ms for cross-city route (vs Dijkstra: seconds).</li>
</ul>

<h4>3. ETA model</h4>
<pre><code>// Naive ETA
ETA = sum(edge.length / edge.speed_limit)

// Reality ETA: ML model
features:
  - Current traffic (real-time speed from active driver GPS)
  - Historical traffic (same time, same day of week)
  - Weather
  - Events nearby
  - Road type, turns count
  - Time of day

Model: Gradient Boosted Decision Tree or DNN
Output: ETA distribution (mean + uncertainty)</code></pre>

<h3>Realtime traffic</h3>
<p>Driver GPS = free realtime traffic data. Edge speed updated mỗi vài phút. Other Uber drivers feed each other's ETA accuracy.</p>

<h2>💳 Bước 9: Payment - Idempotency Crítica</h2>

<p>Networks fail. Retry là norm. Không được charge 2 lần!</p>

<pre><code>POST /charge
Idempotency-Key: trip_abc123_v1
Body: { amount: 250000, currency: "VND", trip_id: "abc123" }

Server logic:
  1. SELECT FROM payments WHERE idempotency_key = ?
  2. If found → return cached result
  3. Else:
     - INSERT payments (key, status='pending', ...)
     - Call payment gateway (Stripe, Adyen)
     - UPDATE payments SET status='success/failed', external_id=...
     - Return result

  // Even if client retries → step 1 returns same response</code></pre>

<h3>Saga pattern for trip completion</h3>
<pre><code>Trip ends → multi-step transaction:
  1. Calculate fare
  2. Charge rider's payment method
  3. Pay driver (commission deducted)
  4. Update trip status
  5. Send receipts
  6. Update analytics

If step 2 fails → rollback (cancel trip, refund pre-auth)
If step 3 fails → compensate (refund rider, schedule retry for driver pay)
If step 5 fails → just retry async</code></pre>

<h2>📱 Bước 10: Realtime Tracking (Rider sees car moving)</h2>

<pre><code>Driver GPS update → Kafka
  ↓
Trip Tracker (consumes events for active trips)
  ↓
Push to Rider app via WebSocket
  ↓
Rider app: render car icon at new position
  Smooth animation between updates (linear interpolation)</code></pre>

<h3>Optimization: Don't send raw GPS</h3>
<ul>
<li>Map-match: snap GPS to nearest road.</li>
<li>Send delta: change since last update (smaller payload).</li>
<li>Throttle: max 1 update / 2s to rider client.</li>
</ul>

<h2>📊 Bước 11: Database Choices</h2>

<table>
<tr><th>Data</th><th>Store</th><th>Why</th></tr>
<tr><td>Driver real-time location</td><td>Redis Geo / in-memory</td><td>Fast read/write, ephemeral OK</td></tr>
<tr><td>Trip records</td><td>Schemaless (Uber custom on MySQL)</td><td>Append-mostly, time-series</td></tr>
<tr><td>User profile</td><td>MySQL (sharded)</td><td>ACID</td></tr>
<tr><td>Payment</td><td>MySQL + 2PC with external</td><td>Strong consistency required</td></tr>
<tr><td>Rating, review</td><td>Cassandra</td><td>High write</td></tr>
<tr><td>Geo / map data</td><td>Postgres + PostGIS</td><td>Spatial queries</td></tr>
<tr><td>Analytics</td><td>Hudi data lake (S3)</td><td>Petabyte scale</td></tr>
<tr><td>Stream</td><td>Kafka</td><td>1T+ messages/day</td></tr>
</table>

<h2>🌍 Bước 12: Multi-City / Multi-Region</h2>

<p>Uber là multi-tenant: mỗi city là 1 market gần như độc lập.</p>

<ul>
<li>Routing rule: city_id → assigned region/datacenter.</li>
<li>Driver/rider data pinned to home city.</li>
<li>Cross-city trip: handled by global services.</li>
<li>Multi-region failover: if SF datacenter down, NYC takes over (with elevated latency).</li>
</ul>

<h2>🧠 Bước 13: Follow-up Questions</h2>

<h3>Q1: Cancellation flood?</h3>
<p>5K rider cancel same time → 5K driver state update. Use Kafka + idempotent state machine. Driver state: <code>available → assigned → arrived → in_trip</code>. Atomic transitions.</p>

<h3>Q2: Fraud detection?</h3>
<ul>
<li>GPS spoofing: detect impossibly fast moves between updates.</li>
<li>Driver-rider collusion: same person on both sides (device fingerprint).</li>
<li>Account creation: rate limit per IP, ML model.</li>
<li>Realtime fraud scoring on each trip.</li>
</ul>

<h3>Q3: Why không dùng PostGIS thay Redis Geo?</h3>
<p>Latency: in-memory Redis ~1ms vs PostGIS 5-50ms. Tradeoff: Redis volatile, cần backup state. Uber dùng cả 2: Redis cho hot path, Postgres cho audit.</p>

<h3>Q4: Driver acceptance không cao?</h3>
<p>Driver utility score predict accept probability. Send to highest-prob driver. ML model retrain mỗi ngày.</p>

<h3>Q5: Backup driver when first rejects?</h3>
<p>Send to top 3 drivers concurrently in "auction". First to accept wins. Others get nothing.</p>

<h3>Q6: Heatmap for drivers (where to go for high demand)?</h3>
<p>Predictive demand model + current supply → "go to this area, expected high earning". Visual on driver app.</p>

<h3>Q7: Multi-modal trip (Uber + walk + bus)?</h3>
<p>Composite routing engine. Each leg has own ETA, cost. Combine for end-to-end journey.</p>

<h3>Q8: Holiday surge - 10x demand?</h3>
<p>Pre-warm capacity, dynamic scaling cloud, throttle non-critical features (rating, history). Maintain core: matching, payment.</p>

<h3>Q9: Background driver location when app closed?</h3>
<p>Trade-off: battery vs accuracy. iOS/Android background mode with reduced frequency. Driver paid → incentive to keep app on.</p>

<h3>Q10: Real-time matching algorithm scale to NYC?</h3>
<p>Partition by H3 region (~3km). Each region matched independently. Cross-region rider/driver rare (only if no match in region).</p>

<h2>🎤 Senior Pitch</h2>
<div class="callout fun">
<div class="callout-title">🚀 Pitch 3 phút</div>
<p>"Core challenge của Uber là <strong>geospatial</strong>: tìm driver gần rider trong &lt;100ms với 15M drivers moving. Tôi dùng <strong>H3 hexagonal grid</strong> (Uber's own) - phân chia thế giới thành cell lục giác có khoảng cách đồng đều tới neighbors. Driver location → Redis sharded bằng <strong>Ringpop</strong> consistent hashing. Matching không dùng greedy mà <strong>global optimization mỗi 1-2s</strong> - solve bipartite assignment minimize ETA + cancel prob - utility. <strong>Surge</strong> computed per H3 cell qua Flink stream over Kafka. <strong>ETA</strong> dùng ML model trên top OSRM routing engine, features bao gồm real-time GPS from other drivers. <strong>Payment</strong> idempotency key bắt buộc, Saga pattern cho trip completion với compensating actions. <strong>Realtime tracking</strong> qua WebSocket. <strong>Multi-region</strong>: mỗi city pinned 1 region, cross-city handled globally."</p>
</div>

<h2>📚 Key insights</h2>
<ul>
<li><strong>Geo problems</strong> = special tooling needed. SQL không đủ.</li>
<li><strong>H3 hexagons</strong> vượt trội square grid cho proximity queries.</li>
<li><strong>Global optimization > Greedy</strong> - critical insight cho matching.</li>
<li><strong>Stream processing</strong> (Kafka + Flink) backbone cho surge, fraud, ETA.</li>
<li><strong>Idempotency</strong> không phải optional cho payment - bắt buộc.</li>
<li><strong>Eventually consistent OK</strong> cho location, rating. NOT OK cho payment.</li>
</ul>
`
});
