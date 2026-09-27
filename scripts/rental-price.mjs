export function rentalPrice(content) {
  const rentals = content.cooperation.steps.filter(step => step.id === 'rental');
  if (rentals.length !== 1) throw new Error('Exactly one cooperation card must have id "rental" for the rental page.');
  const price = rentals[0].price;
  return price?.active && price.text ? price.text : 'Aktuální cenu zapůjčení si prosím ověřte při konzultaci.';
}
