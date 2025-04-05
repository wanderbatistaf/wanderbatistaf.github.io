function showModal(title, message) {
    const modal = document.createElement("div");
    modal.className =
      "fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50";
    modal.innerHTML = `
            <div class='bg-white p-6 rounded shadow max-w-md text-left'>
              <h2 class='text-xl font-bold mb-2'>${title}</h2>
              <p class='mb-4'>${message}</p>
              <button onclick="this.closest('div').parentElement.remove()" class='bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700'>Fechar</button>
            </div>
          `;
    document.body.appendChild(modal);
  }
  
  async function fetchLanguages(repo) {
    const response = await fetch(
      `https://api.github.com/repos/${repo}/languages`
    );
    return await response.json();
  }
  
  function formatLanguages(langData) {
    const total = Object.values(langData).reduce((a, b) => a + b, 0);
    const sorted = Object.entries(langData).sort((a, b) => b[1] - a[1]);
    return sorted.map(([lang, bytes]) => ({
      lang,
      percent: ((bytes / total) * 100).toFixed(1),
      color: getColor(lang)
    }));
  }
  
  function getColor(lang) {
    const colors = {
      Python: "bg-blue-600",
      JavaScript: "bg-yellow-400",
      TypeScript: "bg-blue-400",
      CSS: "bg-purple-500",
      SCSS: "bg-pink-500",
      HTML: "bg-orange-500",
      PHP: "bg-indigo-400",
      Dart: "bg-teal-500",
      Swift: "bg-yellow-400",
      Ruby: "bg-red-500",
      Lua: "bg-[#000080]",
      "Objective-C": "bg-orange-500",
      Other: "bg-gray-400"
    };
    return colors[lang] || "bg-gray-400";
  }
  
  function renderLanguages(container, langs) {
    const bar = langs
      .map(
        (l) => `<div class="${l.color} h-2" style="width: ${l.percent}%"></div>`
      )
      .join("");
    const list = langs
      .map(
        (l) => `
      <li><span class="inline-block w-3 h-3 rounded-full ${l.color} mr-2"></span>
      <strong>${l.lang}</strong> ${l.percent}%</li>`
      )
      .join("");
    container.innerHTML = `
      <h4 class="font-semibold mb-1 text-sm">Languages</h4>
      <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden flex">${bar}</div>
      <ul class="text-xs mt-2 text-left space-y-1">${list}</ul>`;
  }
  
  async function populateLanguages() {
    console.log("populateLanguages iniciado");
    const cards = document.querySelectorAll("[data-repo]");
    for (const card of cards) {
      const repo = card.getAttribute("data-repo");
      const langBox = card.querySelector(".languages");
      try {
        const data = await fetchLanguages(repo);
        console.log(`Dados de ${repo}:`, data);
  
        if (!data || Object.values(data).some((val) => typeof val !== "number")) {
          throw new Error("Resposta inválida da API");
        }
  
        const langs = formatLanguages(data);
        renderLanguages(langBox, langs);
      } catch (e) {
        console.error(`Erro ao carregar linguagens para ${repo}`, e);
        langBox.innerHTML = `
          <p class="text-sm text-gray-500">Linguagens não disponíveis.</p>
        `;
      }
    }
  }
  
  function nextFrame() {
    return new Promise((resolve) => requestAnimationFrame(() => resolve()));
  }
  
  document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("projetos-container");
    if (!container) {
      console.warn("#projetos-container não encontrado.");
      return;
    }
  
    const allCards = Array.from(container.children);
    const cardsComRepo = allCards.filter((el) => el.dataset.repo);
    const cardsSemRepo = allCards.filter((el) => !el.dataset.repo);
  
    const cardsComDatas = await Promise.all(
      cardsComRepo.map(async (el) => {
        const repo = el.dataset.repo;
        try {
          const res = await fetch(`https://api.github.com/repos/${repo}`);
          const data = await res.json();
          return { el, date: new Date(data.created_at) };
        } catch {
          return { el, date: new Date(0) };
        }
      })
    );
  
    cardsComDatas.sort((a, b) => b.date - a.date);
  
    container.innerHTML = "";
    cardsComDatas.forEach(({ el }) => container.appendChild(el));
    cardsSemRepo.forEach((el) => container.appendChild(el));
  
    await nextFrame();
    await populateLanguages();
  });
  
  function toggleLanguages(card) {
    const langSection = card.querySelector(".languages");
    langSection.classList.toggle("hidden");
  }
  
  async function fetchDevToPosts() {
    try {
      const res = await fetch(
        "https://dev.to/api/articles?username=wanderbatistaf"
      );
      const data = await res.json();
      const container = document.getElementById("devto-posts");
      data.slice(0, 3).forEach((post) => {
        const el = document.createElement("div");
        el.className = "bg-gray-50 p-6 rounded-lg shadow text-left";
        el.innerHTML = `
                <h3 class="font-semibold text-xl mb-2">${post.title}</h3>
                <p class="text-sm text-gray-600 mb-4">${post.description}</p>
                <a href="${post.url}" target="_blank" class="text-purple-600 font-semibold hover:underline">Ler artigo →</a>
              `;
        container.appendChild(el);
      });
    } catch (e) {
      console.error("Erro ao carregar posts do Dev.to", e);
    }
  }
  
  fetchDevToPosts();
  