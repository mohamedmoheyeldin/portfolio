const origin = 'http://127.0.0.1:4321';
const assistantPath = '/portfolio/assistant/';

const assistantResponse = await fetch(`${origin}${assistantPath}`);

if (!assistantResponse.ok) {
  throw new Error(
    `Expected ${assistantPath} to return 200, received ${assistantResponse.status}.`,
  );
}

const assistantHtml = await assistantResponse.text();

if (!assistantHtml.includes('Autonomous Application System')) {
  throw new Error(`The served ${assistantPath} response is not the assistant page.`);
}

const stylesheetMatch = assistantHtml.match(
  /href="(\/portfolio\/_astro\/[^"?]+\.css(?:\?[^\"]*)?)"/,
);

if (!stylesheetMatch) {
  throw new Error(`The served ${assistantPath} response has no prefixed stylesheet.`);
}

const stylesheetResponse = await fetch(`${origin}${stylesheetMatch[1]}`);

if (!stylesheetResponse.ok) {
  throw new Error(
    `Expected ${stylesheetMatch[1]} to return 200, received ${stylesheetResponse.status}.`,
  );
}

const contentType = stylesheetResponse.headers.get('content-type') ?? '';

if (!contentType.includes('text/css')) {
  throw new Error(
    `Expected ${stylesheetMatch[1]} to be CSS, received ${contentType || 'no content type'}.`,
  );
}

console.log(`Validated served Pages route ${assistantPath} and its stylesheet.`);
