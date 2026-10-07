// =========================================
// 현재 선택 상태
// =========================================
const state = {
  category: "전체",
  subcategory: "전체",
  pricing: "all",
  query: "",
  currency: "KRW",
  budgetMin: 0,
  budgetMax: 500000,
};

// 예산 슬라이더 (원 단위, 1,000원씩 이동)
// 최대 손잡이가 끝값에 있으면 상한 없음
const BUDGET_LIMIT = 500000;
const BUDGET_STEP = 1000;
const KRW_PER_USD = 1400;
const CURRENCY_OPTIONS = ["KRW", "USD"];

// 분야별 영문 이름·소개·아이콘 (메인 화면 꾸밈용)
const ICONS = {
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>',
  pen: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
  mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/>',
  slides: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4M7 12l3-3 3 2 4-4"/>',
  comic: '<path d="M4 5h16v10H10l-4 4v-4H4z"/><path d="M8 10h.01M12 10h.01M16 10h.01"/>',
  web: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M7 6.5h.01M10 6.5h.01"/>',
  image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 17-5-5-9 8"/>',
  video: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m10 9 5 3-5 3z"/>',
  music: '<path d="M9 18V6l11-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>',
  bolt: '<path d="M13 3 5 13.5h6L10 21l8-10.5h-6z"/>',
  all: '<rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/>',
};

const CATEGORY_META = {
  "전체": { en: "All Services", desc: "분야 상관없이 모든 AI 서비스를 한 번에 봐요.", icon: "all", tile: "dark" },
  "리서치": { en: "Research", desc: "자료 조사, 최신 정보 검색, 논문 찾기", icon: "search", tile: "orange" },
  "글쓰기": { en: "Writing", desc: "초안 작성, 긴 글 정리, 교정·요약", icon: "pen", tile: "white" },
  "녹음·회의록": { en: "Meeting Notes", desc: "녹음 받아쓰기, 회의록, 실시간 번역", icon: "mic", tile: "purple" },
  "시각화·PPT": { en: "Slides & Visual", desc: "발표 자료, 인포그래픽, 마인드맵", icon: "slides", tile: "blue" },
  "AI 만화·스토리보드": { en: "Comics & Storyboard", desc: "웹툰 컷, 캐릭터, 스토리보드", icon: "comic", tile: "orange" },
  "웹·UI/UX 디자인": { en: "Web & UI/UX", desc: "화면 초안, 프로토타입, 웹사이트 발행", icon: "web", tile: "white" },
  "이미지 생성": { en: "Image", desc: "실사·일러스트·로고·텍스트 이미지", icon: "image", tile: "purple" },
  "영상": { en: "Video", desc: "영상 생성, 이미지 → 영상, 편집 효과", icon: "video", tile: "dark" },
  "음성·음악": { en: "Voice & Music", desc: "더빙, 목소리 복제, 노래·배경음악", icon: "music", tile: "blue" },
  "업무 자동화": { en: "Automation", desc: "앱 연결, 반복 업무, AI 작업 흐름", icon: "bolt", tile: "orange" },
};

// 인기 키워드 (누르면 검색창에 입력)
const KEYWORDS = [
  { word: "회의록", badge: "HOT" }, { word: "PPT", badge: "HOT" }, { word: "논문" }, { word: "보고서" },
  { word: "실시간" }, { word: "번역", badge: "NEW" }, { word: "요약" }, { word: "마인드맵" },
  { word: "인포그래픽" }, { word: "웹툰" }, { word: "와이어프레임" }, { word: "웹사이트" },
  { word: "로고" }, { word: "일러스트" }, { word: "영상 편집", badge: "NEW" }, { word: "더빙" },
  { word: "목소리" }, { word: "배경음악" }, { word: "자동화", badge: "HOT" }, { word: "챗봇" },
];

