/** Fictional iPhone 18 Pro Max concept photography. */
const A = (name: string) => `${import.meta.env.BASE_URL}media/${name}`;
export const MEDIA = {
  hero: A('iphone-hero.webp'), lens: A('iphone-silver.webp'), dial: A('iphone-blue.webp'), hand: A('iphone-sand.webp'),
  plinth: A('iphone-blue.webp'), rear: A('iphone-blue.webp'), street: A('iphone-hero.webp'), side: A('iphone-silver.webp'),
  midnight: A('iphone-midnight.webp'), silver: A('iphone-silver.webp'), blue: A('iphone-blue.webp'), sand: A('iphone-sand.webp'),
} as const;
