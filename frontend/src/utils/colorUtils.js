/**
 * Helper function for modulo arithmetic to keep values within a range (e.g., 0-360 for hue)
 */
function mod(n, m) {
  return ((n % m) + m) % m;
}

/**
 * Strategy for Split Complementary generation
 * @param {number} baseHue - The base hue (0-360)
 * @param {number} sat - Saturation (0-100)
 * @param {number} lit - Lightness (0-100)
 * @param {number} count - Number of colors to generate
 * @param {number} drift - Offset angle for the split complementary colors
 * @returns {Array} Array of HSL color objects
 */
export function split(baseHue, sat, lit, count, drift) {
  // Define angles: Base (0), and two opposites offset by 'drift'
  const angles = [0, 180 - drift * 2, 180 + drift * 2];
  
  return Array.from({ length: count }, (_, i) => ({
    // Use modulo 360 to keep the hue within the circle
    h: mod(baseHue + angles[i % 3], 360),
    s: sat,
    l: lit,
  }));
}

/**
 * Calculates the relative luminance of an RGB color.
 * Used for determining color contrast.
 * @param {Object} color - RGB object {r, g, b} (values 0-255)
 * @returns {number} Relative luminance (0-1)
 */
export function relativeLuminance({ r, g, b }) {
  // Normalize RGB values to 0-1 range and apply gamma correction
  const [rs, gs, bs] = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 
      ? v / 12.92 
      : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  // Standard luminance coefficients
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculates the contrast ratio between two colors based on WCAG standards.
 * @param {Object} color1 - RGB object {r, g, b}
 * @param {Object} color2 - RGB object {r, g, b}
 * @returns {number} Contrast ratio (1-21)
 */
export function getContrastRatio(color1, color2) {
  const l1 = relativeLuminance(color1);
  const l2 = relativeLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}
