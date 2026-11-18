// Photo credits (Unsplash). Photos are illustrative stock images, not the made-up cooks' real dishes.
// To add a credit, set `photographer`, `profile` and `photoUrl` for the meal id.
const UTM = "?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText";
const profile = (handle) => `https://unsplash.com/@${handle}${UTM}`;
const photo = (slug) => `https://unsplash.com/photos/${slug}${UTM}`;

export const PHOTO_CREDITS = [
  { mealId: "m03", photographer: "Prateek Jaiswal", profile: profile("prateekjaiswal"), photoUrl: photo("a-white-plate-topped-with-rice-and-beans-93RhzdPTCyU") },
  { mealId: "m04", photographer: "Abdelrahman Muhammed", profile: profile("abdo_muhammed"), photoUrl: photo("a-white-plate-topped-with-rice-and-meat-next-to-a-fork-nMMbu34xFiM") },
  { mealId: "m05", photographer: "Parsoa Khorsand", profile: profile("parsoakhorsand"), photoUrl: photo("cooked-food-on-black-frying-pan-9D9ZTZFUFg0") },
  { mealId: "m07", photographer: "Khanh Nguyen", profile: profile("thejourneyofframes"), photoUrl: photo("a-white-plate-topped-with-a-cut-in-half-sandwich-and-fries-VRI6WldGnl8") },
  { mealId: "m08", photographer: "Chez Le Libanais", profile: profile("chezlelibanais"), photoUrl: photo("falafel-platter-with-hummus-and-pita-XYELC0jO8_U") },
  { mealId: "m09", photographer: "Pixzolo Photography", profile: profile("pixzolo"), photoUrl: photo("person-holding-black-ceramic-bowl-with-rice-Qtd5z7g4thc") },
  { mealId: "m10", photographer: "Gennady Zakharin", profile: profile("gennady107"), photoUrl: photo("a-white-plate-topped-with-pasta-and-vegetables-3LQFsWhLdC8") },
  // Still to be matched to meals m01, m02, m06, m11, m12:
  //   Andrew Relf (@andrew_relf), photos/a-plate-of-food-iku1zhSNRU8
  //   Daniel Lloyd Blunk-Fernández (@blunkorama), photos/green-vegetable-on-white-ceramic-plate-14FSe2g8mhE
  //   plus three more credits. (Denis, @denis96, was the earlier Pad Thai photo and is no longer used.)
];
