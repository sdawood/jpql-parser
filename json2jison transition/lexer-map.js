/**
 *Meet data TAZ
 *
 *              ^   ^
 *             (@) (#)
 *                $
 *            <=-...+=>
 *
 *               ><
 *              DATA
 *              TAZ
 *
 *
 */
 Challenge 2 for jpql, blueprint the mapping for internal lexer mappings



var mapthis = [
"?<= #englishFromAmazon @(10) +=>{\"english\" in $lang}:(#primarySecondaryLang @(1) *=>{[$escapeAll(@.language.primary.toLowerCase()), $escapeAll(@.language.primary.toLowerCase())]})",
  "?<= #englishFromAmazon @(10) +=>{\"english\" in $lang}",
  "<=",
  "#englishFromAmazon",
  "#",
  "englishFromAmazon",
  "e",
  null,
  null,
  null,
  "n",
  "n",
  null,
  null,
  null,
  null,
  "@(10)",
  "@",
  "(10)",
  "10",
  "+",
  "=>",
  "{\"english\" in $lang}",
  ":(#primarySecondaryLang @(1) *=>{[$escapeAll(@.language.primary.toLowerCase()), $escapeAll(@.language.primary.toLowerCase())]})",
  "(#primarySecondaryLang @(1) *=>{[$escapeAll(@.language.primary.toLowerCase()), $escapeAll(@.language.primary.toLowerCase())]})",
  "#primarySecondaryLang",
  "#",
  "primarySecondaryLang",
  "p",
  null,
  null,
  null,
  "g",
  "g",
  null,
  null,
  null,
  null,
  "@(1)",
  "@",
  "(1)",
  "1",
  "*",
  "=>",
  "{[$escapeAll(@.language.primary.toLowerCase()), $escapeAll(@.language.primary.toLowerCase())]}"
]