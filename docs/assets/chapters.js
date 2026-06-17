/* =========================================================
 * NỘI DUNG TOÀN BỘ KHOÁ HỌC SYSTEM DESIGN VUI VẺ
 * 30 chương ~ 300 trang nội dung
 * ========================================================= */

window.CHAPTERS = window.CHAPTERS || [];
const _PART1 = [

  /* ============================================================
   * PHẦN 1: NHẬP MÔN VUI VẺ
   * ============================================================ */

  {
    group: "🌱 Phần 1: Nhập môn vui vẻ",
    icon: "🎬",
    title: "Chương 1: System Design là gì? (Phở vs MasterChef)",
    content: `
<h1>Chương 1: System Design là gì?</h1>
<p class="subtitle">Tại sao học System Design lại giống như đi ăn phở? 🍜</p>

<h2>🤔 Đặt vấn đề</h2>
<p>Tưởng tượng bạn mở một quán <strong>phở vỉa hè</strong>. Mỗi ngày 20 khách - bạn một mình nấu, bưng bê, rửa bát, thu tiền. Êm xuôi!</p>
<p>Rồi một hôm... TikToker review quán bạn. <strong>2000 khách</strong> kéo đến. Đứt!</p>
<p>System Design chính là môn học giúp bạn trả lời câu hỏi: <em>"Làm sao quán phở của tôi phục vụ được 2000 khách mỗi ngày mà không sụp?"</em></p>

<div class="callout fun">
  <div class="callout-title">🎯 Định nghĩa kiểu vui</div>
  <p><strong>System Design</strong> = nghệ thuật biến quán phở vỉa hè thành chuỗi <em>Phở 24</em> mà chất lượng tô phở vẫn không đổi.</p>
</div>

<h2>🍜 So sánh trực quan</h2>
<table>
  <tr><th>Quán phở</th><th>Hệ thống phần mềm</th></tr>
  <tr><td>Khách hàng</td><td>User / Client</td></tr>
  <tr><td>Đầu bếp</td><td>Server / Backend</td></tr>
  <tr><td>Tô phở</td><td>Response</td></tr>
  <tr><td>Đơn order</td><td>Request</td></tr>
  <tr><td>Tủ lạnh nguyên liệu</td><td>Database</td></tr>
  <tr><td>Sổ ghi món hôm nay</td><td>Cache</td></tr>
  <tr><td>Anh bưng bê</td><td>Load Balancer</td></tr>
  <tr><td>Nhiều chi nhánh</td><td>Horizontal Scaling</td></tr>
</table>

<h2>📚 Những thứ bạn sẽ học</h2>
<div class="cards">
  <div class="card"><div class="emoji">⚖️</div><h4>Scalability</h4><p>Mở rộng hệ thống khi user tăng từ 100 → 100 triệu.</p></div>
  <div class="card"><div class="emoji">🛡️</div><h4>Reliability</h4><p>Không sập dù bị TikTok viral lúc 3h sáng.</p></div>
  <div class="card"><div class="emoji">⚡</div><h4>Performance</h4><p>Tô phở ra trong 1 giây thay vì 1 phút.</p></div>
  <div class="card"><div class="emoji">💰</div><h4>Cost</h4><p>Lời nhiều, server chi phí ít.</p></div>
</div>

<h2>🎯 Tại sao quan trọng?</h2>
<ul>
  <li><strong>Phỏng vấn senior:</strong> Big Tech (FAANG) luôn có vòng System Design Interview.</li>
  <li><strong>Tăng lương:</strong> Junior fix bug, Senior thiết kế hệ thống. Lương khác xa!</li>
  <li><strong>Tránh "đứt tay":</strong> Code chạy được ≠ chạy ở quy mô lớn được.</li>
</ul>

<h2>📖 Ví dụ thực tế</h2>
<p>Bạn xây app <code>chat</code>. Code chạy ngon trên máy bạn. Bạn deploy lên 1 server. 10 người dùng - ổn. 1 triệu người dùng cùng lúc gửi tin - server <strong>cháy</strong>.</p>
<pre><code>// Code chạy local: OK
function sendMessage(msg) {
  db.insert(msg);   // Một DB, một server
  notify(msg);      // Đẩy realtime
}

// Khi có 1 triệu user cùng nhấn gửi?
// → DB nghẽn, server CPU 100%, message bay mất 😱</code></pre>

<div class="callout tip">
  <div class="callout-title">💡 Bí kíp</div>
  <p>Không có hệ thống nào "hoàn hảo". Mọi thiết kế đều là <strong>trade-off</strong> (đánh đổi). Bạn chọn nhanh hay chính xác? Rẻ hay bền? Đơn giản hay linh hoạt?</p>
</div>

<h2>🧠 Quiz nhỏ</h2>
<div class="quiz">
  <div class="quiz-question">Câu hỏi: Anh bưng bê trong quán phở tương đương thành phần nào trong hệ thống?</div>
  <div class="quiz-options">
    <div class="quiz-option" data-correct="false">Database</div>
    <div class="quiz-option" data-correct="true">Load Balancer</div>
    <div class="quiz-option" data-correct="false">Cache</div>
    <div class="quiz-option" data-correct="false">CDN</div>
  </div>
</div>

<h2>🚀 Kết</h2>
<p>Chương sau ta sẽ học về <strong>Client - Server</strong> - cặp đôi nguyên thuỷ làm nên Internet. Đeo dây an toàn nhé! 🎢</p>
`
  },

  /* ---------------------------------------------------------- */

  {
    group: "🌱 Phần 1: Nhập môn vui vẻ",
    icon: "📱",
    title: "Chương 2: Mô hình Client-Server (Người yêu xa)",
    content: `
<h1>Chương 2: Client - Server</h1>
<p class="subtitle">Như cặp người yêu xa: nhắn tin, đợi trả lời, mong nhanh 💕</p>

<h2>💌 Câu chuyện</h2>
<p>Bạn (Client - <em>người yêu ở Hà Nội</em>) muốn biết người yêu (Server - <em>ở Sài Gòn</em>) hôm nay ăn gì.</p>
<ol>
  <li>Bạn gửi tin nhắn: <em>"Anh ăn gì rồi?"</em> → đây là <strong>Request</strong>.</li>
  <li>Người yêu nhận, suy nghĩ, trả lời.</li>
  <li>Tin trả lời: <em>"Anh ăn cơm tấm"</em> → đây là <strong>Response</strong>.</li>
</ol>

<div class="diagram">
<svg viewBox="0 0 500 140" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="40" width="120" height="60" rx="10" fill="#ff5e7a"/>
  <text x="80" y="75" text-anchor="middle" fill="white" font-weight="700">📱 Client</text>
  <rect x="360" y="40" width="120" height="60" rx="10" fill="#6c5ce7"/>
  <text x="420" y="75" text-anchor="middle" fill="white" font-weight="700">🖥️ Server</text>
  <line x1="140" y1="60" x2="360" y2="60" stroke="#00d2a8" stroke-width="2" marker-end="url(#a)"/>
  <line x1="360" y1="85" x2="140" y2="85" stroke="#f9a826" stroke-width="2" marker-end="url(#a)"/>
  <text x="250" y="55" text-anchor="middle" font-size="12" fill="#00d2a8">Request →</text>
  <text x="250" y="105" text-anchor="middle" font-size="12" fill="#f9a826">← Response</text>
  <defs><marker id="a" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="currentColor"/></marker></defs>
</svg>
<div class="diagram-caption">Hình 2.1: Client gửi Request, Server trả Response</div>
</div>

<h2>🧩 Các thành phần chính</h2>
<h3>1. Client</h3>
<p>Là <em>người gửi yêu cầu</em>. Có thể là:</p>
<ul>
  <li>Trình duyệt (Chrome, Safari)</li>
  <li>App điện thoại (TikTok, Zalo)</li>
  <li>Máy tính cá nhân, smart TV, tủ lạnh thông minh 🤯</li>
</ul>

<h3>2. Server</h3>
<p>Là <em>người trả lời</em>. Thực chất là máy tính (mạnh) chạy 24/7 ở data center.</p>

<h3>3. Network (Internet)</h3>
<p>"Đường dây" giữa hai bên. Tin nhắn không bay thẳng đâu nhé - nó nhảy qua <strong>hàng chục router</strong> mới tới đích.</p>

<h2>🌐 HTTP - Ngôn ngữ giữa Client và Server</h2>
<p>HTTP là giao thức quy định cách viết tin nhắn. Giống như SMS có cú pháp <code>To: + Body</code>, HTTP cũng có:</p>
<pre><code>GET /users/123 HTTP/1.1
Host: facebook.com
Accept: application/json

---
HTTP/1.1 200 OK
Content-Type: application/json

{ "id": 123, "name": "Tèo" }</code></pre>

<h2>🎭 Các HTTP Method - "Cảm xúc tin nhắn"</h2>
<table>
  <tr><th>Method</th><th>Ý nghĩa</th><th>Ví dụ đời sống</th></tr>
  <tr><td><code>GET</code></td><td>Lấy dữ liệu</td><td>"Anh ăn gì rồi?"</td></tr>
  <tr><td><code>POST</code></td><td>Tạo mới</td><td>"Em vừa mua váy mới ❤️"</td></tr>
  <tr><td><code>PUT</code></td><td>Cập nhật toàn bộ</td><td>"Em đổi số điện thoại"</td></tr>
  <tr><td><code>PATCH</code></td><td>Cập nhật một phần</td><td>"Em đổi avatar"</td></tr>
  <tr><td><code>DELETE</code></td><td>Xoá</td><td>"Chia tay đi 💔"</td></tr>
</table>

<h2>💻 Code ví dụ - Server tối giản (Node.js)</h2>
<pre><code>const http = require('http');

const server = http.createServer((req, res) => {
  // req = Request từ client (người yêu)
  // res = Response trả về (tin nhắn của bạn)
  if (req.url === '/an-gi') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ mon: 'Cơm tấm sườn 🍱' }));
  } else {
    res.writeHead(404);
    res.end('Không tìm thấy 😢');
  }
});

server.listen(3000, () => console.log('Server chạy ở cổng 3000'));</code></pre>

<h2>📲 Code Client gọi server (JavaScript)</h2>
<pre><code>// "Soạn tin nhắn" gửi server
fetch('http://localhost:3000/an-gi')
  .then(res => res.json())
  .then(data => console.log('Người yêu ăn:', data.mon));

// Output: Người yêu ăn: Cơm tấm sườn 🍱</code></pre>

<h2>🚦 Status Code - "Sắc thái phản hồi"</h2>
<div class="cards">
  <div class="card"><div class="emoji">✅</div><h4>2xx Thành công</h4><p><code>200 OK</code> - "Ăn cơm tấm" - mọi thứ ngon lành.</p></div>
  <div class="card"><div class="emoji">↪️</div><h4>3xx Chuyển hướng</h4><p><code>301</code> - "Anh dời nhà rồi qua địa chỉ mới đi".</p></div>
  <div class="card"><div class="emoji">🤦</div><h4>4xx Lỗi từ Client</h4><p><code>404</code> - "Không có món đó", <code>401</code> - "Em là ai?".</p></div>
  <div class="card"><div class="emoji">💥</div><h4>5xx Lỗi Server</h4><p><code>500</code> - "Anh đang ngất, tí trả lời".</p></div>
</div>

<div class="callout warn">
<div class="callout-title">⚠️ Hiểu lầm thường gặp</div>
<p>Server <strong>không phải</strong> một con máy bí ẩn ở thiên đàng. Nó cũng là máy tính như laptop của bạn, chỉ là chạy 24/7 và mạnh hơn.</p>
</div>

<h2>🧠 Quiz</h2>
<div class="quiz">
<div class="quiz-question">Khi bạn nhấn "Like" trên Facebook, browser gửi method nào?</div>
<div class="quiz-options">
  <div class="quiz-option" data-correct="false">GET</div>
  <div class="quiz-option" data-correct="true">POST</div>
  <div class="quiz-option" data-correct="false">DELETE</div>
  <div class="quiz-option" data-correct="false">OPTIONS</div>
</div>
</div>
`
  },

  /* ---------------------------------------------------------- */

  {
    group: "🌱 Phần 1: Nhập môn vui vẻ",
    icon: "🌐",
    title: "Chương 3: IP, DNS, HTTP - Bưu điện Internet",
    content: `
<h1>Chương 3: IP, DNS & HTTP</h1>
<p class="subtitle">Internet hoạt động giống bưu điện ngày xưa 📮</p>

<h2>📮 Câu chuyện gửi thư</h2>
<p>Ngày xưa, để gửi thư bạn cần:</p>
<ul>
  <li><strong>Địa chỉ nhà người nhận</strong> (số nhà, tên đường, phường, quận) - giống <strong>IP</strong>.</li>
  <li><strong>Danh bạ điện thoại</strong> (tra tên Tèo → số 0905...) - giống <strong>DNS</strong>.</li>
  <li><strong>Phong bì, format thư</strong> - giống <strong>HTTP</strong>.</li>
</ul>

<h2>🏠 IP Address - "Số nhà"</h2>
<p>Mỗi thiết bị nối Internet có 1 địa chỉ duy nhất, gọi là IP. Ví dụ:</p>
<pre><code>IPv4: 142.250.196.110     ← google.com
IPv6: 2404:6800:4007:80c::200e</code></pre>

<p>Nhưng ai mà nhớ số 142.250.196.110 mỗi lần vào Google? → Cần <strong>DNS</strong>.</p>

<h2>📞 DNS - "Danh bạ Internet"</h2>
<p>DNS = Domain Name System. Bạn gõ <code>google.com</code>, DNS dịch ra IP <code>142.250.196.110</code>.</p>

<div class="diagram">
<svg viewBox="0 0 600 200" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="80" width="100" height="50" rx="8" fill="#ff5e7a"/>
  <text x="70" y="110" text-anchor="middle" fill="white" font-size="13" font-weight="700">Bạn 🧑</text>

  <rect x="180" y="20" width="120" height="50" rx="8" fill="#6c5ce7"/>
  <text x="240" y="50" text-anchor="middle" fill="white" font-size="13" font-weight="700">Root DNS 🌳</text>

  <rect x="180" y="80" width="120" height="50" rx="8" fill="#6c5ce7"/>
  <text x="240" y="110" text-anchor="middle" fill="white" font-size="13" font-weight="700">.com DNS</text>

  <rect x="180" y="140" width="120" height="50" rx="8" fill="#6c5ce7"/>
  <text x="240" y="170" text-anchor="middle" fill="white" font-size="13" font-weight="700">google.com DNS</text>

  <rect x="380" y="80" width="200" height="50" rx="8" fill="#00d2a8"/>
  <text x="480" y="110" text-anchor="middle" fill="white" font-size="13" font-weight="700">Google Server (142.250...)</text>

  <text x="150" y="50" font-size="11" fill="#5a5a72">"google.com?"</text>
</svg>
<div class="diagram-caption">Hình 3.1: DNS resolve - hỏi qua nhiều tầng</div>
</div>

<h3>Quá trình DNS lookup</h3>
<ol>
  <li>Bạn gõ <code>google.com</code> → trình duyệt hỏi <strong>DNS Resolver</strong> (thường là của ISP, hoặc 8.8.8.8 của Google).</li>
  <li>Resolver hỏi <strong>Root DNS</strong>: "ai quản .com?"</li>
  <li>Root chỉ: "hỏi <code>.com</code> DNS đi".</li>
  <li>Resolver hỏi <code>.com</code> DNS: "ai quản google.com?"</li>
  <li>Tới <strong>Authoritative DNS</strong> của google → trả về IP thật.</li>
  <li>Resolver cache lại để lần sau khỏi hỏi.</li>
</ol>

<div class="callout tip">
<div class="callout-title">💡 Mẹo nhỏ</div>
<p>Trong terminal, gõ <code>nslookup google.com</code> hoặc <code>dig google.com</code> để xem DNS resolution thật sự!</p>
</div>

<h2>📜 HTTP - Format thư</h2>
<p>Khi đã có IP, browser mở kết nối TCP đến IP đó, sau đó gửi HTTP request.</p>

<pre><code>GET /search?q=phở HTTP/1.1
Host: google.com
User-Agent: Chrome/120
Accept: text/html
Cookie: session=abc123

---
HTTP/1.1 200 OK
Content-Type: text/html
Content-Length: 5234

&lt;!DOCTYPE html&gt;
&lt;html&gt;...&lt;/html&gt;</code></pre>

<h2>🔒 HTTPS - Thư có dấu niêm phong</h2>
<p>HTTPS = HTTP + TLS (mã hoá). Đảm bảo:</p>
<ul>
  <li><strong>Confidentiality</strong>: Người khác đọc trộm không hiểu.</li>
  <li><strong>Integrity</strong>: Không bị sửa giữa đường.</li>
  <li><strong>Authenticity</strong>: Đúng là google.com, không phải web giả.</li>
</ul>

<h2>🔧 Code: Server Express trả HTML</h2>
<pre><code>const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('&lt;h1&gt;Chào mừng tới web phở! 🍜&lt;/h1&gt;');
});

app.get('/api/menu', (req, res) => {
  res.json([
    { ten: 'Phở bò', gia: 50000 },
    { ten: 'Phở gà', gia: 45000 }
  ]);
});

app.listen(3000);</code></pre>

<h2>🎮 Hành trình một URL</h2>
<ol>
  <li>Bạn gõ <code>https://facebook.com</code></li>
  <li>Browser kiểm tra <strong>cache DNS</strong> → chưa có.</li>
  <li>Hỏi DNS Resolver → ra IP <code>157.240.22.35</code>.</li>
  <li>Browser mở TCP đến IP đó (port 443 cho HTTPS).</li>
  <li>TLS handshake (trao đổi khoá mã hoá).</li>
  <li>Gửi HTTP GET request.</li>
  <li>Server trả HTML.</li>
  <li>Browser render. Bạn thấy newsfeed 🎉</li>
</ol>

<div class="callout fun">
<div class="callout-title">😆 Vui</div>
<p>Khi web load lâu, đừng quát ISP. Có thể: DNS chậm, server xa, server bị viral đang nghẽn, hoặc... wifi nhà bạn 😅</p>
</div>
`
  },

  /* ---------------------------------------------------------- */

  {
    group: "🌱 Phần 1: Nhập môn vui vẻ",
    icon: "📡",
    title: "Chương 4: TCP, UDP & WebSocket (Bồ câu vs Loa phường)",
    content: `
<h1>Chương 4: TCP, UDP, WebSocket</h1>
<p class="subtitle">3 cách "giao tiếp" trên Internet 📡</p>

<h2>🕊️ TCP - Bồ câu đưa thư có biên nhận</h2>
<p>TCP đảm bảo: <strong>thư đến đúng thứ tự, đầy đủ, không mất</strong>. Trước khi gửi, hai bên phải "bắt tay" 3 lần (3-way handshake):</p>

<div class="diagram">
<svg viewBox="0 0 500 180" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="20" width="100" height="40" rx="8" fill="#ff5e7a"/>
  <text x="70" y="45" text-anchor="middle" fill="white" font-weight="700">Client</text>
  <rect x="380" y="20" width="100" height="40" rx="8" fill="#6c5ce7"/>
  <text x="430" y="45" text-anchor="middle" fill="white" font-weight="700">Server</text>
  <line x1="120" y1="70" x2="380" y2="80" stroke="#00d2a8" stroke-width="2"/>
  <text x="250" y="68" text-anchor="middle" font-size="11" fill="#00d2a8">1. SYN (xin chào)</text>
  <line x1="380" y1="100" x2="120" y2="110" stroke="#f9a826" stroke-width="2"/>
  <text x="250" y="98" text-anchor="middle" font-size="11" fill="#f9a826">2. SYN-ACK (chào lại)</text>
  <line x1="120" y1="130" x2="380" y2="140" stroke="#00d2a8" stroke-width="2"/>
  <text x="250" y="128" text-anchor="middle" font-size="11" fill="#00d2a8">3. ACK (ok bắt đầu)</text>
</svg>
<div class="diagram-caption">3-way handshake của TCP</div>
</div>

<h3>Đặc điểm TCP</h3>
<ul>
  <li>✅ <strong>Reliable</strong>: gói tin mất sẽ gửi lại.</li>
  <li>✅ <strong>Ordered</strong>: thư số 1 đến trước thư số 2.</li>
  <li>❌ Chậm hơn UDP do overhead.</li>
  <li>Dùng cho: HTTP, email, FTP, ssh.</li>
</ul>

<h2>📢 UDP - Loa phường "fire and forget"</h2>
<p>UDP gửi gói tin và... thôi! Không cần biết bên kia có nhận hay không. Như loa phường: phát đi, ai nghe được thì nghe.</p>
<ul>
  <li>⚡ <strong>Cực nhanh</strong>, ít overhead.</li>
  <li>❌ Có thể mất gói, sai thứ tự.</li>
  <li>Dùng cho: video call, game online, DNS, streaming live.</li>
</ul>

<div class="callout fun">
<div class="callout-title">🎮 Vì sao game dùng UDP?</div>
<p>Vì trong game bắn súng, vị trí địch ở giây thứ 5 quan trọng hơn giây thứ 3. Mất gói cũ - kệ, gửi gói mới đi! Nếu dùng TCP thì game lag giật ngay.</p>
</div>

<h2>🔌 WebSocket - Đường dây nóng 24/7</h2>
<p>HTTP truyền thống = <em>"hỏi xong cúp máy"</em>. WebSocket = <em>"giữ máy luôn, nói bất cứ lúc nào"</em>.</p>

<pre><code>// Client
const ws = new WebSocket('wss://chat.example.com');

ws.onopen = () => ws.send('Xin chào!');
ws.onmessage = (e) => console.log('Server:', e.data);

// Server có thể chủ động gửi xuống client
// Lý tưởng cho: chat realtime, notification, stock price, game</code></pre>

<h2>📊 So sánh</h2>
<table>
  <tr><th>Tiêu chí</th><th>TCP</th><th>UDP</th><th>WebSocket</th></tr>
  <tr><td>Tin cậy</td><td>Cao</td><td>Thấp</td><td>Cao (trên TCP)</td></tr>
  <tr><td>Tốc độ</td><td>Trung bình</td><td>Nhanh</td><td>Nhanh sau khi kết nối</td></tr>
  <tr><td>Hai chiều realtime</td><td>Không tự nhiên</td><td>Không</td><td>Có ✅</td></tr>
  <tr><td>Ứng dụng</td><td>HTTP, Email</td><td>Game, Voice</td><td>Chat, Live data</td></tr>
</table>

<h2>💬 Khi nào dùng cái nào?</h2>
<div class="cards">
  <div class="card"><div class="emoji">📩</div><h4>Email</h4><p>TCP - không thể mất chữ.</p></div>
  <div class="card"><div class="emoji">📺</div><h4>YouTube Live</h4><p>UDP - thà mất 1 frame còn hơn giật.</p></div>
  <div class="card"><div class="emoji">💬</div><h4>Messenger</h4><p>WebSocket - tin nhắn đến tức thì.</p></div>
  <div class="card"><div class="emoji">📈</div><h4>Sàn chứng khoán</h4><p>WebSocket - giá nhảy mỗi mili giây.</p></div>
</div>
`
  },

  /* ============================================================
   * PHẦN 2: KIẾN THỨC NỀN
   * ============================================================ */

  {
    group: "🧱 Phần 2: Kiến thức nền",
    icon: "🗄️",
    title: "Chương 5: Database - Tủ lạnh của hệ thống",
    content: `
<h1>Chương 5: Database</h1>
<p class="subtitle">Tủ lạnh khổng lồ chứa "nguyên liệu" của cả hệ thống 🧊</p>

<h2>🧊 Liên tưởng</h2>
<p>Database = tủ lạnh. Đầu bếp (server) lấy thịt bò ra nấu phở (xử lý yêu cầu). Tủ lạnh càng to, càng tổ chức gọn, càng nhanh.</p>

<h2>📚 Hai trường phái lớn</h2>

<h3>1. SQL (Relational) - Excel "có kỷ luật"</h3>
<p>Dữ liệu thành bảng có hàng cột rõ ràng. Có quan hệ giữa các bảng (foreign key).</p>
<pre><code>-- Bảng users
| id | name | age |
|----|------|-----|
| 1  | Tèo  | 25  |
| 2  | Tý   | 30  |

-- Bảng orders
| id | user_id | total  |
|----|---------|--------|
| 1  | 1       | 50000  |
| 2  | 1       | 75000  |

-- Query JOIN
SELECT u.name, o.total
FROM users u JOIN orders o ON u.id = o.user_id;</code></pre>

<p><strong>Đại diện:</strong> MySQL, PostgreSQL, SQL Server, Oracle.</p>

<h3>2. NoSQL - "Tự do bay nhảy"</h3>
<p>Linh hoạt schema, dễ scale ngang. Có nhiều loại:</p>
<div class="cards">
  <div class="card"><div class="emoji">📄</div><h4>Document</h4><p>MongoDB - lưu JSON.</p></div>
  <div class="card"><div class="emoji">🔑</div><h4>Key-Value</h4><p>Redis, DynamoDB.</p></div>
  <div class="card"><div class="emoji">📊</div><h4>Column</h4><p>Cassandra - hàng triệu cột.</p></div>
  <div class="card"><div class="emoji">🕸️</div><h4>Graph</h4><p>Neo4j - quan hệ phức tạp.</p></div>
</div>

<h2>🆚 SQL vs NoSQL</h2>
<table>
  <tr><th></th><th>SQL</th><th>NoSQL</th></tr>
  <tr><td>Schema</td><td>Cố định</td><td>Linh hoạt</td></tr>
  <tr><td>ACID</td><td>Mạnh</td><td>Eventually consistent</td></tr>
  <tr><td>Scale</td><td>Vertical (mua máy mạnh hơn)</td><td>Horizontal (thêm máy)</td></tr>
  <tr><td>Use case</td><td>Bank, ERP</td><td>Social, IoT, Big Data</td></tr>
</table>

<h2>⚛️ ACID - Bộ tứ vĩ đại</h2>
<ul>
  <li><strong>A</strong>tomicity: Cả gói hoặc không gì cả (chuyển tiền: trừ A & cộng B đồng thời).</li>
  <li><strong>C</strong>onsistency: Dữ liệu luôn hợp lệ theo rule.</li>
  <li><strong>I</strong>solation: Giao dịch không "đụng" nhau.</li>
  <li><strong>D</strong>urability: Đã commit thì không mất.</li>
</ul>

<h2>🔍 Index - "Mục lục sách"</h2>
<p>Tìm "Phở" trong sách 1000 trang: lật từng trang mất giờ. Có mục lục → mở phát ra.</p>
<pre><code>-- Không có index: full table scan 😱
SELECT * FROM users WHERE email = 'teo@gmail.com';

-- Tạo index
CREATE INDEX idx_email ON users(email);

-- Bây giờ nhanh 1000 lần ⚡</code></pre>

<div class="callout warn">
<div class="callout-title">⚠️ Index không phải free</div>
<p>Mỗi index thêm = bảng nặng hơn, INSERT/UPDATE chậm hơn. Chỉ index column hay được query.</p>
</div>

<h2>📦 Ví dụ thực tế: Thiết kế DB cho app Phở</h2>
<pre><code>users (id, name, email, phone, created_at)
restaurants (id, name, address, rating)
menus (id, restaurant_id, dish_name, price)
orders (id, user_id, restaurant_id, total, status, created_at)
order_items (id, order_id, menu_id, quantity)</code></pre>

<h2>🧠 Quiz</h2>
<div class="quiz">
<div class="quiz-question">Bạn xây Instagram - lưu post, like, comment. Nên dùng?</div>
<div class="quiz-options">
  <div class="quiz-option" data-correct="false">Chỉ MySQL</div>
  <div class="quiz-option" data-correct="false">Chỉ MongoDB</div>
  <div class="quiz-option" data-correct="true">Kết hợp - SQL cho user/auth, NoSQL cho feed/like</div>
  <div class="quiz-option" data-correct="false">Excel file</div>
</div>
</div>
`
  },

  /* ---------------------------------------------------------- */

  {
    group: "🧱 Phần 2: Kiến thức nền",
    icon: "⚡",
    title: "Chương 6: Cache - Sổ tay đầu bếp",
    content: `
<h1>Chương 6: Caching</h1>
<p class="subtitle">Tốc độ là vua 👑 - Cache là vũ khí tối thượng</p>

<h2>📓 Câu chuyện đầu bếp</h2>
<p>Đầu bếp mỗi lần khách hỏi giá → chạy vào kho tra sổ kế toán → 5 phút sau mới trả lời. Khách bực!</p>
<p>Giải pháp: ghi <strong>menu giá</strong> vào sổ tay nhỏ trong túi. Hỏi cái → đáp ngay 1 giây!</p>

<h2>💡 Cache là gì?</h2>
<p>Cache = bộ nhớ tạm, gần CPU/User hơn, lưu data hay dùng để tránh truy vấn DB chậm.</p>

<div class="diagram">
<svg viewBox="0 0 600 120" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="40" width="80" height="50" rx="8" fill="#ff5e7a"/>
  <text x="60" y="70" text-anchor="middle" fill="white" font-size="12">User</text>
  <rect x="140" y="40" width="80" height="50" rx="8" fill="#6c5ce7"/>
  <text x="180" y="70" text-anchor="middle" fill="white" font-size="12">App</text>
  <rect x="260" y="40" width="80" height="50" rx="8" fill="#f9a826"/>
  <text x="300" y="70" text-anchor="middle" fill="white" font-size="12">Cache ⚡</text>
  <rect x="380" y="40" width="80" height="50" rx="8" fill="#00d2a8"/>
  <text x="420" y="70" text-anchor="middle" fill="white" font-size="12">DB 🗄️</text>
  <line x1="100" y1="65" x2="140" y2="65" stroke="#5a5a72" stroke-width="2"/>
  <line x1="220" y1="65" x2="260" y2="65" stroke="#5a5a72" stroke-width="2"/>
  <line x1="340" y1="65" x2="380" y2="65" stroke="#5a5a72" stroke-width="2" stroke-dasharray="4"/>
  <text x="360" y="38" font-size="10" fill="#5a5a72">(miss → DB)</text>
</svg>
<div class="diagram-caption">Cache đứng trước DB</div>
</div>

<h2>🎯 Vì sao cần Cache?</h2>
<table>
  <tr><th>Storage</th><th>Tốc độ truy xuất</th></tr>
  <tr><td>CPU L1 Cache</td><td>~1 ns</td></tr>
  <tr><td>RAM</td><td>~100 ns</td></tr>
  <tr><td>SSD</td><td>~100 µs</td></tr>
  <tr><td>HDD</td><td>~10 ms</td></tr>
  <tr><td>Network (cùng datacenter)</td><td>~0.5 ms</td></tr>
  <tr><td>Network (qua đại dương)</td><td>~150 ms</td></tr>
</table>
<p>RAM nhanh hơn HDD <strong>100,000 lần</strong>! → Cache trong RAM = vũ khí siêu.</p>

<h2>🛠️ Redis - Vua cache</h2>
<pre><code>// Pseudo code
function getUser(id) {
  // 1. Thử cache trước
  let user = redis.get('user:' + id);
  if (user) return JSON.parse(user); // HIT 🎉

  // 2. Miss → query DB
  user = db.query('SELECT * FROM users WHERE id=?', id);

  // 3. Lưu cache cho lần sau (TTL 1 giờ)
  redis.set('user:' + id, JSON.stringify(user), 'EX', 3600);
  return user;
}</code></pre>

<h2>🔄 Cache strategies</h2>
<h3>1. Cache-aside (Lazy loading)</h3>
<p>Như ví dụ trên: app tự lo cache. Miss thì load DB rồi set cache.</p>

<h3>2. Write-through</h3>
<p>Mỗi lần ghi DB cũng ghi cache. Cache luôn fresh nhưng write chậm.</p>

<h3>3. Write-back</h3>
<p>Ghi cache trước, sau đó async ghi DB. Nhanh, nhưng nguy cơ mất data nếu cache crash.</p>

<h3>4. CDN cache</h3>
<p>Cache file tĩnh (ảnh, video, JS) ở edge gần user.</p>

<h2>♻️ Eviction policy - Khi cache đầy</h2>
<ul>
  <li><strong>LRU</strong> (Least Recently Used): Xoá thứ lâu không dùng - phổ biến nhất.</li>
  <li><strong>LFU</strong> (Least Frequently Used): Xoá thứ ít dùng.</li>
  <li><strong>FIFO</strong>: Vào trước ra trước.</li>
  <li><strong>TTL</strong>: Hết hạn thì xoá.</li>
</ul>

<h2>🚨 Cache problems</h2>
<div class="cards">
  <div class="card"><div class="emoji">🌨️</div><h4>Thundering herd</h4><p>1000 request cùng miss → đập vào DB.</p></div>
  <div class="card"><div class="emoji">🎭</div><h4>Stale data</h4><p>Data cũ hơn DB - phải invalidate đúng cách.</p></div>
  <div class="card"><div class="emoji">💥</div><h4>Cache penetration</h4><p>Query key không tồn tại → luôn miss.</p></div>
  <div class="card"><div class="emoji">🌋</div><h4>Cache avalanche</h4><p>Nhiều key hết hạn cùng lúc.</p></div>
</div>

<div class="callout tip">
<div class="callout-title">💡 Best practice</div>
<p>Cache chỉ dữ liệu đọc nhiều, ít đổi (user profile, top sản phẩm). Đừng cache dữ liệu real-time (giá chứng khoán mili giây).</p>
</div>
`
  },

  /* ---------------------------------------------------------- */

  {
    group: "🧱 Phần 2: Kiến thức nền",
    icon: "⚖️",
    title: "Chương 7: Load Balancer - Anh dắt mối",
    content: `
<h1>Chương 7: Load Balancer</h1>
<p class="subtitle">Người đứng cổng quán "anh ngồi bàn 2 đi, bàn 1 đông rồi" 🪑</p>

<h2>🪑 Câu chuyện</h2>
<p>Quán phở có 5 đầu bếp. Bạn cần một anh đứng cổng phân khách:</p>
<ul>
  <li>Bàn 1 đang đông → đẩy khách qua bàn 2.</li>
  <li>Bếp 3 đang ốm → bỏ qua.</li>
  <li>Khách VIP → bàn riêng.</li>
</ul>
<p>Anh đó chính là <strong>Load Balancer</strong>.</p>

<div class="diagram">
<svg viewBox="0 0 600 200" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="80" width="80" height="40" rx="8" fill="#ff5e7a"/>
  <text x="60" y="105" text-anchor="middle" fill="white" font-size="12">Users</text>
  <rect x="180" y="80" width="100" height="40" rx="8" fill="#6c5ce7"/>
  <text x="230" y="105" text-anchor="middle" fill="white" font-size="12">Load Balancer</text>
  <rect x="380" y="20" width="100" height="35" rx="8" fill="#00d2a8"/>
  <text x="430" y="42" text-anchor="middle" fill="white" font-size="12">Server 1</text>
  <rect x="380" y="80" width="100" height="35" rx="8" fill="#00d2a8"/>
  <text x="430" y="102" text-anchor="middle" fill="white" font-size="12">Server 2</text>
  <rect x="380" y="140" width="100" height="35" rx="8" fill="#00d2a8"/>
  <text x="430" y="162" text-anchor="middle" fill="white" font-size="12">Server 3</text>
  <line x1="100" y1="100" x2="180" y2="100" stroke="#5a5a72" stroke-width="2"/>
  <line x1="280" y1="100" x2="380" y2="37" stroke="#5a5a72" stroke-width="2"/>
  <line x1="280" y1="100" x2="380" y2="97" stroke="#5a5a72" stroke-width="2"/>
  <line x1="280" y1="100" x2="380" y2="157" stroke="#5a5a72" stroke-width="2"/>
</svg>
<div class="diagram-caption">Load Balancer phân phối tải đến các server</div>
</div>

<h2>🎯 Lợi ích</h2>
<ul>
  <li><strong>Scalability</strong>: Thêm server dễ dàng.</li>
  <li><strong>High Availability</strong>: 1 server chết, LB chuyển sang con khác.</li>
  <li><strong>Performance</strong>: Phân tải đều, không có "đầu bếp" quá tải.</li>
</ul>

<h2>🎲 Thuật toán phân tải</h2>
<table>
  <tr><th>Thuật toán</th><th>Ý tưởng</th><th>Ví dụ</th></tr>
  <tr><td>Round Robin</td><td>Lần lượt từng server</td><td>1 → 2 → 3 → 1 → 2 → 3</td></tr>
  <tr><td>Least Connections</td><td>Server đang ít kết nối nhất</td><td>S1: 5, S2: 2, S3: 8 → chọn S2</td></tr>
  <tr><td>Weighted Round Robin</td><td>Server mạnh nhận nhiều</td><td>S1 (16 CPU) nhận gấp 2 S2 (8 CPU)</td></tr>
  <tr><td>IP Hash</td><td>User cùng IP về cùng server</td><td>Tốt cho session sticky</td></tr>
  <tr><td>Random</td><td>Ngẫu nhiên</td><td>Đơn giản, đôi khi đủ tốt</td></tr>
</table>

<h2>🛠️ Loại LB</h2>
<h3>Layer 4 (Transport - TCP/UDP)</h3>
<p>Phân tải dựa trên IP + Port. Nhanh, nhưng không "hiểu" HTTP.</p>
<p>Ví dụ: <code>HAProxy</code>, AWS Network LB.</p>

<h3>Layer 7 (Application - HTTP)</h3>
<p>Hiểu URL, Header, Cookie. Có thể route <code>/api</code> qua server A, <code>/admin</code> qua server B.</p>
<p>Ví dụ: <code>Nginx</code>, AWS Application LB.</p>

<h2>📝 Cấu hình Nginx ví dụ</h2>
<pre><code>upstream backend {
  least_conn;
  server 10.0.0.1:3000 weight=3;
  server 10.0.0.2:3000 weight=2;
  server 10.0.0.3:3000 backup;  # backup khi 2 con kia chết
}

server {
  listen 80;
  location / {
    proxy_pass http://backend;
    proxy_set_header X-Real-IP $remote_addr;
  }
}</code></pre>

<h2>❤️ Health Check</h2>
<p>LB định kỳ "thăm khám" server. Nếu server không trả lời 3 lần → đánh dấu chết, không gửi traffic.</p>
<pre><code>upstream backend {
  server 10.0.0.1:3000 max_fails=3 fail_timeout=30s;
}</code></pre>

<h2>🍪 Sticky session</h2>
<p>Đôi khi user A cần luôn về server X (vì session lưu local). Dùng IP hash hoặc cookie để "dính".</p>

<div class="callout warn">
<div class="callout-title">⚠️ Anti-pattern</div>
<p>Đừng lưu session trong RAM của server. Hãy lưu Redis/DB shared - khi đó LB không cần sticky, scale dễ.</p>
</div>
`
  },

  /* ============================================================
   * (Tiếp tục các chương 8-30 ở file phụ vì quá dài)
   * ============================================================ */
];

window.CHAPTERS.push(..._PART1);
