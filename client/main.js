import bot from "./assets/bot.svg";
import user from "./assets/user.svg";

const form = document.querySelector("form");
const chatContainer = document.querySelector("#chat_container");

let loadInterval;

//ai思考时控制。。。加载
function loader(element) {
  element.textContent = "";

  loadInterval = setInterval(() => {
    element.textContent += ".";
    if (element.textContent == "....") {
      element.textContent = "";
    }
  }, 300);
}
//控制ai输出速度
function typeText(element, text) {
  let index = 0;

  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);

      index++;
    } else {
      clearInterval(interval);
    }
  }, 20);
}

//guid
function generateUniqueId() {
  let timestamp = Date.now();
  let randomNumber = Math.random();

  return `id-${timestamp}-${randomNumber.toString(16)}`;
}

//给会话添加图标
function chatStripe(isAi, value, uniqueId) {
  return `
      <div class = "wrapper ${isAi && "ai"}">
        <div class = "profile">
          <img 
          src = "${isAi ? bot : user}"
          alt = "${isAi ? "bot" : "user"}"
          />
        </div>
        <div class = "message" id = "${uniqueId}">${value}</div>
      </div>
    `;
}

const handleSubmit = async (e) => {
  e.preventDefault();
  const data = new FormData(form);
  chatContainer.innerHTML += chatStripe(false, data.get("prompt"));
  form.reset();

  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, "hello", uniqueId);
  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);
  loader(messageDiv);

  // setTimeout(() => {
  //   clearInterval(loadInterval);
  //   typeText(messageDiv, "nihao");
  // }, 200);

  const response = await fetch("http://localhost:5000", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: data.get("prompt"),
    }),
  });
  clearInterval(loadInterval);
  messageDiv.innerHTML = "";

  if (response.ok) {
    const data = await response.json();
    const parsedData = data.bot.trim();
    typeText(messageDiv, parsedData);
  } else {
    const error = await response.text();
    messageDiv.innerHTML = "Something Went Wrong";
    alert(error);
  }
};

form.addEventListener("submit", handleSubmit);
form.addEventListener("keyup", (e) => {
  if (e.keyCode == 13) {
    handleSubmit(e);
  }
});
