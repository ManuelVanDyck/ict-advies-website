import { client } from './client';

// =====================================
// TUTORIALS QUERIES
// =====================================

export async function getTutorials() {
  return client.fetch(
    `*[_type == "tutorial" && (status == "published" || !defined(status)) && isSubtutorial != true] | order(publishedAt desc) {
      _id,
      title,
      slug,
      excerpt,
      publishedAt,
      "category": category->{ title, slug },
      "coverImage": coverImage.asset->url
    }`
  );
}

export async function getTutorialBySlug(slug: string) {
  return client.fetch(
    `*[_type == "tutorial" && slug.current == $slug && (status == "published" || !defined(status))][0] {
      _id,
      title,
      slug,
      excerpt,
      publishedAt,
      body,
      "category": category->{ title, slug },
      "coverImage": coverImage.asset->url
    }`,
    { slug }
  );
}

export async function getCategories() {
  return client.fetch(
    `*[_type == "category"] | order(title asc) {
      _id,
      title,
      slug,
      description
    }`
  );
}

// =====================================
// LEERPADEN QUERIES
// =====================================

export async function getLeerpaden() {
  return client.fetch(
    `*[_type == "leerpad" && (status == "published" || !defined(status))] | order(profiel asc) {
      _id,
      titel,
      slug,
      profiel,
      doelgroep,
      totaleDuur,
      featured,
      doelstellingen,
      "modules": modules[]->{ _id, titel, slug, duur }
    }`
  );
}

export async function getLeerpadBySlug(slug: string) {
  return client.fetch(
    `*[_type == "leerpad" && slug.current == $slug && (status == "published" || !defined(status))][0] {
      _id,
      titel,
      slug,
      profiel,
      doelgroep,
      totaleDuur,
      featured,
      doelstellingen,
      voorwaarden,
      certificaat,
      "modules": modules[]-> | order(volgorde asc) {
        _id,
        titel,
        slug,
        volgorde,
        duur,
        beschrijving,
        digcompeduDomein,
        aiStap,
        tools
      }
    }`,
    { slug }
  );
}

export async function getModuleBySlug(leerpadSlug: string, moduleSlug: string) {
  // Eerst de module/tutorial ophalen (published of zonder status)
  // Modules kunnen zowel _type "module" als "tutorial" zijn
  const moduleData = await client.fetch(
    `*[((_type == "module" || _type == "tutorial") && slug.current == $moduleSlug) && (status == "published" || !defined(status))][0] {
      _id,
      _type,
      "titel": coalesce(titel, title),
      slug,
      volgorde,
      duur,
      "beschrijving": coalesce(beschrijving, excerpt),
      inhoud,
      body,
      videoUrl,
      praktijkopdracht,
      digcompeduDomein,
      aiStap,
      tools,
      "tutorials": tutorials[]->{ _id, title, slug, excerpt },
      "opdracht": opdracht
    }`,
    { moduleSlug }
  );

  if (!moduleData) return null;

  // Dan het leerpad zoeken dat deze module bevat (published of zonder status)
  const leerpad = await client.fetch(
    `*[_type == "leerpad" && slug.current == $leerpadSlug && (status == "published" || !defined(status)) && $moduleId in modules[]._ref][0] {
      _id,
      titel,
      slug,
      profiel,
      "modules": modules[]->{ _id, "titel": coalesce(titel, title), slug, volgorde }
    }`,
    { leerpadSlug, moduleId: moduleData._id }
  );

  if (!leerpad) return null;

  // Vorige en volgende module berekenen
  const moduleIndex = leerpad.modules?.findIndex((m: any) => m._id === moduleData._id) ?? -1;
  const vorigeModule = moduleIndex > 0 ? leerpad.modules[moduleIndex - 1] : null;
  const volgendeModule = moduleIndex < (leerpad.modules?.length ?? 0) - 1 ? leerpad.modules[moduleIndex + 1] : null;

  return {
    ...moduleData,
    leerpad: {
      _id: leerpad._id,
      titel: leerpad.titel,
      slug: leerpad.slug,
      profiel: leerpad.profiel
    },
    vorigeModule,
    volgendeModule
  };
}

export async function getLeerpadenByProfiel(profiel: string) {
  return client.fetch(
    `*[_type == "leerpad" && profiel == $profiel && (status == "published" || !defined(status))] {
      _id,
      titel,
      slug,
      profiel,
      totaleDuur,
      "modules": modules[]->{ _id, titel, slug, duur }
    }`,
    { profiel }
  );
}