function iconTile(name) {
  const meta = CATEGORY_META[name] || CATEGORY_META["전체"];
  return `<span class="icon-tile tile-${meta.tile}" aria-hidden="true">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[meta.icon]}</svg>
  </span>`;
}

function countIn(name) {
  return name === "전체" ? SERVICES.length : SERVICES.filter((s) => s.category === name).length;
}

// =========================================
// 화면 요소
// =========================================
const grid = document.getElementById("service-grid");
const categoryFilter = document.getElementById("category-filter");
const subcategoryFilter = document.getElementById("subcategory-filter");
const currencyFilter = document.getElementById("currency-filter");
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

// 가격 문구에서 월 요금(원)만 뽑기
//  - "※" 참고 문구와 "연 $144" 같은 연 결제 금액은 제외
//  - 달러·유로는 대략 환산 ($1 = ₩1,400, €1 = $1.1)
//  - 무료 플랜이 있으면 $0 포함
function getMonthlyPrices(service) {
  const prices = service.pricing.includes("무료") ? [0] : [];
  service.price
    .filter((line) => !line.startsWith("※"))
    .forEach((line) => {
      const text = line.replace(/\([^)]*연[^)]*\)/g, "");
      for (const m of text.matchAll(/(?<!연\s?)([$€₩])\s?([\d,]+(?:\.\d+)?)/g)) {
        let value = parseFloat(m[2].replaceAll(",", ""));
        if (m[1] === "€") value *= 1.1;
        if (m[1] !== "₩") value *= KRW_PER_USD;
        prices.push(value);
      }
    });
  return prices;
}

function toKRW(value, currency = state.currency) {
  return currency === "USD" ? value * KRW_PER_USD : value;
}

function fromKRW(value, currency = state.currency) {
  return currency === "USD" ? value / KRW_PER_USD : value;
}

function formatCurrency(value, currency = state.currency) {
  const number = Number(value) || 0;
  const formatter = currency === "USD"
    ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })
    : new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW", maximumFractionDigits: 0 });
  return formatter.format(number);
}

function getBudgetStep(currency = state.currency) {
  return currency === "USD" ? 1 : BUDGET_STEP;
}

function formatPriceLine(line, currency = state.currency) {
  if (!line) return "";
  return line.replace(/([$€₩])\s?([\d,]+(?:\.\d+)?)/g, (match, symbol, amountText) => {
    const amount = parseFloat(amountText.replaceAll(",", ""));
    const baseKRW = symbol === "₩"
      ? amount
      : symbol === "€"
        ? amount * 1.1 * KRW_PER_USD
        : amount * KRW_PER_USD;
    const targetValue = currency === "USD" ? baseKRW / KRW_PER_USD : baseKRW;
    return formatCurrency(targetValue, currency);
  });
}

// 예산 범위 안에 들어오는 플랜이 하나라도 있으면 통과
function fitsBudget(service) {
  const max = state.budgetMax >= BUDGET_LIMIT ? Infinity : state.budgetMax;
  if (state.budgetMin === 0 && max === Infinity) return true;
  return getMonthlyPrices(service).some((p) => p >= state.budgetMin && p <= max);
}

function listItems(items) {
  return items.map((item) => `<li>${escapeHTML(item)}</li>`).join("");
}

function renderCurrencyButtons() {
  currencyFilter.innerHTML = CURRENCY_OPTIONS.map((currency) => {
    const active = currency === state.currency;
    return `
      <button type="button" class="chip${active ? " is-active" : ""}"
        data-currency="${currency}" aria-pressed="${active}">
        ${currency === "KRW" ? "원화" : "달러"}
      </button>`;
  }).join("");
}

// =========================================
// 분야 필터 버튼
// =========================================
function renderCategoryButtons() {
  const names = ["전체", ...CATEGORIES];

  categoryFilter.innerHTML = names
    .map((name) => {
      const count = countIn(name);
      const active = name === state.category;

      return `
        <button type="button" class="category-btn${active ? " is-active" : ""}"
          data-category="${escapeHTML(name)}" aria-pressed="${active}">
          ${escapeHTML(name)}<span class="count">${count}</span>
        </button>`;
    })
    .join("");
}

