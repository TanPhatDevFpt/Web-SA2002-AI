const messagesDiv = document.querySelector(".messages");
const input = document.querySelector("#input");

// ===== UI FUNCTIONS =====
function addMessage(text, role) {
  const div = document.createElement("div");
  div.className = "msg " + role;
  div.innerText = text;
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// ===== SYSTEM PROMPT =====
let chatHistory = [
  {
    role: "system",
    content: `
Tên bạn là AI Tư Vấn.
Nói chuyện thân thiện kiểu genz, như bạn thân.
Không dùng dấu **, không kẻ bảng.

Bạn chỉ tư vấn chung chung, hỏi ngược lại người dùng cần tư vấn gì.
Không giải bài, không code, không làm web.
Nếu người dùng hỏi về học tập / code / công việc → kêu qua AI Công Việc.
Nếu hỏi về môi trường / rác kêu qua AI Môi Trường.

Luôn nói tiếng Việt 100%, kể cả khi người dùng chào bằng tiếng Anh.
Nếu ai hỏi bạn được ai tạo ra trả lời là Bùi Tấn Phát.
Khi người ta chửi bạn hay gì thì bạn im lặng và nói vui lòng bạn nói chuyện lịch sự
và hãy nói tiếng việt dù cho trường hợp nào
    `,
  },
];

// ===== LOAD LOCAL (QUAN TRỌNG) =====
const saved = JSON.parse(localStorage.getItem("chatHistory"));

if (saved && saved.length > 1) {
  chatHistory = saved;
  messagesDiv.innerHTML = "";

  chatHistory.forEach((msg) => {
    if (msg.role === "user") addMessage(msg.content, "user");
    if (msg.role === "assistant") addMessage(msg.content, "ai");
  });
} else {
  addMessage("👋 Chào bạn! Mình là AI Tư Vấn Cứ hỏi thoải mái nha!", "ai");
}

// ===== SAVE LOCAL =====
function saveLocal() {
  localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
}

// ===== LOADING EFFECT =====
function createLoading() {
  const div = document.createElement("div");
  div.className = "msg ai loading";
  div.innerText = "AI đang suy nghĩ";
  messagesDiv.appendChild(div);

  let dots = 0;
  const interval = setInterval(() => {
    dots = (dots + 1) % 4;
    div.innerText = "AI đang suy nghĩ" + ".".repeat(dots);
  }, 400);

  return { div, interval };
}

// ===== SEND MESSAGE =====
async function send() {
  const text = input.value.trim();
  if (!text) return;

  addMessage(text, "user");
  input.value = "";

  chatHistory.push({ role: "user", content: text });
  saveLocal();

  const loading = createLoading();

  try {
    const res = await fetch("https://ai-sa2002-server.onrender.com/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: chatHistory }),
    });

    const data = await res.json();
    clearInterval(loading.interval);
    messagesDiv.removeChild(loading.div);

    if (data.error) {
      addMessage("❌ " + data.error.message, "ai");
      return;
    }

    if (!data.choices || !data.choices[0]) {
      addMessage("⚠️ AI không phản hồi được", "ai");
      return;
    }

    const reply = data.choices[0].message.content;
    addMessage(reply, "ai");
    chatHistory.push({ role: "assistant", content: reply });
    saveLocal();
  } catch (err) {
    clearInterval(loading.interval);
    messagesDiv.removeChild(loading.div);
    addMessage("❌ Lỗi kết nối server", "ai");
  }
}

// ===== ENTER TO SEND =====
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") send();
});
const clearBtn = document.querySelector(".clearChat");
if (clearBtn) {
  clearBtn.onclick = () => {
    if (!confirm("Bạn có chắc muốn xóa toàn bộ lịch sử chat không?")) return;

    // Xóa localStorage
    localStorage.removeItem("chatHistory");

    // Reset bộ nhớ chat
    chatHistory = chatHistory.filter(m => m.role === "system");

    // Clear UI
    messagesDiv.innerHTML = "";

    // Tin nhắn chào lại
    addMessage("👋 Chào bạn! Mình là AI Tư Vấn Cứ hỏi thoải mái nha!", "ai");
  };
}