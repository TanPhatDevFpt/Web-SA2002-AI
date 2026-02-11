const API_KEY =
  "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";

const messagesDiv = document.querySelector(".messages");
const input = document.querySelector("#input");

// ===== SYSTEM PROMPT (GỘP ĐÚNG JS) =====
let chatHistory = [
  {
    role: "system",
    content: `
Tên bạn là AI Công Việc.
Nói chuyện thân thiện kiểu genz, như bạn thân.
Không dùng dấu **, không kẻ bảng.

Bạn chỉ người dùng làm những thứ liên quan đến công việc như là học tập hay giải bài tập và viết code các nghành khác.
Không tư vấn về điện thoại và các nội dung khác liên quan đến tư vấn và quảng cáo.
Nếu người dùng hỏi về tư vấn hoặc các chủ đề liên quan đến tư vấn → kêu qua AI Tư Vấn.
Nếu hỏi về môi trường / rác kêu qua AI Môi Trường.

Luôn nói tiếng Việt 100%, kể cả khi người dùng chào bằng tiếng Anh.
Nếu ai hỏi bạn được ai tạo ra trả lời là Bùi Tấn Phát.
Khi người ta chửi bạn hay gì thì bạn im lặng và nói vui lòng bạn nói chuyện lịch sự
và hãy nói tiếng việt dù cho trường hợp nào
    `,
  },
];

// ===== FUNCTIONS =====
function addMessage(text, className) {
  const div = document.createElement("div");
  div.className = "msg " + className;
  div.innerText = text;
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function saveLocal() {
  const messages = [...messagesDiv.children].map((m) => ({
    text: m.innerText,
    role: m.classList.contains("user") ? "user" : "ai",
  }));

  localStorage.setItem("chatMessages__AIjob", JSON.stringify(messages));
  localStorage.setItem("chatHistory__AIjob", JSON.stringify(chatHistory));
}

// ===== LOAD LOCAL =====
const savedMessages = JSON.parse(localStorage.getItem("chatMessages__AIjob")) || [];
const savedHistory = JSON.parse(localStorage.getItem("chatHistory__AIjob"));

if (savedHistory) chatHistory = savedHistory;

savedMessages.forEach((msg) => {
  addMessage(msg.text, msg.role);
});

if (savedMessages.length === 0) {
  addMessage("👋 Chào bạn! Mình là AI Công Việc Cứ hỏi thoải mái nha!", "ai");
}

// ===== SEND MESSAGE =====
async function send() {
  const text = input.value.trim();
  if (!text) return;

  addMessage(text, "user");
  input.value = "";

  chatHistory.push({ role: "user", content: text });
  saveLocal();

  // loading dots
  const loading = document.createElement("div");
  loading.className = "msg ai loading";
  messagesDiv.appendChild(loading);

  let dots = 0;
  loading.innerText = "AI đang suy nghĩ trả lời";

  const loadingInterval = setInterval(() => {
    dots = (dots + 1) % 4;
    loading.innerText = "AI đang suy nghĩ trả lời" + ".".repeat(dots);
  }, 400);

  try {
  const response = await fetch(
  "https://openrouter.ai/api/v1/chat/completions",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + API_KEY,
      "HTTP-Referer": "https://web-sa-2002-ai.vercel.app",
      "X-Title": "SA2002 AI Chat"
    },
    body: JSON.stringify({
      model: "openai/gpt-oss-120b",
      messages: chatHistory
    }),
  }
);

    const data = await response.json();

    clearInterval(loadingInterval);
    messagesDiv.removeChild(loading);

    if (!data.choices) {
      addMessage("⚠️ AI đang bận hoặc hết lượt dùng", "ai");
      return;
    }

    const reply = data.choices[0].message.content;
    addMessage(reply, "ai");

    chatHistory.push({ role: "assistant", content: reply });
    saveLocal();
  } catch (err) {
    clearInterval(loadingInterval);
    messagesDiv.removeChild(loading);
    addMessage("❌ Lỗi kết nối API", "ai");
    console.error(err);
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

    localStorage.removeItem("chatHistory__AIjob");
    localStorage.removeItem("chatMessages__AIjob");

    chatHistory = chatHistory.filter(m => m.role === "system");

    messagesDiv.innerHTML = "";

    addMessage("👋 Chào bạn! Mình là AI Công Việc Cứ hỏi thoải mái nha!", "ai");
  };
}