// 메인 화면: 떠다니는 분야 아이콘
function renderNeedField() {
  document.getElementById("need-field").innerHTML = CATEGORIES.map((name) => `
    <button type="button" class="need-item" data-pick="${escapeHTML(name)}">
      ${iconTile(name)}
      <span class="need-name">${escapeHTML(CATEGORY_META[name]?.en || name)}<small>${escapeHTML(name)}</small></span>
    </button>`).join("");
}

// 메인 화면: Order Now 분야 카드
function renderOrderCards() {
  document.getElementById("order-cards").innerHTML = ["전체", ...CATEGORIES].map((name) => {
    const meta = CATEGORY_META[name] || {};
    const active = name === state.category;
    return `
      <button type="button" class="order-card${active ? " is-active" : ""}" data-pick="${escapeHTML(name)}" aria-pressed="${active}">
        <span class="order-en">${escapeHTML(meta.en || "")}</span>
        <strong class="order-name">${escapeHTML(name === "전체" ? "전체 서비스" : name)}</strong>
        <p class="order-desc">${escapeHTML(meta.desc || "")}</p>
        <span class="order-foot"><span class="order-count">${countIn(name)}개 AI</span>${iconTile(name)}</span>
      </button>`;
  }).join("");
}

function renderKeywords() {
  document.getElementById("keywords").innerHTML = KEYWORDS.map(({ word, badge }) => `
    <button type="button" class="keyword" data-keyword="${escapeHTML(word)}">
      ${escapeHTML(word)}${badge ? `<b class="${badge === "HOT" ? "hot" : ""}">${badge}</b>` : ""}
    </button>`).join("");
}

