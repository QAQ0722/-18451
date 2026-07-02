const settingsBtn = document.getElementById("settingsBtn");
const settingsPanel = document.getElementById("settingsPanel");
const modeSelect = document.getElementById("modeSelect");
const wheelDiameterInput = document.getElementById("wheelDiameterInput");

const targetCmInput = document.getElementById("targetCmInput");
const degreeOutput = document.getElementById("degreeOutput");
const warningBox = document.getElementById("warningBox");
const copyNote = document.getElementById("copyNote");
const formulaOutput = document.getElementById("formulaOutput");
const detailOutput = document.getElementById("detailOutput");
const modeBadge = document.getElementById("modeBadge");

const angleInputs = document.querySelectorAll(".angle-input");
const distanceInputs = document.querySelectorAll(".distance-input");

const saveSettingsBtn = document.getElementById("saveSettingsBtn");
const resetSettingsBtn = document.getElementById("resetSettingsBtn");
const copyDegreesBtn = document.getElementById("copyDegreesBtn");
const saveCalibrationBtn = document.getElementById("saveCalibrationBtn");
const resetCalibrationBtn = document.getElementById("resetCalibrationBtn");

let latestDegrees = 0;

function toggleSettings() {
  settingsPanel.classList.toggle("show");
}

function getMode() {
  return modeSelect.value;
}

function calculateByPhysics(targetCm) {
  const wheelDiameter = parseFloat(wheelDiameterInput.value);

  if (Number.isNaN(wheelDiameter) || wheelDiameter <= 0) {
    return NaN;
  }

  const wheelCircumference = wheelDiameter * Math.PI;
  return targetCm / wheelCircumference * 360;
}

function getCalibrationPoints() {
  const points = [];

  for (let i = 0; i < angleInputs.length; i++) {
    const angle = parseFloat(angleInputs[i].value);
    const distance = parseFloat(distanceInputs[i].value);

    if (Number.isNaN(angle) || Number.isNaN(distance)) {
      return null;
    }

    points.push({
      angle,
      distance
    });
  }

  points.sort((a, b) => a.distance - b.distance);
  return points;
}

function interpolate(targetCm, p1, p2) {
  if (p1.distance === p2.distance) {
    return NaN;
  }

  const ratio = (targetCm - p1.distance) / (p2.distance - p1.distance);
  return p1.angle + ratio * (p2.angle - p1.angle);
}

function calculateByCalibration(targetCm) {
  const points = getCalibrationPoints();

  if (points === null || points.length < 2) {
    return NaN;
  }

  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];

    if (targetCm >= p1.distance && targetCm <= p2.distance) {
      return interpolate(targetCm, p1, p2);
    }
  }

  if (targetCm < points[0].distance) {
    return interpolate(targetCm, points[0], points[1]);
  }

  return interpolate(targetCm, points[points.length - 2], points[points.length - 1]);
}

function updateCalculator() {
  const targetCm = parseFloat(targetCmInput.value);

  warningBox.style.display = "none";
  warningBox.textContent = "";

  updateFormulaText();

  if (Number.isNaN(targetCm)) {
    latestDegrees = 0;
    degreeOutput.innerHTML = `0.00 <span>度</span>`;
    copyNote.textContent = "輸入公分後會自動計算";
    return;
  }

  let degrees;

  if (getMode() === "physics") {
    degrees = calculateByPhysics(targetCm);
  } else {
    degrees = calculateByCalibration(targetCm);
  }

  latestDegrees = degrees;

  if (Number.isNaN(degrees) || !Number.isFinite(degrees)) {
    degreeOutput.innerHTML = `無效 <span>數值</span>`;
    copyNote.textContent = "目前設定無法計算";
    warningBox.style.display = "block";
    warningBox.textContent = "請檢查輪子直徑是否大於 0，或確認實測資料都有填數字，而且實際位移不要重複。";
    return;
  }

  degreeOutput.innerHTML = `${degrees.toFixed(2)} <span>度</span>`;
  copyNote.textContent = `建議輸入機器人的整數角度：${Math.round(degrees)} 度`;

  if (getMode() === "calibration") {
    const points = getCalibrationPoints();

    if (points !== null) {
      const minDistance = points[0].distance;
      const maxDistance = points[points.length - 1].distance;

      if (targetCm < minDistance || targetCm > maxDistance) {
        warningBox.style.display = "block";
        warningBox.textContent =
          `提醒：這個距離超出你目前實測的 ${minDistance}～${maxDistance} 公分範圍，所以結果是估算值。`;
      }
    }
  }
}

function updateFormulaText() {
  if (getMode() === "physics") {
    modeBadge.textContent = "目前模式：萬用輪子公式模式";
    formulaOutput.textContent = "角度 = 目標公分 ÷ (輪子直徑 × π) × 360";
    detailOutput.innerHTML = `輪子直徑：${wheelDiameterInput.value} 公分`;
  } else {
    modeBadge.textContent = "目前模式：實測校正模式";
    formulaOutput.textContent = "用最接近的兩組實測資料做分段換算";
    detailOutput.innerHTML =
      "此模式適合同一台車校正。<br>修改左邊實測表格後，結果會自動更新。";
  }
}

