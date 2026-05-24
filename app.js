const STORAGE_KEY = "tdc-manager-state-v1";

const defaultState = {
  settings: {
    patientLimit: 100,
    revenueLimit: 10000000,
    staffCount: 1,
    storageMode: "local"
  },
  patients: [
    {
      id: crypto.randomUUID(),
      name: "Nguyen Minh Anh",
      phone: "0900000001",
      birthday: "1992-04-12",
      note: "Mau du lieu thu nghiem"
    }
  ],
  appointments: [],
  payments: []
};

let state = loadState();

const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0
});

const views = document.querySelectorAll(".view");
const navButtons = document.querySelectorAll(".app-nav button");
const patientForm = document.getElementById("patient-form");
const appointmentForm = document.getElementById("appointment-form");
const paymentForm = document.getElementById("payment-form");
const settingsForm = document.getElementById("settings-form");
const patientSearch = document.getElementById("patient-search");
const exportButton = document.getElementById("export-data");
const importInput = document.getElementById("import-data");

function loadState() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return structuredClone(defaultState);

  try {
    return { ...structuredClone(defaultState), ...JSON.parse(stored) };
  } catch {
    return structuredClone(defaultState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function formatDate(value) {
  if (!value) return "";
  const options = value.includes("T")
    ? { dateStyle: "medium", timeStyle: "short" }
    : { dateStyle: "medium" };
  return new Intl.DateTimeFormat("vi-VN", options).format(new Date(value));
}

function getPatientName(id) {
  return state.patients.find((patient) => patient.id === id)?.name || "Chua co ten";
}

function paidRevenue() {
  return state.payments
    .filter((payment) => payment.status === "Đã thanh toán")
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
}

function todayAppointments() {
  const today = new Date().toISOString().slice(0, 10);
  return state.appointments.filter((appointment) => appointment.date.slice(0, 10) === today);
}

function getRecommendation() {
  const revenue = paidRevenue();
  const patientCount = state.patients.length;
  const settings = state.settings;

  if (settings.storageMode === "cloud" || settings.staffCount > 1) {
    return {
      stage: "Cloud",
      title: "Nen dung backend chung",
      body: "Phong kham da co nhieu nguoi dung noi bo hoac da chon cloud. Buoc tiep theo la Supabase/Firebase, dang nhap rieng tung nhan vien, backup tu dong va phan quyen."
    };
  }

  if (patientCount >= settings.patientLimit || revenue >= settings.revenueLimit) {
    return {
      stage: "Upgrade",
      title: "Da den nguong nang cap",
      body: "Du lieu hoac doanh thu da vuot nguong cai dat. Nen chuyen kho du lieu len cloud, them audit log va backup hang ngay truoc khi mo rong tiep."
    };
  }

  return {
    stage: "Free",
    title: "Co the tiep tuc 0 dong",
    body: "Quy mo hien tai phu hop voi GitHub Pages va localStorage. Hay xuat backup cuoi moi ngay lam viec va chi nhap du lieu thu nghiem neu chua co phan quyen that."
  };
}

function renderMetrics() {
  const recommendation = getRecommendation();
  document.getElementById("metric-patients").textContent = state.patients.length;
  document.getElementById("metric-today").textContent = todayAppointments().length;
  document.getElementById("metric-revenue").textContent = currency.format(paidRevenue());
  document.getElementById("metric-stage").textContent = recommendation.stage;
}

function renderPatients() {
  const query = patientSearch.value.trim().toLowerCase();
  const rows = state.patients
    .filter((patient) => `${patient.name} ${patient.phone}`.toLowerCase().includes(query))
    .map((patient) => `
      <tr>
        <td><strong>${escapeHtml(patient.name)}</strong></td>
        <td>${escapeHtml(patient.phone)}</td>
        <td>${patient.birthday ? formatDate(patient.birthday) : ""}</td>
        <td>${escapeHtml(patient.note || "")}</td>
      </tr>
    `);

  document.getElementById("patient-rows").innerHTML = rows.join("") || emptyRow(4, "Chua co benh nhan phu hop.");
  renderPatientOptions();
}

function renderPatientOptions() {
  const options = state.patients
    .map((patient) => `<option value="${patient.id}">${escapeHtml(patient.name)} - ${escapeHtml(patient.phone)}</option>`)
    .join("");
  const fallback = '<option value="">Hay them benh nhan truoc</option>';
  document.getElementById("appointment-patient").innerHTML = options || fallback;
  document.getElementById("payment-patient").innerHTML = options || fallback;
}

function renderAppointments() {
  const sorted = [...state.appointments].sort((a, b) => new Date(a.date) - new Date(b.date));
  const rows = sorted.map((appointment) => `
    <tr>
      <td>${formatDate(appointment.date)}</td>
      <td><strong>${escapeHtml(getPatientName(appointment.patientId))}</strong></td>
      <td>${escapeHtml(appointment.service)}</td>
      <td><span class="status-pill">${escapeHtml(appointment.status)}</span></td>
    </tr>
  `);

  document.getElementById("appointment-rows").innerHTML = rows.join("") || emptyRow(4, "Chua co lich hen.");

  const upcoming = sorted
    .filter((appointment) => new Date(appointment.date) >= new Date())
    .slice(0, 6)
    .map((appointment) => `
      <tr>
        <td>${formatDate(appointment.date)}</td>
        <td>${escapeHtml(getPatientName(appointment.patientId))}</td>
        <td>${escapeHtml(appointment.service)}</td>
        <td><span class="status-pill">${escapeHtml(appointment.status)}</span></td>
      </tr>
    `);
  document.getElementById("upcoming-rows").innerHTML = upcoming.join("") || emptyRow(4, "Chua co lich sap toi.");
}

function renderPayments() {
  const rows = state.payments.map((payment) => `
    <tr>
      <td><strong>${escapeHtml(getPatientName(payment.patientId))}</strong></td>
      <td>${escapeHtml(payment.description)}</td>
      <td>${currency.format(Number(payment.amount || 0))}</td>
      <td><span class="status-pill">${escapeHtml(payment.status)}</span></td>
    </tr>
  `);

  document.getElementById("payment-rows").innerHTML = rows.join("") || emptyRow(4, "Chua co thanh toan.");
}

function renderSettings() {
  const settings = state.settings;
  settingsForm.patientLimit.value = settings.patientLimit;
  settingsForm.revenueLimit.value = settings.revenueLimit;
  settingsForm.staffCount.value = settings.staffCount;
  settingsForm.storageMode.value = settings.storageMode;

  const recommendation = getRecommendation();
  document.getElementById("recommendation").innerHTML = `
    <article>
      <h3>${recommendation.title}</h3>
      <p>${recommendation.body}</p>
    </article>
    <article>
      <h3>De nang cap ma khong viet lai tu dau</h3>
      <p>Giu cau truc du lieu hien tai, xuat file JSON, sau do import vao database cloud. Cac man hinh benh nhan, lich hen va thanh toan co the giu nguyen, chi thay lop luu tru.</p>
    </article>
  `;
}

function renderAll() {
  renderMetrics();
  renderPatients();
  renderAppointments();
  renderPayments();
  renderSettings();
}

function emptyRow(columns, message) {
  return `<tr><td class="empty-row" colspan="${columns}">${message}</td></tr>`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function collectForm(form) {
  return Object.fromEntries(new FormData(form).entries());
}

navButtons.forEach((button) => {
  button.addEventListener("click", () => {
    navButtons.forEach((item) => item.classList.remove("is-active"));
    views.forEach((view) => view.classList.remove("is-active"));
    button.classList.add("is-active");
    document.getElementById(button.dataset.view).classList.add("is-active");
  });
});

patientForm.addEventListener("submit", (event) => {
  event.preventDefault();
  state.patients.push({ id: crypto.randomUUID(), ...collectForm(patientForm) });
  patientForm.reset();
  saveState();
  renderAll();
});

appointmentForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!state.patients.length) return;
  state.appointments.push({ id: crypto.randomUUID(), ...collectForm(appointmentForm) });
  appointmentForm.reset();
  saveState();
  renderAll();
});

paymentForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!state.patients.length) return;
  state.payments.push({ id: crypto.randomUUID(), ...collectForm(paymentForm) });
  paymentForm.reset();
  saveState();
  renderAll();
});

settingsForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const values = collectForm(settingsForm);
  state.settings = {
    patientLimit: Number(values.patientLimit),
    revenueLimit: Number(values.revenueLimit),
    staffCount: Number(values.staffCount),
    storageMode: values.storageMode
  };
  saveState();
  renderAll();
});

patientSearch.addEventListener("input", renderPatients);

exportButton.addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `trang-dental-backup-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
});

importInput.addEventListener("change", async () => {
  const file = importInput.files[0];
  if (!file) return;
  const imported = JSON.parse(await file.text());
  state = { ...structuredClone(defaultState), ...imported };
  saveState();
  renderAll();
  importInput.value = "";
});

renderAll();
