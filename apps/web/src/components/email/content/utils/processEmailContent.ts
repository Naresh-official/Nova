// Enhanced email processing with better background detection
import sanitizeHtml from "sanitize-html";
import * as cheerio from "cheerio";

interface ProcessEmailOptions {
	html: string;
	shouldLoadImages: boolean;
	messageId?: string;
}

interface IAttachment {
	filename: string;
	mimeType: string;
	data: string; // base64
	size: number;
	src: string; // X-Attachment-Id or similar
}

// Helper function to check if a color is light/white
function isLightColor(color: string): boolean {
	if (!color) return false;

	// Normalize the color string
	color = color.toLowerCase().trim();

	// Check for explicit white values
	const whiteValues = [
		"white",
		"#fff",
		"#ffff",
		"#ffffff",
		"rgb(255,255,255)",
		"rgb(255, 255, 255)",
		"rgba(255,255,255,1)",
		"rgba(255, 255, 255, 1)",
		"hsl(0,0%,100%)",
		"hsl(0, 0%, 100%)",
	];

	if (whiteValues.includes(color)) return true;

	// Check RGB values
	const rgbMatch = color.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
	if (rgbMatch) {
		const [, r, g, b] = rgbMatch.map(Number);
		// Consider colors with high brightness as light
		const brightness = (r * 299 + g * 587 + b * 114) / 1000;
		return brightness > 200;
	}

	// Check hex values
	const hexMatch = color.match(/^#([a-f\d]{3}|[a-f\d]{6})$/i);
	if (hexMatch) {
		const hex = hexMatch[1];
		const r = parseInt(
			hex.length === 3 ? hex[0] + hex[0] : hex.substr(0, 2),
			16
		);
		const g = parseInt(
			hex.length === 3 ? hex[1] + hex[1] : hex.substr(2, 2),
			16
		);
		const b = parseInt(
			hex.length === 3 ? hex[2] + hex[2] : hex.substr(4, 2),
			16
		);
		const brightness = (r * 299 + g * 587 + b * 114) / 1000;
		return brightness > 200;
	}

	return false;
}

// Server-side: Heavy lifting, preference-independent processing
export function preprocessEmailHtml(html: string): string {
	const sanitizeConfig: sanitizeHtml.IOptions = {
		allowedTags: sanitizeHtml.defaults.allowedTags.concat([
			"img",
			"title",
			"details",
			"summary",
		]),

		allowedAttributes: {
			"*": [
				"class",
				"style",
				"align",
				"valign",
				"width",
				"height",
				"cellpadding",
				"cellspacing",
				"border",
				"bgcolor",
				"colspan",
				"rowspan",
			],
			a: ["href", "name", "target", "rel", "class", "style"],
			img: ["src", "alt", "width", "height", "class", "style"],
		},

		// Allow only safe schemes - no blob for security
		allowedSchemes: ["http", "https", "mailto", "tel", "data", "cid"],
		allowedSchemesByTag: {
			img: ["http", "https", "data", "cid"],
		},

		transformTags: {
			"*": (tagName, attribs) => {
				// Don't remove color styles here - we'll handle them in client-side processing
				return { tagName, attribs };
			},
			a: (tagName, attribs) => {
				attribs.target = attribs.target || "_blank";
				attribs.rel = "noopener noreferrer";
				return { tagName, attribs };
			},
		},
	};

	const sanitized = sanitizeHtml(html, sanitizeConfig);
	const $ = cheerio.load(sanitized);

	// Collapse quoted text (structure only, no theme colors)
	const collapseQuoted = (selector: string) => {
		$(selector).each((_, el) => {
			const $el = $(el);
			if ($el.parents("details.quoted-toggle").length) return;

			const innerHtml = $el.html();
			if (typeof innerHtml !== "string") return;
			const detailsHtml = `<details class="quoted-toggle" style="margin-top:1em;">
          <summary style="cursor:pointer;" data-theme-color="muted">
            Show quoted text
          </summary>
          ${innerHtml}
        </details>`;

			$el.replaceWith(detailsHtml);
		});
	};

	collapseQuoted("blockquote");
	collapseQuoted(".gmail_quote");

	// Remove unwanted elements
	$("title").remove();
	$('img[width="1"][height="1"]').remove();
	$('img[width="0"][height="0"]').remove();

	// Remove preheader content
	$('.preheader, .preheaderText, [class*="preheader"]').each((_, el) => {
		const $el = $(el);
		const style = $el.attr("style") || "";
		if (
			style.includes("display:none") ||
			style.includes("display: none") ||
			style.includes("font-size:0") ||
			style.includes("font-size: 0") ||
			style.includes("line-height:0") ||
			style.includes("line-height: 0") ||
			style.includes("max-height:0") ||
			style.includes("max-height: 0") ||
			style.includes("mso-hide:all") ||
			style.includes("opacity:0") ||
			style.includes("opacity: 0")
		) {
			$el.remove();
		}
	});

	return $.html();
}

// Client-side: Light styling + image preferences + intelligent text color handling
export function applyEmailPreferences(
	preprocessedHtml: string,
	shouldLoadImages: boolean
): { processedHtml: string; hasBlockedImages: boolean } {
	let hasBlockedImages = false;

	const $ = cheerio.load(preprocessedHtml);

	// Handle image blocking if needed
	$("img").each((_, el) => {
		const $img = $(el);
		const src = $img.attr("src");

		$img.attr("onerror", "this.style.display='none';");

		// Allow CID images (inline attachments)
		if (!shouldLoadImages && src && !src.startsWith("cid:")) {
			hasBlockedImages = true;
			$img.replaceWith(
				`<span style="display:none;"><!-- blocked image: ${src} --></span>`
			);
		}
	});

	// Intelligently handle text colors based on backgrounds
	$("*").each((_, el) => {
		const $el = $(el);
		const style = $el.attr("style") || "";
		const bgColor = $el.attr("bgcolor");

		// Check for background colors in style attribute
		const bgColorMatch = style.match(/background(?:-color)?\s*:\s*([^;]+)/i);
		const backgroundMatch = style.match(/background\s*:\s*([^;]+)/i);

		const elementBgColor =
			bgColor ||
			(bgColorMatch && bgColorMatch[1]) ||
			(backgroundMatch && backgroundMatch[1]);

		if (elementBgColor && isLightColor(elementBgColor)) {
			// Add a class to identify elements with light backgrounds
			const existingClass = $el.attr("class") || "";
			$el.attr("class", `${existingClass} light-bg-element`.trim());
		}
	});

	const html = $.html();

	// Apply theme-specific styles with better contrast handling
	const themeStyles = `
    <style>
      :host {
        display: block;
        line-height: 1.5;
      }

      *, *::before, *::after {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        padding: 0;
        color: white;
      }

      /* Default dark theme styles */
      a {
        cursor: pointer;
        color: #60A5FA !important;
        text-decoration: underline;
      }

      h1, h2, h3, h4, h5, h6, p, span, div, td, th {
        color: white !important;
      }

      /* Light background handling - more specific selectors */
      .light-bg-element,
      .light-bg-element *,
      .light-bg-element h1,
      .light-bg-element h2,
      .light-bg-element h3,
      .light-bg-element h4,
      .light-bg-element h5,
      .light-bg-element h6,
      .light-bg-element p,
      .light-bg-element span,
      .light-bg-element div,
      .light-bg-element td,
      .light-bg-element th {
        color: #000000 !important;
      }

      .light-bg-element a {
        color: #1D4ED8 !important;
      }

      /* Additional patterns for white backgrounds */
      [style*="background-color: white"],
      [style*="background-color:#ffffff"],
      [style*="background-color: #ffffff"],
      [style*="background-color:#FFFFFF"],
      [style*="background-color: #FFFFFF"],
      [style*="background-color:rgb(255,255,255)"],
      [style*="background-color: rgb(255, 255, 255)"],
      [style*="background: white"],
      [style*="background:#ffffff"],
      [style*="background: #ffffff"],
      [style*="background:#FFFFFF"],
      [style*="background: #FFFFFF"],
      [style*="background:rgb(255,255,255)"],
      [style*="background: rgb(255, 255, 255)"],
      [bgcolor="white"],
      [bgcolor="#ffffff"],
      [bgcolor="#FFFFFF"] {
        color: #000000 !important;
      }

      [style*="background-color: white"] *,
      [style*="background-color:#ffffff"] *,
      [style*="background-color: #ffffff"] *,
      [style*="background-color:#FFFFFF"] *,
      [style*="background-color: #FFFFFF"] *,
      [style*="background-color:rgb(255,255,255)"] *,
      [style*="background-color: rgb(255, 255, 255)"] *,
      [style*="background: white"] *,
      [style*="background:#ffffff"] *,
      [style*="background: #ffffff"] *,
      [style*="background:#FFFFFF"] *,
      [style*="background: #FFFFFF"] *,
      [style*="background:rgb(255,255,255)"] *,
      [style*="background: rgb(255, 255, 255)"] *,
      [bgcolor="white"] *,
      [bgcolor="#ffffff"] *,
      [bgcolor="#FFFFFF"] * {
        color: #000000 !important;
      }

      [style*="background-color: white"] a,
      [style*="background-color:#ffffff"] a,
      [style*="background-color: #ffffff"] a,
      [style*="background-color:#FFFFFF"] a,
      [style*="background-color: #FFFFFF"] a,
      [style*="background-color:rgb(255,255,255)"] a,
      [style*="background-color: rgb(255, 255, 255)"] a,
      [style*="background: white"] a,
      [style*="background:#ffffff"] a,
      [style*="background: #ffffff"] a,
      [style*="background:#FFFFFF"] a,
      [style*="background: #FFFFFF"] a,
      [style*="background:rgb(255,255,255)"] a,
      [style*="background: rgb(255, 255, 255)"] a,
      [bgcolor="white"] a,
      [bgcolor="#ffffff"] a,
      [bgcolor="#FFFFFF"] a {
        color: #1D4ED8 !important;
      }

      table {
        border-collapse: collapse !important;
      }

      ::selection {
        background: #7f22fe !important;
        text-shadow: none !important;
      }

      details.quoted-toggle {
        border-left: 2px solid #374151 !important;
        padding-left: 8px !important;
        margin-top: 0.75rem !important;
      }

      details.quoted-toggle summary {
        cursor: pointer !important;
        color: #9CA3AF !important;
        list-style: none !important;
        user-select: none !important;
      }

      details.quoted-toggle summary::-webkit-details-marker {
        display: none !important;
      }

      [data-theme-color="muted"] {
        color: #9CA3AF !important;
      }

      img {
        max-width: 100% !important;
        height: auto !important;
        border-radius: 8px !important;
        display: block !important;
      }
    </style>
  `;

	const finalHtml = html.includes("<head")
		? html.replace(/<head[^>]*>/i, (match) => `${match}\n${themeStyles}`)
		: `${themeStyles}${html}`;

	return {
		processedHtml: finalHtml,
		hasBlockedImages,
	};
}

function injectInlineAttachments(html: string, inline: IAttachment[] = []) {
	const dom = new DOMParser().parseFromString(html, "text/html");

	// loop through all <img> elements
	const images = dom.querySelectorAll("img[src^='cid:']");

	images.forEach(async (img) => {
		const cid = img.getAttribute("src")?.replace("cid:", "").trim();
		if (!cid) return;

		const matching = inline.find((att) => att.src === cid);

		if (matching) {
			img.setAttribute("src", matching.data);
			img.setAttribute("alt", matching.filename);
			img.setAttribute("width", "auto");
			img.setAttribute("height", "auto");
			img.setAttribute(
				"style",
				"max-width: 100%; height: auto;border-radius: 8px;"
			);
		} else {
			img.setAttribute("src", ""); // Remove src if no match found
		}
	});

	return dom.documentElement.innerHTML;
}

// Original function for backward compatibility
export function processEmailHtml({
	html,
	shouldLoadImages,
	inlineAttachments = [],
}: ProcessEmailOptions & {
	inlineAttachments?: IAttachment[];
}): {
	processedHtml: string;
	hasBlockedImages: boolean;
} {
	const preprocessed = preprocessEmailHtml(html);
	const withInlines = injectInlineAttachments(preprocessed, inlineAttachments);
	return applyEmailPreferences(withInlines, shouldLoadImages);
}

// Updated React component styles
export const getEnhancedShadowStyles = () => `
<style>
	/* Base styles */
	a {
		color: white !important;
	}

	/* JavaScript-enhanced background detection */
	.email-wrapper {
		color: white;
	}

	/* Comprehensive white background detection */
	[style*="background-color: white"],
	[style*="background-color:#fff"],
	[style*="background-color: #fff"],
	[style*="background-color:#ffffff"],
	[style*="background-color: #ffffff"],
	[style*="background-color:#FFFFFF"],
	[style*="background-color: #FFFFFF"],
	[style*="background-color:rgb(255,255,255)"],
	[style*="background-color: rgb(255, 255, 255)"],
	[style*="background-color:rgb(255,255,255,1)"],
	[style*="background-color: rgb(255, 255, 255, 1)"],
	[style*="background: white"],
	[style*="background:#fff"],
	[style*="background: #fff"],
	[style*="background:#ffffff"],
	[style*="background: #ffffff"],
	[style*="background:#FFFFFF"],
	[style*="background: #FFFFFF"],
	[style*="background:rgb(255,255,255)"],
	[style*="background: rgb(255, 255, 255)"],
	[bgcolor="white"],
	[bgcolor="#fff"],
	[bgcolor="#ffffff"],
	[bgcolor="#FFFFFF"],
	.light-bg-detected {
		color: black !important;
	}

	[style*="background-color: white"] *,
	[style*="background-color:#fff"] *,
	[style*="background-color: #fff"] *,
	[style*="background-color:#ffffff"] *,
	[style*="background-color: #ffffff"] *,
	[style*="background-color:#FFFFFF"] *,
	[style*="background-color: #FFFFFF"] *,
	[style*="background-color:rgb(255,255,255)"] *,
	[style*="background-color: rgb(255, 255, 255)"] *,
	[style*="background-color:rgb(255,255,255,1)"] *,
	[style*="background-color: rgb(255, 255, 255, 1)"] *,
	[style*="background: white"] *,
	[style*="background:#fff"] *,
	[style*="background: #fff"] *,
	[style*="background:#ffffff"] *,
	[style*="background: #ffffff"] *,
	[style*="background:#FFFFFF"] *,
	[style*="background: #FFFFFF"] *,
	[style*="background:rgb(255,255,255)"] *,
	[style*="background: rgb(255, 255, 255)"] *,
	[bgcolor="white"] *,
	[bgcolor="#fff"] *,
	[bgcolor="#ffffff"] *,
	[bgcolor="#FFFFFF"] *,
	.light-bg-detected * {
		color: black !important;
	}

	/* Keep links readable on light backgrounds */
	[style*="background-color: white"] a,
	[style*="background-color:#fff"] a,
	[style*="background-color: #fff"] a,
	[style*="background-color:#ffffff"] a,
	[style*="background-color: #ffffff"] a,
	[style*="background-color:#FFFFFF"] a,
	[style*="background-color: #FFFFFF"] a,
	[style*="background-color:rgb(255,255,255)"] a,
	[style*="background-color: rgb(255, 255, 255)"] a,
	[style*="background: white"] a,
	[style*="background:#fff"] a,
	[style*="background: #fff"] a,
	[style*="background:#ffffff"] a,
	[style*="background: #ffffff"] a,
	[style*="background:#FFFFFF"] a,
	[style*="background: #FFFFFF"] a,
	[style*="background:rgb(255,255,255)"] a,
	[style*="background: rgb(255, 255, 255)"] a,
	[bgcolor="white"] a,
	[bgcolor="#fff"] a,
	[bgcolor="#ffffff"] a,
	[bgcolor="#FFFFFF"] a,
	.light-bg-detected a {
		color: #1D4ED8 !important;
	}
</style>
`;

// JavaScript function to detect light backgrounds
export const detectLightBackgrounds = () => `
	// Function to check if a color is light
	function isLightColor(color) {
		if (!color) return false;
		
		color = color.toLowerCase().trim();
		
		// Check for explicit white values
		const whiteValues = [
			'white', '#fff', '#ffff', '#ffffff',
			'rgb(255,255,255)', 'rgb(255, 255, 255)',
			'rgba(255,255,255,1)', 'rgba(255, 255, 255, 1)'
		];
		
		if (whiteValues.includes(color)) return true;
		
		// Check RGB values
		const rgbMatch = color.match(/rgb\\(\\s*(\\d+)\\s*,\\s*(\\d+)\\s*,\\s*(\\d+)\\s*\\)/);
		if (rgbMatch) {
			const [, r, g, b] = rgbMatch.map(Number);
			const brightness = (r * 299 + g * 587 + b * 114) / 1000;
			return brightness > 200;
		}
		
		// Check hex values
		const hexMatch = color.match(/^#([a-f\\d]{3}|[a-f\\d]{6})$/i);
		if (hexMatch) {
			const hex = hexMatch[1];
			const r = parseInt(hex.length === 3 ? hex[0] + hex[0] : hex.substr(0, 2), 16);
			const g = parseInt(hex.length === 3 ? hex[1] + hex[1] : hex.substr(2, 2), 16);
			const b = parseInt(hex.length === 3 ? hex[2] + hex[2] : hex.substr(4, 2), 16);
			const brightness = (r * 299 + g * 587 + b * 114) / 1000;
			return brightness > 200;
		}
		
		return false;
	}

	// Check all elements for light backgrounds
	function detectAndMarkLightBackgrounds() {
		const elements = document.querySelectorAll('*');
		elements.forEach(el => {
			const computedStyle = window.getComputedStyle(el);
			const bgColor = computedStyle.backgroundColor;
			const bgImg = computedStyle.backgroundImage;
			
			// Skip elements with background images (they might not be light)
			if (bgImg && bgImg !== 'none') return;
			
			if (isLightColor(bgColor)) {
				el.classList.add('light-bg-detected');
			}
		});
	}

	// Run detection when DOM is ready
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', detectAndMarkLightBackgrounds);
	} else {
		detectAndMarkLightBackgrounds();
	}
`;
