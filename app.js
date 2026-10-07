// =========================================
// 현재 선택 상태
// =========================================
const state = {
  category: "전체",
  subcategory: "전체",
  pricing: "all",
  query: "",
};

// =========================================
// 화면 요소
// =========================================
const grid = document.getElementById("service-grid");
const categoryFilter = document.getElementById("category-filter");
const subcategoryFilter = document.getElementById("subcategory-filter");
const pricingFilter = document.getElementById("pricing-filter");
const searchInput = document.getElementById("search");
const resultCount = document.getElementById("result-count");
const empty = document.getElementById("empty");

// =========================================
// 도우미 함수
// =========================================

// 데이터의 글자를 HTML에 안전하게 넣기
function escapeHTML(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

// 요금 구분에 맞는 배지 색
function badgeClass(pricing) {
  if (pricing === "무료") return "badge-free";
  if (pricing === "유료") return "badge-paid";
  return "badge-mixed";
}

function listItems(items) {
  return items.map((item) => `<li>${escapeHTML(item)}</li>`).join("");
}

// =========================================
// 분야 필터 버튼
// =========================================
function renderCategoryButtons() {
  const names = ["전체", ...CATEGORIES];

  categoryFilter.innerHTML = names
    .map((name) => {
      const count = name === "전체"
        ? SERVICES.length
        : SERVICES.filter((s) => s.category === name).length;
      const active = name === state.category;

      return `
        <button type="button" class="category-btn${active ? " is-active" : ""}"
          data-category="${escapeHTML(name)}" aria-pressed="${active}">
          ${escapeHTML(name)}<span class="count">${count}</span>
        </button>`;
    })
    .join("");
}

// =========================================
// 조건에 맞는 서비스 고르기
// =========================================
function renderSubcategoryButtons() {
  const groups = STRENGTH_GROUPS[state.category];
  subcategoryFilter.hidden = !groups;
  if (!groups) {
    subcategoryFilter.innerHTML = "";
    return;
  }
  const services = SERVICES.filter(s => s.category === state.category);
  subcategoryFilter.innerHTML = ["전체", ...Object.keys(groups)].map(name => {
    const active = state.subcategory === name;
    const count = name === "전체" ? services.length
      : services.filter(s => getStrengths(s).includes(name)).length;
    return `<button type="button" class="subcategory-btn${active ? " is-active" : ""}"
      data-subcategory="${escapeHTML(name)}" aria-pressed="${active}">
      ${name === "전체" ? "강점 전체" : escapeHTML(name)} <span class="count">${count}</span>
    </button>`;
  }).join("");
}

function getFilteredServices() {
  const q = state.query.trim().toLowerCase();

  return SERVICES.filter((s) => {
    if (state.category !== "전체" && s.category !== state.category) return false;
    if (state.subcategory !== "전체" && !getStrengths(s).includes(state.subcategory)) return false;
    if (state.pricing !== "all" && s.pricing !== state.pricing) return false;
    if (!q) return true;

    const text = [s.name, s.category, s.summary, s.useCase, ...s.pros, ...getStrengths(s)].join(" ").toLowerCase();
    return text.includes(q);
  });
}

// =========================================
// 카드 한 장 만들기
//  - 위쪽(이름·요금·분야·강점): 누르면 새 탭으로 사이트 열기
//  - 아래쪽 버튼: 누르면 단점·추천 용도·월 가격 펼치기
// =========================================
function cardHTML(s) {
  const priceLines = s.price
    .map((line) => {
      const isNote = line.startsWith("※");
      return `<p${isNote ? ' class="price-note"' : ""}>${escapeHTML(line)}</p>`;
    })
    .join("");

  return `
    <article class="card">
      <${s.url ? 'a' : 'div'} class="card-link" ${s.url ? `href="${escapeHTML(s.url)}" target="_blank" rel="noopener noreferrer"` : ''}
         title="${escapeHTML(s.summary)}">
        <div class="card-top">
          <h3 class="card-name">${escapeHTML(s.name)}${s.url ? '<span class="arrow" aria-hidden="true">↗</span>' : ''}</h3>
          <span class="badge ${badgeClass(s.pricing)}">${escapeHTML(s.pricing)}</span>
        </div>
        <p class="card-summary">${escapeHTML(s.summary)}</p>
        ${s.linkNote ? `<p class="link-note">${escapeHTML(s.linkNote)}</p>` : ''}
        <div class="tags">
          <span class="tag">${escapeHTML(s.category)}</span>
          ${getStrengths(s).map(name => `<span class="tag tag-strength">${escapeHTML(name)}</span>`).join("")}
          ${s.untested ? '<span class="tag tag-review">리뷰 기반</span>' : ""}
        </div>
        <ul class="pros">${listItems(s.pros)}</ul>
        ${s.url ? '<span class="sr-only">(새 탭에서 열림)</span>' : '<span class="tag">링크 확인 불가</span>'}
      </${s.url ? 'a' : 'div'}>

      <details class="more">
        <summary>단점 · 월 가격 보기</summary>
        <div class="more-body">
          <h4>단점</h4>
          <ul class="cons">${listItems(s.cons)}</ul>

          <h4>이럴 때 추천</h4>
          <p>${escapeHTML(s.useCase)}</p>

          <h4>월 가격 (${escapeHTML(s.pricingLabel)})</h4>
          ${priceLines || "<p>공식 사이트에서 확인하세요.</p>"}
        </div>
      </details>
    </article>`;
}

// =========================================
// 카드 목록 그리기
// =========================================
function renderGrid() {
  const list = getFilteredServices();

  grid.innerHTML = list.map(cardHTML).join("");
  resultCount.textContent = `${list.length}개 서비스`;
  empty.hidden = list.length > 0;
}

function render() {
  renderCategoryButtons();
  renderSubcategoryButtons();
  renderGrid();
}

// =========================================
// 주소 끝(#영상 등)으로 분야 기억하기
// → 특정 분야 링크를 그대로 공유할 수 있음
// =========================================
function readCategoryFromHash() {
  let name = "";
  try { name = decodeURIComponent(location.hash.slice(1)); } catch { /* ??? ??? ?? ?? ?? */ }
  state.category = CATEGORIES.includes(name) ? name : "전체";
  state.subcategory = "전체";
}

function setCategory(name) {
  state.category = name;
  state.subcategory = "전체";
  const hash = name === "전체" ? "" : `#${encodeURIComponent(name)}`;
  history.replaceState(null, "", location.pathname + location.search + hash);
  render();
}

// =========================================
// 이벤트 연결
// =========================================
categoryFilter.addEventListener("click", (e) => {
  const btn = e.target.closest(".category-btn");
  if (btn) setCategory(btn.dataset.category);
});

subcategoryFilter.addEventListener("click", (e) => {
  const button = e.target.closest("[data-subcategory]");
  if (!button) return;
  state.subcategory = button.dataset.subcategory;
  renderSubcategoryButtons();
  renderGrid();
});

pricingFilter.addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip) return;

  state.pricing = chip.dataset.pricing;
  pricingFilter.querySelectorAll(".chip").forEach((c) => {
    c.classList.toggle("is-active", c === chip);
    c.setAttribute("aria-pressed", String(c === chip));
  });
  renderGrid();
});

searchInput.addEventListener("input", () => {
  state.query = searchInput.value;
  renderGrid();
});

document.getElementById("reset").addEventListener("click", () => {
  state.query = "";
  state.pricing = "all";
  searchInput.value = "";
  pricingFilter.querySelectorAll(".chip").forEach((c) => {
    c.classList.toggle("is-active", c.dataset.pricing === "all");
    c.setAttribute("aria-pressed", String(c.dataset.pricing === "all"));
  });
  setCategory("전체");
});

window.addEventListener("hashchange", () => {
  readCategoryFromHash();
  render();
});

// =========================================
// 시작
// =========================================
document.getElementById("total-count").textContent = SERVICES.length;
document.getElementById("updated-at").textContent = UPDATED_AT;
readCategoryFromHash();
render();
