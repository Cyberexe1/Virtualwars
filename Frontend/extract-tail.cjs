const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '..', 'stitch_landing_page', 'code.html');
const html = fs.readFileSync(htmlPath, 'utf8');

const match = html.match(/tailwind\.config = (\{[\s\S]*?\})\s*<\/script>/);

if (match) {
    let configStr = match[1];
    configStr = configStr.replace(/darkMode:\s*"class",/g, 'darkMode: "class",\n  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],');
    
    fs.writeFileSync(path.join(__dirname, 'tailwind.config.js'), `/** @type {import('tailwindcss').Config} */\nexport default ${configStr};\n`);
    console.log("Written tailwind.config.js");
}
