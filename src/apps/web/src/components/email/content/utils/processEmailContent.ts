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
				if (attribs.style) {
					attribs.style = attribs.style.replace(
						/(^|\s)color\s*:\s*[^;]+;?/gi,
						""
					);
				}
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

// Client-side: Light styling + image preferences
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

	const html = $.html();

	// Apply theme-specific styles
	const themeStyles = `
    <style type="text/css">
      :host {
        display: block;
        line-height: 1.5;
        color: yellow !important;
      }

      *, *::before, *::after {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        padding: 0;
      }

      a {
        cursor: pointer;
        color: #60a5fa;
        text-decoration: underline;
      }

      p {
        color: white !important;
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
