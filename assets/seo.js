/* The same metadata model is used during static publication and CMS hydration. */
(() => {
  const origin = 'https://www.bemer-lucie.cz/';
  const absolute = value => new URL(value, origin).href;
  const metadata = (content, page) => {
    const seo = content.seo;
    const contact = content.contact;
    const url = page ? absolute(`${page.slug}/`) : origin;
    const title = page?.title || seo.title;
    const description = page?.description || seo.description;
    const image = absolute(seo.image);
    const graph = [
      { '@type': 'WebSite', '@id': `${origin}#website`, name: seo.siteName,
        alternateName: 'bemer-lucie.cz', url: origin, inLanguage: 'cs' },
      { '@type': 'Person', '@id': `${origin}#lucie-klozova`, name: contact.profile.name,
        url: `${origin}#o-mne`, ...(contact.profile.image?.src ? { image: absolute(contact.profile.image.src) } : {}),
        telephone: contact.phone, email: contact.email },
      { '@type': 'WebPage', '@id': `${url}#webpage`, url, name: title, description,
        inLanguage: 'cs', isPartOf: { '@id': `${origin}#website` },
        about: { '@id': `${origin}#bemer-sluzby` } },
      { '@type': 'Service', '@id': `${origin}#bemer-sluzby`,
        name: 'Konzultace BEMER a pronájem přístroje', url: `${origin}#cooperation`,
        serviceType: ['Osobní konzultace BEMER', 'Pronájem přístroje BEMER'],
        provider: { '@id': `${origin}#lucie-klozova` },
        areaServed: seo.areaServed.map(name => ({ '@type': 'City', name })) }
    ];
    if (page) graph.push({ '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Úvod', item: origin },
      { '@type': 'ListItem', position: 2, name: page.heading, item: url }
    ] });
    return { title, description, url, image, imageAlt: seo.imageAlt, siteName: seo.siteName,
      structured: { '@context': 'https://schema.org', '@graph': graph } };
  };
  const apply = content => {
    if (!content.seo) return;
    const data = metadata(content);
    document.title = data.title;
    const values = {
      'name:description': data.description,
      'property:og:title': data.title, 'property:og:description': data.description,
      'property:og:site_name': data.siteName, 'property:og:image': data.image,
      'property:og:image:alt': data.imageAlt,
      'name:twitter:title': data.title, 'name:twitter:description': data.description,
      'name:twitter:image': data.image, 'name:twitter:image:alt': data.imageAlt
    };
    Object.entries(values).forEach(([key, value]) => {
      const separator = key.indexOf(':');
      const attribute = key.slice(0, separator), name = key.slice(separator + 1);
      document.querySelector(`meta[${attribute}="${name}"]`)?.setAttribute('content', value);
    });
    const structured = document.getElementById('site-structured-data');
    if (structured) structured.textContent = JSON.stringify(data.structured).replace(/</g, '\\u003c');
  };
  globalThis.BemerSeo = { metadata, apply };
})();
