const API_KEY =
  "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";

const messagesDiv = document.querySelector(".messages");
const input = document.querySelector("#input");

// ===== SYSTEM PROMPT (GỘP ĐÚNG JS) =====
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

  localStorage.setItem("chatMessages", JSON.stringify(messages));
  localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
}

// ===== LOAD LOCAL =====
const savedMessages = JSON.parse(localStorage.getItem("chatMessages")) || [];
const savedHistory = JSON.parse(localStorage.getItem("chatHistory"));

if (savedHistory) chatHistory = savedHistory;

savedMessages.forEach((msg) => {
  addMessage(msg.text, msg.role);
});

if (savedMessages.length === 0) {
  addMessage("👋 Chào bạn! Mình là AI Tư Vấn Cứ hỏi thoải mái nha!", "ai");
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
          Authorization: "Bearer " + API_KEY,
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-120b",
          messages: chatHistory,
        }),
      },
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
// ===== XOÁ CHAT =====
function clearChat() {
  localStorage.removeItem("chatMessages");
  chatHistory = [
    {
      role: "system",
      content:
        "tên bạn là AI Tư Vấn, nói chuyện thân thiện như bạn thân",
    },
  ];
  messagesDiv.innerHTML = "";
  addMessage("👋 Chào bạn! Mình là AI Tư Vấn Cứ hỏi thoải mái nha!", "ai");
}
