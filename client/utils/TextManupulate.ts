export const extractText = (html: string): string => {
    const plainText = html.replace(/<\/?[^>]+(>|$)/g, "").trim();
    return plainText.length > 120 ? plainText.slice(0, 120) + "..." : plainText;
  };