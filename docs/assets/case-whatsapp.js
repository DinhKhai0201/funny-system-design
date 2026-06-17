/* =========================================================
 * CHƯƠNG 29: WHATSAPP - DEEP DIVE
 * Realtime messaging, E2E encryption, group chat, presence
 * ========================================================= */

window.CHAPTERS = window.CHAPTERS || [];

window.CHAPTERS.push({
  group: "🎯 Phần 4: Case Study huyền thoại",
  icon: "💬",
  title: "Chương 29: WhatsApp / Messenger - 2 tỷ user (Deep Dive)",
  content: `
<h1>Chương 29: WhatsApp / Messenger</h1>
<p class="subtitle">100 tỷ tin nhắn/ngày, mã hoá E2E, multi-device 💬</p>

<h2>📋 Bước 1: Requirements</h2>

<h3>Functional</h3>
<ul>
<li>1-1 chat (text, media, voice, video, file).</li>
<li>Group chat (tối đa 1024 thành viên).</li>
<li>Voice & video call.</li>
<li>Read receipts (✓ sent, ✓✓ delivered, ✓✓ blue = read).</li>
<li>Online status, typing indicator, last seen.</li>
<li>End-to-end encryption (Signal Protocol).</li>
<li>Multi-device: chat sync across phone, tablet, web, desktop.</li>
<li>Offline message delivery.</li>
<li>Status updates (24h ephemeral).</li>
</ul>

<h3>Non-functional</h3>
<ul>
<li>2B user, 1B DAU.</li>
<li>100B messages/day = ~1.16M msg/s avg, 3M/s peak.</li>
<li>Latency &lt; 100ms cho message delivery (real-time feel).</li>
<li>Reliable: không mất message.</li>
<li>Bandwidth-efficient (emerging markets, 2G/3G networks).</li>
<li>Server không đọc được nội dung (privacy).</li>
</ul>

<h2>📊 Bước 2: Capacity</h2>

<pre><code>2B users, 1B DAU
Avg 100 msg/user/day → 100B msg/day = 1.16M/s avg, 3M/s peak
Each msg ~1 KB avg (text mostly) → 100 TB/day text only

Media: 6B media files/day, avg 500 KB → 3 PB/day media
Media stored 30 days = 90 PB hot storage

Active concurrent connections:
  1B DAU × ~30% online same time = 300M concurrent WebSocket
  Each server handles ~1M connection → 300 chat servers

Bandwidth:
  Peak msg: 3M/s × 1 KB = 3 GB/s
  Media upload/download: ~50 GB/s peak</code></pre>

<div class="callout fun">
<div class="callout-title">🤯 Mind-blowing fact</div>
<p>Năm 2014, WhatsApp có <strong>32 engineer</strong> phục vụ <strong>450M user</strong>. Bí mật: Erlang/OTP cho per-process isolation và lightweight processes. Mỗi server xử lý ~2M concurrent connection.</p>
</div>

<h2>🏗️ Bước 3: Architecture</h2>

<div class="diagram">
<svg viewBox="0 0 780 380" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="60" width="100" height="40" rx="8" fill="#ff5e7a"/>
  <text x="70" y="85" text-anchor="middle" fill="white" font-size="11">Client A</text>
  <rect x="20" y="200" width="100" height="40" rx="8" fill="#ff5e7a"/>
  <text x="70" y="225" text-anchor="middle" fill="white" font-size="11">Client B</text>

  <rect x="160" y="40" width="120" height="35" rx="8" fill="#6c5ce7"/>
  <text x="220" y="62" text-anchor="middle" fill="white" font-size="11">LB / Edge</text>

  <rect x="160" y="100" width="120" height="35" rx="8" fill="#6c5ce7"/>
  <text x="220" y="122" text-anchor="middle" fill="white" font-size="11">Chat Server 1 (WS)</text>
  <rect x="160" y="160" width="120" height="35" rx="8" fill="#6c5ce7"/>
  <text x="220" y="182" text-anchor="middle" fill="white" font-size="11">Chat Server 2 (WS)</text>
  <rect x="160" y="220" width="120" height="35" rx="8" fill="#6c5ce7"/>
  <text x="220" y="242" text-anchor="middle" fill="white" font-size="11">Chat Server N (WS)</text>

  <rect x="320" y="40" width="120" height="35" rx="8" fill="#f9a826"/>
  <text x="380" y="62" text-anchor="middle" fill="white" font-size="11">Presence Service</text>
  <rect x="320" y="100" width="120" height="35" rx="8" fill="#f9a826"/>
  <text x="380" y="122" text-anchor="middle" fill="white" font-size="11">Message Router</text>
  <rect x="320" y="160" width="120" height="35" rx="8" fill="#f9a826"/>
  <text x="380" y="182" text-anchor="middle" fill="white" font-size="11">Push (APNs/FCM)</text>
  <rect x="320" y="220" width="120" height="35" rx="8" fill="#f9a826"/>
  <text x="380" y="242" text-anchor="middle" fill="white" font-size="11">Group Service</text>
  <rect x="320" y="280" width="120" height="35" rx="8" fill="#f9a826"/>
  <text x="380" y="302" text-anchor="middle" fill="white" font-size="11">Key Server (E2E)</text>

  <rect x="480" y="40" width="140" height="35" rx="8" fill="#00d2a8"/>
  <text x="550" y="62" text-anchor="middle" fill="white" font-size="11">Redis Presence</text>
  <rect x="480" y="100" width="140" height="35" rx="8" fill="#00d2a8"/>
  <text x="550" y="122" text-anchor="middle" fill="white" font-size="11">Mnesia (msg queue)</text>
  <rect x="480" y="160" width="140" height="35" rx="8" fill="#00d2a8"/>
  <text x="550" y="182" text-anchor="middle" fill="white" font-size="11">MySQL (user info)</text>
  <rect x="480" y="220" width="140" height="35" rx="8" fill="#00d2a8"/>
  <text x="550" y="242" text-anchor="middle" fill="white" font-size="11">S3 (media)</text>
  <rect x="480" y="280" width="140" height="35" rx="8" fill="#00d2a8"/>
  <text x="550" y="302" text-anchor="middle" fill="white" font-size="11">Cassandra (group meta)</text>

  <rect x="640" y="60" width="120" height="35" rx="8" fill="#f9a826"/>
  <text x="700" y="82" text-anchor="middle" fill="white" font-size="11">Coturn (WebRTC)</text>
  <rect x="640" y="120" width="120" height="35" rx="8" fill="#f9a826"/>
  <text x="700" y="142" text-anchor="middle" fill="white" font-size="11">SFU (group call)</text>

  <line x1="120" y1="80" x2="160" y2="118" stroke="#5a5a72"/>
  <line x1="120" y1="220" x2="160" y2="178" stroke="#5a5a72"/>
</svg>
<div class="diagram-caption">WhatsApp architecture - tách chat/presence/media</div>
</div>

<h2>🔌 Bước 4: Persistent Connection</h2>

<p>Mỗi client mở WebSocket dài hạn tới Chat Server.</p>

<h3>Protocol</h3>
<p>WhatsApp dùng <strong>XMPP biến thể</strong> (custom binary). Modern alternative: gRPC streaming, custom protocol over TCP/QUIC.</p>

<h3>Connection management</h3>

<pre><code>// Khi client connect
1. TLS handshake
2. Auth (token-based)
3. Server tạo session, lưu trong Redis Presence:
   SET user:{userId}:server = "chat-server-3.eu-west"
4. Server tải pending messages từ Mnesia/queue
   Push xuống client
5. Heartbeat mỗi 30s</code></pre>

<h3>Vì sao Erlang?</h3>
<ul>
<li>Lightweight process (~2KB per process) - mỗi connection 1 process.</li>
<li>Pre-emptive scheduler - không block.</li>
<li>"Let it crash" philosophy + supervision tree → siêu fault-tolerant.</li>
<li>Hot code reload không downtime.</li>
<li>BEAM VM optimized for concurrent IO.</li>
</ul>

<div class="callout tip">
<div class="callout-title">🤔 Tại sao WhatsApp chọn Erlang mà không phải Java/C++?</div>
<p>Bài toán chat là bài toán <strong>I/O bound, không phải CPU bound</strong>. Server chat chủ yếu ngồi chờ tin nhắn và đẩy tin nhắn đi qua hàng triệu connection (C10M problem). Erlang được thiết kế từ thập niên 80 cho <strong>hệ thống viễn thông</strong> (telephone switch) với kiến trúc Actor Model: mỗi connection là 1 process độc lập, siêu nhẹ (2KB RAM). Nếu 1 process crash, nó không kéo sập cả server. 32 engineer WhatsApp quản lý 450M user nhờ sự ổn định tuyệt đối của Erlang.</p>
</div>

<h2>📩 Bước 5: Message Delivery Flow</h2>

<h3>Single chat (A → B)</h3>

<pre><code>1. A composes "Hi B", encrypts với B's public key
2. A → WS Server 1: { to: B, content: encrypted, msgId: snowflake }
3. WS Server 1:
   - Persist to Mnesia (Erlang distributed DB)
   - ACK back to A: msgId received → status "sent" ✓
4. Lookup B's location:
   GET Redis: user:{B}:server → "chat-server-2"
5. If B online:
   - Server 1 → Message Router → Server 2 (via Erlang distribution)
   - Server 2 → B over WS
   - B's app receives → ACK back to server
   - Server 2 → Server 1 (via Router): "delivered" ✓✓
   - Server 1 notifies A: msg X delivered
6. If B offline:
   - Queue msg in Mnesia for B
   - Send push notification via FCM/APNs (envelope, no content)
   - When B comes online: deliver queued
7. B reads:
   - B's app sends "read" event
   - Propagate: B → server → A (✓✓ blue)
8. WhatsApp deletes msg from server (after delivery acked)</code></pre>

<h3>Status states</h3>
<table>
<tr><th>Status</th><th>Meaning</th><th>Storage</th></tr>
<tr><td>Sent ✓</td><td>Server received from sender</td><td>Mnesia</td></tr>
<tr><td>Delivered ✓✓</td><td>Receiver device got it</td><td>Mnesia + receipt</td></tr>
<tr><td>Read ✓✓ (blue)</td><td>Receiver opened chat</td><td>Receipt only</td></tr>
</table>

<h2>👥 Bước 6: Group Chat</h2>

<h3>Naive: server fan-out</h3>
<pre><code>A sends to group G of 1000 members:
  Server: for each member m, send copy
Problem with E2E: A must encrypt 1000 times (once per member's key)
1024 members × 100 msg/day = 100K encrypted msg/user/day - phone CPU dies</code></pre>

<h3>Solution: Sender Keys (Signal Protocol extension)</h3>

<pre><code>1. A creates a symmetric "sender key" SK for group G
2. A encrypts SK with each member's public key (one-time setup)
3. A distributes encrypted SK to each member (via 1-1 encrypted channel)
4. Each member now has SK

For each new message:
  A encrypts msg ONCE with SK
  Sends single encrypted msg to server
  Server fan-out to 1024 members
  Each member decrypts with their stored SK

Sender key rotated when membership changes (security forward secrecy)</code></pre>

<h3>Group metadata</h3>
<pre><code>CREATE TABLE groups (
  id BIGINT PRIMARY KEY,
  name VARCHAR(255),
  admin_ids BIGINT[],
  created_at TIMESTAMP,
  settings JSONB
);

CREATE TABLE group_members (
  group_id BIGINT,
  user_id BIGINT,
  role ENUM('member', 'admin'),
  joined_at TIMESTAMP,
  PRIMARY KEY (group_id, user_id)
);

-- Cassandra preferred for high write</code></pre>

<h2>🔐 Bước 7: End-to-End Encryption (Signal Protocol)</h2>

<p>WhatsApp adopted Signal Protocol. Core insight: server can't decrypt anything.</p>

<h3>Key components</h3>

<h4>1. Identity Key Pair (long-term)</h4>
<p>Each user has identity public/private key on device. Generated at install.</p>

<h4>2. Signed Pre-keys</h4>
<p>Medium-term keys uploaded to server. Used for initial key exchange.</p>

<h4>3. One-time Pre-keys</h4>
<p>One per future contact. Uploaded in batch to server.</p>

<h3>X3DH (Initial key exchange)</h3>

<pre><code>A wants to chat with B for first time:
1. A asks server: "give me B's pre-key bundle"
   Server returns: (B_identity_pub, B_signed_pre_key, one_time_pre_key)
2. A combines these with own keys → derives shared secret SS
3. A sends first encrypted msg + own ephemeral key to B
4. B receives, uses A's ephemeral + own keys → derives same SS

Now both have shared root key. Server NEVER sees private keys.</code></pre>

<h3>Double Ratchet (per-message keys)</h3>
<p>Every message uses different key, derived from previous. Even if 1 key leaked, only that 1 message exposed.</p>

<pre><code>// Pseudo
function sendMessage(plaintext) {
  const messageKey = HKDF(currentChainKey);
  const ciphertext = AES_GCM(messageKey, plaintext);
  currentChainKey = HKDF(currentChainKey);   // ratchet forward
  return ciphertext;
}

// Diffie-Hellman ratchet on each exchange:
// new ephemeral key pair → new root key → new chain key</code></pre>

<h3>Why server can't read</h3>
<ul>
<li>Server never sees private keys.</li>
<li>Server has public keys only - useless for decryption.</li>
<li>Even law enforcement subpoena can't reveal content.</li>
<li>Metadata (sender, receiver, time) IS visible to server.</li>
</ul>

<h2>📲 Bước 8: Multi-Device Sync</h2>

<p>Trước 2021, WhatsApp chỉ 1 device chính. Web là "mirror". Sau cập nhật multi-device:</p>

<h3>Approach</h3>
<ul>
<li>Each device is FIRST-CLASS participant with own keys.</li>
<li>Each device has identity key pair.</li>
<li>When user adds device: existing devices "endorse" it (sign new device's key).</li>
<li>Senders encrypt message N times (once per receiver device).</li>
</ul>

<h3>Example</h3>
<pre><code>Alice has 1 device. Bob has 3 devices (phone, web, tablet).

Alice sends "Hi":
  Server has Bob's device list: [phone_key, web_key, tablet_key]
  Alice encrypts 3 times → 3 ciphertexts
  Sends bundle to server
  Server delivers each ciphertext to correct device
  Each Bob device decrypts independently

Storage requirement: 3x for multi-device.
Trade-off: privacy vs efficiency.</code></pre>

<h2>📷 Bước 9: Media (Image, Video, Voice)</h2>

<pre><code>A wants to send 10MB photo to B:

1. A generates random symmetric key K (AES-256)
2. A encrypts photo with K → encrypted blob
3. A uploads encrypted blob to S3 via pre-signed URL
   Server doesn't see plaintext
4. A constructs message:
   {
     type: "image",
     media_url: "https://media.whatsapp.net/v/abc123",
     media_key: encrypted_K_with_B's_public_key,
     thumbnail: small_inline_encrypted,
     sha256: hash_for_integrity
   }
5. A encrypts whole message with B's session key, sends
6. B receives, decrypts message, gets media_url + K
7. B downloads encrypted blob from S3
8. B decrypts with K → original photo</code></pre>

<h3>Voice messages</h3>
<ul>
<li>Record OPUS codec (~32 kbps, very compressed).</li>
<li>Waveform generated on client.</li>
<li>Same encryption pipeline as media.</li>
</ul>

<h2>📞 Bước 10: Voice & Video Calls</h2>

<h3>1-1 Call (P2P when possible)</h3>
<pre><code>1. A calls B (signaling via WS to WhatsApp server)
2. Server notifies B (WS or push)
3. Exchange ICE candidates via signaling
4. WebRTC: try P2P
   - Direct: same NAT → success
   - Most cases: NAT traversal needed
5. Fallback: TURN server (Coturn) - relays media
6. Audio: OPUS 16-64 kbps, video VP8/9 or H.264
7. E2E encrypted: SRTP with keys from Signal protocol</code></pre>

<h3>Group Call (server-relayed)</h3>
<p>P2P doesn't scale. Use SFU (Selective Forwarding Unit):</p>
<ul>
<li>Each participant sends 1 stream to SFU.</li>
<li>SFU forwards to all others (smart routing).</li>
<li>SFU doesn't decode (can't with E2E) - but routes encrypted streams.</li>
<li>WhatsApp uses custom SFU built for E2E.</li>
</ul>

<h2>👀 Bước 11: Presence & Typing Indicator</h2>

<p>Lightweight ephemeral events - don't persist in DB.</p>

<pre><code>// Presence
A connects → Redis: SET user:A:online true EX 60
A heartbeats every 30s → refresh TTL
A disconnects → DEL user:A:online (or wait for TTL)

// Subscribers
B's app subscribes to A's presence (if in chat with A)
Server pushes A's presence changes to B over WS

// Typing
A starts typing → A's app sends "typing" event
Server forwards to B (no persist)
After 5s no event → assume stopped</code></pre>

<h3>Last seen</h3>
<p>Stored as timestamp in user profile. Updated on disconnect. Privacy setting: hide / show only contacts / everyone.</p>

<h2>📵 Bước 12: Offline Delivery & Push</h2>

<p>B's phone closed/no internet. A sends message.</p>

<pre><code>1. Server tries to deliver via WS → fails (no active connection)
2. Queue msg in Mnesia for B (per-user queue)
3. Send push notification via FCM (Android) / APNs (iOS):
   - Payload: just "you have a new message from A"
   - No content (E2E - server can't decrypt anyway)
4. B's phone gets push, wakes app briefly
5. App opens WS connection, downloads queued messages
6. App decrypts, displays</code></pre>

<h3>Push limitations</h3>
<ul>
<li>Apple limits push payload size.</li>
<li>iOS may delay push if background usage limited.</li>
<li>Always-on background WS not allowed → must rely on push.</li>
</ul>

<h2>📊 Bước 13: Storage Strategy</h2>

<h3>Mnesia (Erlang distributed DB)</h3>
<ul>
<li>In-memory, fast.</li>
<li>Used for active queues, sessions.</li>
<li>Eventually consistent across nodes.</li>
</ul>

<h3>Why WhatsApp deletes messages from server</h3>
<ol>
<li>Privacy: less data, less liability.</li>
<li>Storage cost: 100B msg/day × 365 = 36 trillion msg/year. Untenable.</li>
<li>Backup is user's responsibility (iCloud, Google Drive).</li>
</ol>

<div class="callout tip">
<div class="callout-title">🤔 Tại sao xóa message khỏi server là quyết định thiên tài?</div>
<p>Hầu hết các app chat (Messenger, Telegram) lưu toàn bộ lịch sử chat trên server mãi mãi → cost lưu trữ khổng lồ + nguy cơ lộ data. Bằng cách <strong>xóa tin nhắn ngay khi nhận được ACK (delivered)</strong>, server WhatsApp trở thành <strong>stateless router</strong>. Họ không tốn tiền mua Petabyte ổ cứng, không lo bị hacker trộm data (vì làm gì có data mà trộm). Mọi logic tìm kiếm, lưu trữ đều đẩy về phía client (điện thoại của bạn). Đổi lại, nếu bạn mất điện thoại mà chưa backup iCloud → mất sạch tin nhắn.</p>
</div>

<h3>Backup to iCloud/Google Drive</h3>
<ul>
<li>Optional, user-initiated.</li>
<li>Encrypted with user-derived key (since 2021).</li>
<li>WhatsApp never sees backup content.</li>
</ul>

<h2>🌍 Bước 14: Global Distribution</h2>

<ul>
<li>Multi-region edge servers for low latency.</li>
<li>User assigned to "home region" based on country.</li>
<li>Cross-region: forward via Erlang distribution.</li>
<li>Group chat: distributed if members span regions.</li>
</ul>

<h2>🧠 Bước 15: Follow-up Questions</h2>

<h3>Q1: User changes phone number?</h3>
<p>"Change number" feature: keys re-generated. Old chats reuse via account migration. Group memberships transferred. Other users see security notification "John's number changed".</p>

<h3>Q2: Account compromised - new device, old phone lost?</h3>
<p>WhatsApp uses phone number as ID. Verify via SMS OTP. Old device sessions invalidated. Chat history NOT recoverable unless from backup.</p>

<h3>Q3: Spam / mass forwarding?</h3>
<p>"Frequently forwarded" badge. Limit forwarding to 5 chats. Detect via metadata (msg fingerprint via cryptographic hash for "is this same msg as previous" without decrypting).</p>

<h3>Q4: Scaling Erlang to billions?</h3>
<ul>
<li>BEAM VM scales horizontally.</li>
<li>Sharding via consistent hashing.</li>
<li>Each shard ~1M users.</li>
<li>Erlang Distribution handles inter-node messaging.</li>
</ul>

<h3>Q5: Why not Kafka for message broker?</h3>
<p>Kafka great for analytics, log streams. But messaging needs low-latency point-to-point with delivery guarantees per recipient. Mnesia + Erlang processes more efficient for this pattern. (Newer designs DO use Kafka for analytics path only.)</p>

<h3>Q6: WhatsApp Web - 1 device sync 4 years ago?</h3>
<p>Old design: phone was "ground truth". Web was thin client, phone proxied all msgs. Required phone online. New multi-device: web is first-class with own keys.</p>

<h3>Q7: Disappearing messages?</h3>
<p>TTL on message. Client deletes on schedule. Server already deletes on delivery anyway. Mainly client-side enforcement.</p>

<h3>Q8: Read receipts off - other side knows?</h3>
<p>If A turns off read receipts, A doesn't see B's read either (mutual). Server sets flag in user settings.</p>

<h3>Q9: Group chat with 1024 members - performance?</h3>
<ul>
<li>Sender encrypts once with sender key.</li>
<li>Server fan-out 1024 deliveries.</li>
<li>Throttling: max forwarding rate.</li>
<li>Eventually some receivers offline → queue.</li>
</ul>

<h3>Q10: Cross-region call - latency?</h3>
<p>WebRTC P2P when possible. TURN relay closer to caller chosen. Sometimes still 100-200ms - acceptable for voice.</p>

<h2>🎤 Senior Pitch</h2>
<div class="callout fun">
<div class="callout-title">🚀 Pitch 3 phút</div>
<p>"WhatsApp scale: 2B users, 100B msg/day, 300M concurrent WebSocket. Build trên <strong>Erlang/OTP</strong> cho lightweight process per connection. <strong>Mnesia</strong> in-memory store cho active queue. Mỗi client persistent WS với <strong>Chat Server</strong> sharded bằng user_id hash. <strong>Presence</strong> qua Redis với TTL heartbeat. <strong>E2E encryption</strong> qua Signal Protocol: X3DH cho initial key exchange, Double Ratchet cho per-message keys, server không thấy plaintext. <strong>Group chat</strong> dùng Sender Keys - encrypt 1 lần với shared symmetric key. <strong>Media</strong> encrypted client-side, blob upload S3, key trong message payload. <strong>Voice/video call</strong> qua WebRTC P2P + SFU cho group, SRTP cho E2E. <strong>Offline delivery</strong>: queue + FCM/APNs push wake. Server <strong>xoá message sau delivery</strong> để giảm storage và privacy. Backup là responsibility của user (iCloud/Drive, mã hoá user-key)."</p>
</div>

<h2>📚 Key insights độc đáo</h2>
<ul>
<li><strong>E2E thay đổi mọi design quyết định</strong>: search server-side impossible, fan-out cho group cần sender keys.</li>
<li><strong>Erlang là siêu vũ khí</strong> cho millions of concurrent connections.</li>
<li><strong>Server xoá message</strong> sau delivery - radical, nhưng tiết kiệm + privacy + chỉ cần ACK chain.</li>
<li><strong>Push notifications</strong> không phải "tính năng thêm" mà là <strong>core delivery mechanism</strong> khi client offline.</li>
<li><strong>Sender Keys</strong> trick cho phép E2E group chat efficient.</li>
<li><strong>Multi-device khó</strong> với E2E - encrypt N times per recipient device.</li>
</ul>
`
});
