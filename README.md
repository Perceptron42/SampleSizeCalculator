# A/B Testing Sample Size Calculator

A beautiful, web-based calculator for determining the required sample size for A/B testing experiments. Built with pure HTML, CSS, and JavaScript - no backend required!

## 🚀 Live Demo

**[Try it now!](https://perceptron42.github.io/SampleSizeCalculator/)**

<img src="screenshot.jpg" alt="A/B Testing Calculator Screenshot" width="300">

## Features

- **Real-time Calculations**: Results update instantly as you type
- **Complete Parameter Control**:
  - Baseline Conversion Rate (BCR)
  - Minimum Detectable Effect (MDE) - relative percentage improvement
  - Significance Level (α) - typically 0.05 for 95% confidence
  - Statistical Power (1-β) - typically 0.8 for 80% power
  - Test Type - one-sided or two-sided
  - Traffic Split Ratio - customizable test/control split
- **Modern UI**: Clean, responsive design with glassmorphism effects
- **No Backend Needed**: All calculations run in your browser
- **Mobile Responsive**: Works perfectly on all device sizes

## Statistical Methodology

The calculator uses the **two-proportion z-test** formula to determine sample sizes:

```
n = 2 × [(Z_α + Z_β)² × p̄(1-p̄)] / δ²
```

Where:
- **Z_α** = z-score for significance level (adjusted for one/two-sided)
- **Z_β** = z-score for statistical power
- **p̄** = pooled probability = (p₁ + p₂) / 2
- **δ** = absolute effect size = |p₂ - p₁|
- **p₁** = baseline conversion rate
- **p₂** = test conversion rate = p₁ × (1 + MDE/100)

The formula is adjusted for unequal traffic splits using ratio multipliers.

## Usage

### Local Usage (Simplest)

1. **Open the calculator**:
   - Just double-click `index.html` in your file explorer
   - It will open in your default browser and work immediately!

2. **Enter your parameters**:
   - **BCR**: Your current conversion rate (e.g., 5%)
   - **MDE**: Smallest improvement you want to detect (e.g., 30% relative improvement)
   - **Alpha**: Usually keep at 0.05 (95% confidence)
   - **Power**: Usually keep at 0.8 (80% power)
   - **Test Type**: Two-sided for "any change", one-sided for "improvement only"
   - **Split Ratio**: Adjust if you want unequal traffic distribution

3. **View results**:
   - Total sample size needed
   - Control group size
   - Test group size





## Project Structure

```
SampleSizeCalculatorforABTesting/
├── index.html      # Main HTML structure
├── styles.css      # Modern CSS styling
├── script.js       # Statistical calculations & UI logic
└── README.md       # This file
```

## Browser Compatibility

Works on all modern browsers:
- Chrome/Edge (v90+)
- Firefox (v88+)
- Safari (v14+)
- Mobile browsers

## License

Free to use and modify. No attribution required.

---

**Built with ❤️ for better A/B testing**
