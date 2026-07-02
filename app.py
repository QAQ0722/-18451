from flask import Flask, request, render_template_string

app = Flask(__name__)

HTML = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Robot Motor Degree Calculator</title>
  <style>
    :root {
      --bg: #f4f5f7;
      --card: #ffffff;
      --text: #1f2937;
      --muted: #6b7280;
      --border: #d1d5db;
      --dark: #111827;
      --soft: #eef0f4;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      font-family: Arial, Helvetica, sans-serif;
      background: linear-gradient(135deg, #f7f7f8, #e9ebef);
      color: var(--text);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }

    .container {
      width: 100%;
      max-width: 760px;
      background: var(--card);
      border-radius: 24px;
      box-shadow: 0 18px 45px rgba(0, 0, 0, 0.12);
      overflow: hidden;
    }

    .hero {
      padding: 34px 34px 24px;
      background: var(--dark);
      color: white;
    }

    .hero h1 {
      margin: 0;
      font-size: 30px;
      letter-spacing: -0.5px;
    }

    .hero p {
      margin: 10px 0 0;
      color: #d1d5db;
      line-height: 1.5;
    }

    .content {
      padding: 30px 34px 34px;
    }

    label {
      display: block;
      font-weight: 700;
      margin-bottom: 10px;
      font-size: 17px;
    }

    .input-row {
      display: flex;
      gap: 12px;
      align-items: stretch;
    }

    input {
      flex: 1;
      padding: 16px;
      font-size: 22px;
      border: 1px solid var(--border);
      border-radius: 14px;
      outline: none;
    }

    input:focus {
      border-color: #111827;
      box-shadow: 0 0 0 3px rgba(17, 24, 39, 0.12);
    }

    button {
      border: none;
      border-radius: 14px;
      padding: 0 22px;
      background: var(--dark);
      color: white;
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
    }

    button:hover {
      opacity: 0.9;
    }

    .result-card {
      margin-top: 24px;
      padding: 24px;
      background: var(--soft);
      border-radius: 18px;
      text-align: center;
    }

    .small-title {
      color: var(--muted);
      font-size: 14px;
      margin-bottom: 8px;
    }

    .degree {
      font-size: 46px;
      font-weight: 800;
      color: var(--dark);
      letter-spacing: -1px;
    }

    .degree span {
      font-size: 24px;
      color: var(--muted);
    }

    .warning {
      display: none;
      margin-top: 14px;
      color: #92400e;
      background: #fff7ed;
      border: 1px solid #fed7aa;
      padding: 12px;
      border-radius: 12px;
      line-height: 1.45;
    }

    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-top: 24px;
    }

    .box {
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 18px;
      background: white;
    }

    .box h3 {
      margin: 0 0 10px;
      font-size: 16px;
    }

    .box p {
      margin: 0;
      color: var(--muted);
      line-height: 1.55;
      font-size: 14px;
    }

    code {
      background: #f3f4f6;
      padding: 2px 5px;
      border-radius: 5px;
      font-size: 13px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8px;
      font-size: 14px;
    }

    th, td {
      border-bottom: 1px solid #e5e7eb;
      padding: 8px;
      text-align: left;
    }

    th {
      color: var(--muted);
      font-weight: 700;
    }

    .copy-note {
      margin-top: 10px;
      color: var(--muted);
      font-size: 13px;
    }

    @media (max-width: 640px) {
      body {
        padding: 12px;
      }

      .hero, .content {
        padding-left: 22px;
        padding-right: 22px;
      }

      .hero h1 {
        font-size: 24px;
      }

      .input-row {
        flex-direction: column;
      }

      button {
        padding: 14px;
      }

      .degree {
        font-size: 38px;
      }

      .grid {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <main class="container">
    <section class="hero">
      <h1>Robot Motor Degree Calculator</h1>
      <p>Enter the target distance in centimeters. The calculator will automatically convert it into motor rotation degrees using your robot's measured calibration data.</p>
    </section>

    <section class="content">
      <label for="cmInput">Target distance, in centimeters</label>
      <div class="input-row">
        <input id="cmInput" type="number" inputmode="decimal" step="0.01" min="0" placeholder="Example: 36" />
        <button onclick="copyDegrees()">Copy degrees</button>
      </div>

      <div class="result-card">
        <div class="small-title">Required motor rotation</div>
        <div class="degree" id="degreeOutput">0.00 <span>degrees</span></div>
        <div class="copy-note" id="copyNote">Type a value above to calculate instantly.</div>
        <div class="warning" id="warningBox"></div>
      </div>

      <div class="grid">
        <div class="box">
          <h3>Formula used</h3>
          <p>
            Distance calibration:<br>
            <code>cm = -0.000025θ² + 0.0975θ + 1</code><br><br>
            Inverse formula for the website:<br>
            <code>θ = 50 × (39 - √(1537 - 16cm))</code>
          </p>
        </div>

        <div class="box">
          <h3>Your calibration points</h3>
          <table>
            <thead>
              <tr>
                <th>Motor degrees</th>
                <th>Distance</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>100°</td>
                <td>10.5 cm</td>
              </tr>
              <tr>
                <td>200°</td>
                <td>19.5 cm</td>
              </tr>
              <tr>
                <td>400°</td>
                <td>36 cm</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  </main>

  <script>
    const cmInput = document.getElementById("cmInput");
    const degreeOutput = document.getElementById("degreeOutput");
    const warningBox = document.getElementById("warningBox");
    const copyNote = document.getElementById("copyNote");

    let latestDegrees = 0;

    function calculateDegrees(cm) {
      if (cm <= 0) return 0;

      // Most accurate formula from the 3 measured calibration points:
      // degrees = 50 * (39 - sqrt(1537 - 16 * cm))
      const insideRoot = 1537 - 16 * cm;

      if (insideRoot < 0) {
        return NaN;
      }

      return 50 * (39 - Math.sqrt(insideRoot));
    }

    function updateCalculator() {
      const cm = parseFloat(cmInput.value);

      warningBox.style.display = "none";
      warningBox.textContent = "";

      if (Number.isNaN(cm)) {
        latestDegrees = 0;
        degreeOutput.innerHTML = `0.00 <span>degrees</span>`;
        copyNote.textContent = "Type a value above to calculate instantly.";
        return;
      }

      const degrees = calculateDegrees(cm);
      latestDegrees = degrees;

      if (Number.isNaN(degrees)) {
        degreeOutput.innerHTML = `Invalid <span>value</span>`;
        copyNote.textContent = "The number is too large for this formula.";
        warningBox.style.display = "block";
        warningBox.textContent = "This target distance is outside the mathematical range of the current calibration curve. Please test a new longer distance and add it to the calibration.";
        return;
      }

      degreeOutput.innerHTML = `${degrees.toFixed(2)} <span>degrees</span>`;
      copyNote.textContent = `Rounded command value: ${Math.round(degrees)} degrees`;

      if (cm < 10.5 || cm > 36) {
        warningBox.style.display = "block";
        warningBox.textContent = "Warning: this value is outside your measured test range of 10.5 cm to 36 cm, so it is an estimate. For better accuracy, measure more points and update the formula.";
      }
    }

    async function copyDegrees() {
      if (Number.isNaN(latestDegrees)) return;

      const rounded = Math.round(latestDegrees).toString();

      try {
        await navigator.clipboard.writeText(rounded);
        copyNote.textContent = `Copied: ${rounded} degrees`;
      } catch (e) {
        copyNote.textContent = `Copy failed. Use this value: ${rounded} degrees`;
      }
    }

    cmInput.addEventListener("input", updateCalculator);
  </script>
</body>
</html>
"""

@app.route("/", methods=["GET", "POST"])
def index():
    return render_template_string(HTML)

if __name__ == "__main__":
    app.run(debug=True)
