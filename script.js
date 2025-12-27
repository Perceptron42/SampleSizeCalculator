// ===== Statistical Functions =====

/**
 * Approximates the inverse of the standard normal cumulative distribution function (quantile function)
 * Uses the Beasley-Springer-Moro algorithm for approximation
 * @param {number} p - Probability (0 < p < 1)
 * @returns {number} - Z-score corresponding to the probability
 */
function normalInverse(p) {
    // Coefficients for the Beasley-Springer-Moro algorithm
    const a = [
        -3.969683028665376e+01,
        2.209460984245205e+02,
        -2.759285104469687e+02,
        1.383577518672690e+02,
        -3.066479806614716e+01,
        2.506628277459239e+00
    ];

    const b = [
        -5.447609879822406e+01,
        1.615858368580409e+02,
        -1.556989798598866e+02,
        6.680131188771972e+01,
        -1.328068155288572e+01
    ];

    const c = [
        -7.784894002430293e-03,
        -3.223964580411365e-01,
        -2.400758277161838e+00,
        -2.549732539343734e+00,
        4.374664141464968e+00,
        2.938163982698783e+00
    ];

    const d = [
        7.784695709041462e-03,
        3.224671290700398e-01,
        2.445134137142996e+00,
        3.754408661907416e+00
    ];

    // Define break-points
    const pLow = 0.02425;
    const pHigh = 1 - pLow;

    let q, r, result;

    if (p < pLow) {
        // Rational approximation for lower region
        q = Math.sqrt(-2 * Math.log(p));
        result = (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
            ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
    } else if (p <= pHigh) {
        // Rational approximation for central region
        q = p - 0.5;
        r = q * q;
        result = (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
            (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
    } else {
        // Rational approximation for upper region
        q = Math.sqrt(-2 * Math.log(1 - p));
        result = -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
            ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
    }

    return result;
}

/**
 * Calculate required sample size for A/B test using two-proportion z-test
 * @param {number} bcr - Baseline conversion rate (as percentage, e.g., 5 for 5%)
 * @param {number} mde - Minimum detectable effect (relative percentage, e.g., 30 for 30% improvement)
 * @param {number} alpha - Significance level (e.g., 0.05 for 95% confidence)
 * @param {number} power - Statistical power (e.g., 0.8 for 80% power)
 * @param {boolean} twoSided - True for two-sided test, false for one-sided
 * @param {number} splitRatio - Proportion of traffic to test group (0 to 1)
 * @returns {object} - Object containing controlSize, testSize, and totalSize
 */
function calculateSampleSize(bcr, mde, alpha, power, twoSided, splitRatio) {
    try {
        // Convert BCR from percentage to proportion
        const p1 = bcr / 100;

        // Calculate test group conversion rate based on MDE
        // MDE is relative, so a 30% improvement on 5% BCR = 5% * 1.30 = 6.5%
        const p2 = p1 * (1 + mde / 100);

        // Validate inputs
        if (p1 <= 0 || p1 >= 1) {
            throw new Error('Baseline conversion rate must be between 0 and 100%');
        }
        if (p2 <= 0 || p2 > 1) {
            throw new Error('Resulting test conversion rate is invalid. Try a smaller MDE.');
        }
        if (alpha <= 0 || alpha >= 1) {
            throw new Error('Significance level must be between 0 and 1');
        }
        if (power <= 0 || power >= 1) {
            throw new Error('Statistical power must be between 0 and 1');
        }
        if (splitRatio <= 0 || splitRatio >= 1) {
            throw new Error('Split ratio must be between 0 and 1');
        }

        // Calculate z-scores
        const zAlpha = twoSided ? normalInverse(1 - alpha / 2) : normalInverse(1 - alpha);
        const zBeta = normalInverse(power);

        // Effect size (absolute difference)
        const delta = Math.abs(p2 - p1);

        // Sample size formula using baseline variance only (null hypothesis)
        // This matches industry-standard calculators like Statsig
        // n = 2 * [(Z_α + Z_β)² * p₁(1-p₁)] / δ²
        const nEqual = 2 * Math.pow(zAlpha + zBeta, 2) * p1 * (1 - p1) / Math.pow(delta, 2);

        // Adjust for unequal split ratio
        // k = ratio of test to control = splitRatio / (1 - splitRatio)
        const k = splitRatio / (1 - splitRatio);

        // For unequal groups: n_control = n_equal * (1 + 1/k) / 2
        //                      n_test = n_control * k
        const controlSize = Math.ceil(nEqual * (1 + 1 / k) / 2);
        const testSize = Math.ceil(controlSize * k);
        const totalSize = controlSize + testSize;

        return {
            controlSize: controlSize,
            testSize: testSize,
            totalSize: totalSize
        };

    } catch (error) {
        throw error;
    }
}

// ===== UI Functions =====

/**
 * Format number with thousands separators
 * @param {number} num - Number to format
 * @returns {string} - Formatted number string
 */
function formatNumber(num) {
    return num.toLocaleString('en-US');
}

/**
 * Get all form values
 * @returns {object} - Object containing all form values
 */
function getFormValues() {
    return {
        bcr: parseFloat(document.getElementById('bcr').value),
        mde: parseFloat(document.getElementById('mde').value),
        alpha: parseFloat(document.getElementById('alpha').value),
        power: parseFloat(document.getElementById('power').value),
        twoSided: document.getElementById('testType').value === 'true',
        splitRatio: parseFloat(document.getElementById('splitRatio').value)
    };
}

/**
 * Update results display
 */
function updateResults() {
    const errorMessage = document.getElementById('errorMessage');

    try {
        const values = getFormValues();

        // Validate all inputs are valid numbers
        if (Object.values(values).some(v => isNaN(v) && typeof v !== 'boolean')) {
            throw new Error('Please fill in all fields with valid numbers');
        }

        // Calculate sample sizes
        const results = calculateSampleSize(
            values.bcr,
            values.mde,
            values.alpha,
            values.power,
            values.twoSided,
            values.splitRatio
        );

        // Update display
        document.getElementById('totalSampleSize').textContent = formatNumber(results.totalSize);
        document.getElementById('controlSize').textContent = formatNumber(results.controlSize);
        document.getElementById('testSize').textContent = formatNumber(results.testSize);

        // Hide error message
        errorMessage.classList.remove('show');
        errorMessage.textContent = '';

    } catch (error) {
        // Show error message
        errorMessage.textContent = error.message;
        errorMessage.classList.add('show');

        // Reset results
        document.getElementById('totalSampleSize').textContent = '-';
        document.getElementById('controlSize').textContent = '-';
        document.getElementById('testSize').textContent = '-';
    }
}

/**
 * Update slider value display
 */
function updateSliderValue() {
    const slider = document.getElementById('splitRatio');
    const valueDisplay = document.getElementById('splitRatioValue');
    const percentage = Math.round(slider.value * 100);
    valueDisplay.textContent = `${percentage}%`;
}

/**
 * Handle toggle button clicks
 */
function handleToggleClick(event) {
    if (event.target.classList.contains('toggle-btn')) {
        // Remove active class from all toggle buttons
        document.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Add active class to clicked button
        event.target.classList.add('active');

        // Update hidden input value
        document.getElementById('testType').value = event.target.dataset.value;

        // Recalculate
        updateResults();
    }
}

// ===== Event Listeners =====

document.addEventListener('DOMContentLoaded', function () {
    // Add input event listeners for real-time calculation
    const inputs = ['bcr', 'mde', 'alpha', 'power', 'splitRatio'];
    inputs.forEach(id => {
        const input = document.getElementById(id);
        input.addEventListener('input', function () {
            if (id === 'splitRatio') {
                updateSliderValue();
            }
            updateResults();
        });
    });

    // Add toggle button listeners
    document.getElementById('twoSidedBtn').addEventListener('click', handleToggleClick);
    document.getElementById('oneSidedBtn').addEventListener('click', handleToggleClick);

    // Initialize slider value display
    updateSliderValue();

    // Perform initial calculation
    updateResults();
});
