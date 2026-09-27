# Web3Forms setup and release

Status (2026-09-27): the owner verified the account and supplied the real PUBLIC Access Key. One explicitly approved real browser submission succeeded. Web3Forms lists it in Inbox (not Spam), with the correct recipient and supplied text. The owner confirmed actual receipt in the Seznam mailbox. Release is prepared.

## Verified configuration

- Web3Forms form: `Bemer-lucie`; website `https://www.bemer-lucie.cz/`.
- Notification recipient: `lucieklozovaa@seznam.cz` (confirmed in Email Configuration).
- Free plan, 1/250 submissions after the single approved test.
- Advanced Spam Filter enabled, protection level Basic, Captcha Protection None. Auto Responder off.
- Submission retention is still the provider default of 3 years. No retention setting was changed; agree a shorter retention period with the owner before changing the automatic deletion policy.
- `npm test`: 43 passed. `npm run test:publish`: 18 passed and public key format check passed.
- Browser test: clicked the real form button once on localhost. The page did not navigate or open an email client; the success message appeared after the response and fields reset. Web3Forms Inbox shows the same single message at Sep 27, 2026, 02:03 PM. The owner confirmed actual receipt in Seznam with "Ano, dorazil"; the mailbox was not accessed by the agent.
- Test subject: `Poptávka z webu Lucka BEMER`. Body begins `TEST WEB3FORMS 2026-09-27`. Sender label: `Technická kontrola webu`. No client or health data was sent. No second submission was authorized or made.

## Finish setup

1. The owner signs in at https://app.web3forms.com using `lucieklozovaa@seznam.cz`, accepts the service terms and verifies the email.
2. Create a form for `https://www.bemer-lucie.cz/` on the Free plan. Confirm that its notification recipient is the address above.
3. Review submission retention with the owner (7 days is the shortest documented option). The current service stores submissions; do not rely on older documentation claiming no storage.
4. Copy the form's PUBLIC Access Key into `contact.form.accessKey` in `content/site.json`, or the matching field in Sveltia CMS. This is an email alias, not an account password/private API token. `recipientEmail` is informational only; the key controls actual routing.
5. Run `npm run seo:sync`, `npm test`, and `npm run test:publish`. The publication command intentionally fails while the key is missing. It checks format, not activation or deliverability.
6. Ask for approval immediately before sending any additional clearly labelled synthetic test message. Confirm receipt in the actual mailbox (including Spam); provider acceptance is not proof of inbox placement. Reset and duplicate-submit behavior also have mocked test coverage.
7. Publish through the existing GitHub Actions Pages workflow after activation and the real submission check. Verify the exact deployed commit and the official page's configuration. Keep the mailbox receipt check explicitly pending until the owner confirms it.

## Behaviour

- The button submits JSON directly to `https://api.web3forms.com/submit`, with no email-app launch or redirect.
- Require both an HTTP success and `success: true`. Keep entered data on errors or ambiguous timeouts; no automatic retry.
- Disable duplicate submissions while a request is pending; abort the wait after 20 seconds.
- Native required/email validation, field length limits, hidden botcheck and Web3Forms server spam filtering. No unused Google reCAPTCHA integration. Do not enable mandatory hCaptcha in the dashboard without first wiring its token into the frontend.
- Missing key or disabled JavaScript cannot accidentally send data to a placeholder endpoint; normal email/telephone links remain available.
- The build intentionally preserves form markup. Hidden settings are loaded from CMS in the browser; the submit button stays disabled until a valid key is loaded.
- Unit tests use a mocked network only. Passing tests is NOT proof of inbox delivery.

## References

- https://docs.web3forms.com/how-to-guides/html-and-javascript
- https://docs.web3forms.com/getting-started/installation
- https://web3forms.com/pricing
- https://web3forms.com/privacy
- https://web3forms.com/dpa
