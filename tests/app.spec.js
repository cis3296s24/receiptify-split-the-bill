// @ts-check
const { test, expect } = require("@playwright/test");
//const { test, expect } = require("playwright-test-coverage");


test('homepage has title', async ({ page }) => {
  await page.goto('http://localhost:3000/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Receiptify/);
});

test('join has title', async ({ page }) => {
  await page.goto('http://localhost:3000/join');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Join/);
});

test('verify login link', async ({ page }) => {
  await page.goto('http://localhost:3000/');

  // Wait for the link element to appear on the page
  const link = await page.waitForSelector('a[href="/login"]');

  // Check if the link exists
  expect(link).not.toBeNull();
});

test('verify join link', async ({ page }) => {
  await page.goto('http://localhost:3000/');

  // Wait for the link element to appear on the page
  const link = await page.waitForSelector('a[href="/join"]');

  // Check if the link exists
  expect(link).not.toBeNull();
});

test('verify receipt shown with sessionID', async ({ page }) => {
  await page.goto('http://localhost:3000/#client=spotify&access_token=BQAzDrIGbK7zymnqRlL4lvoUAikbeTo5XmSYs8ZWO3PlQaqHOEvVMwfHB8-Y0tAljDFjkkV-ZOdRJmUl7bFnP542pQsQVUPvFF8sSjhAc8T8ULSOyTc2q7NcUyzXL4Jo1Aoa3_J4dn_QNHRkrPM2sqV0xKIL55iTGV5EHl90Owic5f1aZWN8VmD6JBDDoZbgLhpel4bkJCpWlEQWORQTj_tfaizdyOk6LGcKB0V0Fa8om8e39bUzCeGS&refresh_token=AQCj4b-7yq4VNNQpZq5eGCjsyEIEnPxWufw-8cJ6rsf2bKn4oiUDbV_f2Hvy86B7nJWYSVN0IDJ0MWBp4SuxKKsqka89FS2cugj4c2yTz1QfYiQs0BTpCFFLhNaoeV6qy-4&sessionID=660497');

  // Wait for an element containing the word to appear on the page
  await page.waitForSelector('body'); // Wait for the body element to ensure the page is loaded
  const textContent = await page.textContent('body');

  // Check if the word is present in the page content
  //const word = 'SESSIONID';
  const word = 'SESSIONID';
  // @ts-ignore
  const isWordPresent = textContent.toLowerCase().includes(word.toLowerCase());

  // Assert that the word is present
  expect(isWordPresent).toBe(true);
  
});

test('verify receipt shown with display name', async ({ page }) => {
  await page.goto('http://localhost:3000/#client=spotify&access_token=BQAzDrIGbK7zymnqRlL4lvoUAikbeTo5XmSYs8ZWO3PlQaqHOEvVMwfHB8-Y0tAljDFjkkV-ZOdRJmUl7bFnP542pQsQVUPvFF8sSjhAc8T8ULSOyTc2q7NcUyzXL4Jo1Aoa3_J4dn_QNHRkrPM2sqV0xKIL55iTGV5EHl90Owic5f1aZWN8VmD6JBDDoZbgLhpel4bkJCpWlEQWORQTj_tfaizdyOk6LGcKB0V0Fa8om8e39bUzCeGS&refresh_token=AQCj4b-7yq4VNNQpZq5eGCjsyEIEnPxWufw-8cJ6rsf2bKn4oiUDbV_f2Hvy86B7nJWYSVN0IDJ0MWBp4SuxKKsqka89FS2cugj4c2yTz1QfYiQs0BTpCFFLhNaoeV6qy-4&sessionID=660497');

  // Wait for an element containing the word to appear on the page
  await page.waitForSelector('body'); // Wait for the body element to ensure the page is loaded
  const textContent = await page.textContent('body');

  // Check if the word is present in the page content
  const word = 'Nina Perone';
  // @ts-ignore
  const isWordPresent = textContent.toLowerCase().includes(word.toLowerCase());

  // Assert that the word is present
  expect(isWordPresent).toBe(true);
  
});