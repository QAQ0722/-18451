Robot Motor Degree Calculator

Open robot_motor_calculator.html directly in your browser.
No internet, no Python, and no installation are required for the HTML version.

Formula:
degrees = 50 * (39 - sqrt(1537 - 16 * cm))

This formula is based on these calibration data points:
100 degrees = 10.5 cm
200 degrees = 19.5 cm
400 degrees = 36 cm

Best accuracy is inside the measured range: 10.5 cm to 36 cm.
Outside that range, the website still calculates, but the result is an estimate.

Optional Flask version:
1. Install Flask:
   pip install flask

2. Run:
   python app.py

3. Open:
   http://127.0.0.1:5000
