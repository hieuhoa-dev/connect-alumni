import { and, type SQL, type SQLWrapper, sql } from "drizzle-orm";

// C locales classify accented letters differently. Include Vietnamese letters
// and combining accents explicitly so a prefix cannot start inside another word.
const WORD_START = String.raw`(^|[^[:alnum:]_À-ÖØ-öø-ÿĀ-žƠ-ưẠ-ỹ\u0300-\u036f])`;
const VIETNAMESE_LOWERCASE =
  "àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ";

/** Keep Vietnamese accents and literal technical terms such as C++, C# and node.js. */
export const getSearchTerms = (value?: string): string[] => {
  const keyword = value?.normalize("NFC").trim().slice(0, 160).toLowerCase();
  return [
    ...new Set(
      keyword?.match(
        /[\p{L}\p{N}][\p{L}\p{M}\p{N}%_]*(?:\.[\p{L}\p{N}][\p{L}\p{M}\p{N}%_]*)*(?:[+#]+)?/gu,
      ) ?? [],
    ),
  ];
};

/** Search the visible TipTap text, never HTML attributes, URLs or hidden scripts. */
export const getSearchableText = (column: SQLWrapper): SQL => {
  let text = sql`coalesce(${column}, '')`;
  text = sql`regexp_replace(${text}, ${"<(script|style)\\y[^>]*>.*?</\\1\\s*>|<!--.*?-->"}, '', 'gis')`;
  text = sql`regexp_replace(${text}, ${"</?(p|div|h[1-6]|li|ul|ol|blockquote|pre|table|tr|td|th|section|br)\\y[^>]*>"}, ' ', 'gi')`;
  text = sql`regexp_replace(${text}, '<[^>]*>', '', 'g')`;
  text = sql`regexp_replace(${text}, '&(nbsp|#160|#x0*a0);', ' ', 'gi')`;
  for (const [entity, replacement] of [
    ["&(amp|#38|#x0*26);", "&"],
    ["&(lt|#60|#x0*3c);", "<"],
    ["&(gt|#62|#x0*3e);", ">"],
    ["&(quot|#34|#x0*22);", '"'],
    ["&(apos|#39|#x0*27);", "'"],
  ]) {
    text = sql`regexp_replace(${text}, ${entity}, ${replacement}, 'gi')`;
  }
  return text;
};

/** Match each word from its first letter, so results appear while typing. */
export const getSearchCondition = (
  value: string | undefined,
  fields: readonly SQLWrapper[],
): SQL | undefined => {
  if (!value?.trim()) return undefined;
  const terms = getSearchTerms(value);
  if (!terms.length || !fields.length) return sql`false`;
  // Normalize visible Unicode and map accented capitals even in a C locale,
  // where PostgreSQL's case-insensitive regex does not fold Vietnamese accents.
  const document = sql`translate(normalize(concat_ws(' ', ${sql.join([...fields], sql`, `)}), NFC), ${VIETNAMESE_LOWERCASE.toUpperCase()}, ${VIETNAMESE_LOWERCASE})`;
  return and(
    ...terms.map((term) => {
      const literal = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return sql`${document} ~* ${`${WORD_START}${literal}`}`;
    }),
  );
};
