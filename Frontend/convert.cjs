const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..');
const destDir = path.join(__dirname, 'src', 'pages');

if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

function convertHtmlToJsx(html) {
    // Extract body content
    const match = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    let body = match ? match[1] : html;
    
    // Remove the script that tailwind-config uses from head maybe not needed if inside body
    
    // replace class= with className=
    body = body.replace(/class=/g, 'className=');
    // replace for= with htmlFor=
    body = body.replace(/for=/g, 'htmlFor=');
    // self close tags
    ['img', 'input', 'hr', 'br'].forEach(tag => {
        const regex = new RegExp(`<${tag}([^>]*[^/])>`, 'gi');
        body = body.replace(regex, `<${tag}$1 />`);
    });

    // convert style="..." to style={{...}}
    // simple hack: remove style tags or just ignore if there isn't many.
    // wait, there was a style="font-variation-settings: 'FILL' 1;"
    body = body.replace(/style="([^"]*)"/g, (match, p1) => {
        const rules = p1.split(';').filter(a => a.trim());
        const styleObj = {};
        rules.forEach(rule => {
            let [key, val] = rule.split(':');
            if (key && val) {
                key = key.trim().replace(/-([a-z])/g, g => g[1].toUpperCase());
                styleObj[key] = val.trim().replace(/'/g, "");
            }
        });
        return `style={${JSON.stringify(styleObj)}}`;
    });

    // Extract comments and fix them or remove them
    body = body.replace(/<!--[\s\S]*?-->/g, '');

    // remove stroke-width, stroke-dasharray and stroke-dashoffset etc because they have lowercase
    body = body.replace(/stroke-width/g, 'strokeWidth');
    body = body.replace(/stroke-dasharray/g, 'strokeDasharray');
    body = body.replace(/stroke-dashoffset/g, 'strokeDashoffset');
    body = body.replace(/fill-rule/g, 'fillRule');
    body = body.replace(/clip-rule/g, 'clipRule');
    body = body.replace(/stroke-linecap/g, 'strokeLinecap');
    body = body.replace(/stroke-linejoin/g, 'strokeLinejoin');

    return `import React from 'react';\n\nexport default function Component() {\n  return (\n    <div className="w-full min-h-screen bg-background text-on-surface font-body-md">\n      ${body}\n    </div>\n  );\n}`;
}

const folders = ['stitch_landing_page', 'stitch_dashboard', 'stitch_chat_interface_page', 'stitch_election_timeline_page', 'stitch_signup_page'];
const compNames = ['Landing', 'Dashboard', 'Chat', 'Timeline', 'Signup'];

folders.forEach((folder, i) => {
    const htmlPath = path.join(srcDir, folder, 'code.html');
    if (fs.existsSync(htmlPath)) {
        const html = fs.readFileSync(htmlPath, 'utf8');
        const jsx = convertHtmlToJsx(html);
        fs.writeFileSync(path.join(destDir, `${compNames[i]}.jsx`), jsx);
        console.log(`Converted ${folder}`);
    } else {
        console.log(`Skipped ${folder}`);
    }
});