async function copyDegrees() {
  if (Number.isNaN(latestDegrees) || !Number.isFinite(latestDegrees)) {
    return;
  }

  const roundedDegrees = Math.round(latestDegrees).toString();

  try {
    await navigator.clipboard.writeText(roundedDegrees);
    copyNote.textContent = `已複製：${roundedDegrees} 度`;
  } catch (error) {
    copyNote.textContent = `複製失敗，請手動輸入：${roundedDegrees} 度`;
  }
}

function saveSettings() {
  const settings = {
    mode: modeSelect.value,
    wheelDiameter: wheelDiameterInput.value
  };

  localStorage.setItem("robotSimpleSettings", JSON.stringify(settings));
  copyNote.textContent = "已儲存設定";
  updateCalculator();
}

function loadSettings() {
  const saved = localStorage.getItem("robotSimpleSettings");

  if (!saved) {
    return;
  }

  try {
    const settings = JSON.parse(saved);
    modeSelect.value = settings.mode || "physics";
    wheelDiameterInput.value = settings.wheelDiameter || 6;
  } catch (error) {
    localStorage.removeItem("robotSimpleSettings");
  }
}

function resetSettings() {
  modeSelect.value = "physics";
  wheelDiameterInput.value = 6;

  localStorage.removeItem("robotSimpleSettings");
  updateCalculator();
  copyNote.textContent = "已重設設定";
}

function saveCalibration() {
  const points = getCalibrationPoints();

  if (points === null) {
    copyNote.textContent = "儲存失敗：請確認每格都有數字";
    return;
  }

  localStorage.setItem("robotCalibrationPoints", JSON.stringify(points));
  copyNote.textContent = "已儲存實測資料";
  updateCalculator();
}

function loadCalibration() {
  const saved = localStorage.getItem("robotCalibrationPoints");

  if (!saved) {
    return;
  }

  try {
    const points = JSON.parse(saved);

    for (let i = 0; i < 3; i++) {
      angleInputs[i].value = points[i].angle;
      distanceInputs[i].value = points[i].distance;
    }
  } catch (error) {
    localStorage.removeItem("robotCalibrationPoints");
  }
}

function resetCalibration() {
  angleInputs[0].value = 100;
  distanceInputs[0].value = 10.5;

  angleInputs[1].value = 200;
  distanceInputs[1].value = 19.5;

  angleInputs[2].value = 400;
  distanceInputs[2].value = 36;

  localStorage.removeItem("robotCalibrationPoints");
  updateCalculator();
  copyNote.textContent = "已恢復預設資料";
}

settingsBtn.addEventListener("click", toggleSettings);
copyDegreesBtn.addEventListener("click", copyDegrees);
saveSettingsBtn.addEventListener("click", saveSettings);
resetSettingsBtn.addEventListener("click", resetSettings);
saveCalibrationBtn.addEventListener("click", saveCalibration);
resetCalibrationBtn.addEventListener("click", resetCalibration);

targetCmInput.addEventListener("input", updateCalculator);
modeSelect.addEventListener("change", updateCalculator);
wheelDiameterInput.addEventListener("input", updateCalculator);

for (const input of angleInputs) {
  input.addEventListener("input", updateCalculator);
}

for (const input of distanceInputs) {
  input.addEventListener("input", updateCalculator);
}

document.addEventListener("click", function(event) {
  const clickedSettings = settingsPanel.contains(event.target);
  const clickedButton = settingsBtn.contains(event.target);

  if (!clickedSettings && !clickedButton) {
    settingsPanel.classList.remove("show");
  }
});

loadSettings();
loadCalibration();
updateCalculator();

let lastMouseX = null;
let lastMouseY = null;
let trailTimer = 0;

document.addEventListener("mousemove", function(event) {
  const now = Date.now();

  if (now - trailTimer < 12) {
    return;
  }

  trailTimer = now;

  const x = event.clientX;
  const y = event.clientY;

  let angle = 0;

  if (lastMouseX !== null && lastMouseY !== null) {
    const dx = x - lastMouseX;
    const dy = y - lastMouseY;
    angle = Math.atan2(dy, dx) * 180 / Math.PI;
  }

  lastMouseX = x;
  lastMouseY = y;

  const trail = document.createElement("div");
  trail.className = "mouse-trail";
  trail.style.left = `${x}px`;
  trail.style.top = `${y}px`;
  trail.style.setProperty("--angle", `${angle}deg`);

  const dot = document.createElement("div");
  dot.className = "mouse-dot";
  dot.style.left = `${x}px`;
  dot.style.top = `${y}px`;

  document.body.appendChild(trail);
  document.body.appendChild(dot);

  setTimeout(function() {
    trail.remove();
    dot.remove();
  }, 500);
});
