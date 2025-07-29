export const extractBodyContent = (htmlString: string) => {
	const bodyMatch = htmlString.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
	return bodyMatch ? bodyMatch[1] : htmlString;
};