function scrollToPickup() {
  document.getElementById("pickup").scrollIntoView({ behavior: "smooth", block: "start" });
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
    if (!fitsBudget(s)) return false;
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
      return `<p${isNote ? ' class="price-note"' : ""}>${escapeHTML(formatPriceLine(line, state.currency))}</p>`;
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
  renderCurrencyButtons();
  renderCategoryButtons();
  renderOrderCards();
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

// 분야 아이콘·카드를 누르면 그 분야로 거르고 목록으로 이동
document.addEventListener("click", (e) => {
  const pick = e.target.closest("[data-pick]");
  if (pick) {
    setCategory(pick.dataset.pick);
    scrollToPickup();
    return;
  }
  const keyword = e.target.closest("[data-keyword]");
  if (keyword) {
    searchInput.value = keyword.dataset.keyword;
    state.query = keyword.dataset.keyword;
    setCategory("전체");
    scrollToPickup();
  }
});

subcategoryFilter.addEventListener("click", (e) => {
  const button = e.target.closest("[data-subcategory]");
  if (!button) return;
  state.subcategory = button.dataset.subcategory;
  renderSubcategoryButtons();
  renderGrid();
});

currencyFilter.addEventListener("click", (e) => {
  const chip = e.target.closest("[data-currency]");
  if (!chip) return;

  state.currency = chip.dataset.currency;
  currencyFilter.querySelectorAll("[data-currency]").forEach((c) => {
    c.classList.toggle("is-active", c === chip);
    c.setAttribute("aria-pressed", String(c === chip));
  });
  renderBudget();
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

// =========================================
// 월 예산 슬라이더
// =========================================
const budgetMin = document.getElementById("budget-min");
const budgetMax = document.getElementById("budget-max");
const budgetMinInput = document.getElementById("budget-min-input");
const budgetMaxInput = document.getElementById("budget-max-input");
const budgetFill = document.getElementById("budget-fill");
const budgetValue = document.getElementById("budget-value");

// 12000 → "12,000원"
function won(value) {
  return `${value.toLocaleString("ko-KR")}원`;
}

function renderBudget() {
  const { budgetMin: min, budgetMax: max } = state;
  const minDisplay = fromKRW(min, state.currency);
  const maxDisplay = fromKRW(max, state.currency);
  const limitDisplay = fromKRW(BUDGET_LIMIT, state.currency);

  const step = getBudgetStep(state.currency);
  [budgetMin, budgetMax, budgetMinInput, budgetMaxInput].forEach((el) => {
    el.max = limitDisplay;
    el.step = step;
  });
  document.querySelectorAll(".budget-unit").forEach((el) => {
    el.textContent = state.currency === "USD" ? "달러" : "원";
  });

  budgetMin.value = minDisplay;
  budgetMax.value = maxDisplay;
  budgetMinInput.value = minDisplay;
  budgetMaxInput.value = maxDisplay;
  budgetFill.style.left = `${(minDisplay / limitDisplay) * 100}%`;
  budgetFill.style.right = `${100 - (maxDisplay / limitDisplay) * 100}%`;
  // 두 손잡이가 겹쳐도 다시 잡을 수 있게 위쪽 손잡이 바꾸기
  budgetMin.classList.toggle("is-top", minDisplay > limitDisplay / 2);

  const minText = formatCurrency(minDisplay, state.currency);
  const maxText = formatCurrency(maxDisplay, state.currency);
  budgetValue.textContent = max >= BUDGET_LIMIT
    ? (min === 0 ? "제한 없음" : `월 ${minText} 이상`)
    : `월 ${minText} ~ ${maxText}`;
  budgetMax.setAttribute("aria-valuetext", max >= BUDGET_LIMIT ? "제한 없음" : maxText);
  budgetMin.setAttribute("aria-valuetext", minText);
}

function setBudget(min, max, changed) {
  const step = getBudgetStep(state.currency);
  const maxDisplayValue = fromKRW(BUDGET_LIMIT, state.currency);
  const snap = (v) => Math.min(Math.max(Math.round((Number(v) || 0) / step) * step, 0), maxDisplayValue);
  min = snap(min);
  max = snap(max);
  // 손잡이가 서로 넘어가지 않게, 움직인 쪽을 멈춤
  if (min > max) {
    if (changed === "min") min = max;
    else max = min;
  }
  state.budgetMin = toKRW(min, state.currency);
  state.budgetMax = toKRW(max, state.currency);
  renderBudget();
  renderGrid();
}

budgetMin.addEventListener("input", () => setBudget(budgetMin.value, fromKRW(state.budgetMax, state.currency), "min"));
budgetMax.addEventListener("input", () => setBudget(fromKRW(state.budgetMin, state.currency), budgetMax.value, "max"));
budgetMinInput.addEventListener("change", () => setBudget(budgetMinInput.value, fromKRW(state.budgetMax, state.currency), "min"));
budgetMaxInput.addEventListener("change", () => setBudget(fromKRW(state.budgetMin, state.currency), budgetMaxInput.value, "max"));
document.getElementById("budget-reset").addEventListener("click", () => setBudget(0, fromKRW(BUDGET_LIMIT, state.currency)));

searchInput.addEventListener("input", () => {
  state.query = searchInput.value;
  renderGrid();
});

document.getElementById("reset").addEventListener("click", () => {
  state.query = "";
  state.pricing = "all";
  state.budgetMin = 0;
  state.budgetMax = BUDGET_LIMIT;
  renderBudget();
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
document.querySelectorAll(".updated-at").forEach((el) => { el.textContent = UPDATED_AT; });

// 스크롤하면 상단 메뉴를 흰 배경으로
const siteHeader = document.querySelector(".site-header");
const onScroll = () => siteHeader.classList.toggle("is-scrolled", window.scrollY > 40);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

renderNeedField();
renderKeywords();
readCategoryFromHash();
renderBudget();
render();
