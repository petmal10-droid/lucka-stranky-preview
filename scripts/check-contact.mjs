import { readFileSync } from 'node:fs';

const content = JSON.parse(readFileSync(new URL('../content/site.json', import.meta.url), 'utf8'));
const key = content.contact?.form?.accessKey?.trim();
if (!/^[a-f\d]{8}(?:-[a-f\d]{4}){3}-[a-f\d]{12}$/i.test(key || '') || /^0+(?:-0+)+$/.test(key)) {
  console.error('Publication blocked: configure the verified Web3Forms public Access Key in contact.form.accessKey first.');
  process.exitCode = 1;
} else {
  console.log('Web3Forms key format checked. Actual inbox delivery must also be verified before release.');
}
