import fs from 'fs';

const src = fs.readFileSync('uniquera-consultation-form/templates/form-fragment.html', 'utf8');

function extractBlock(html, startMarker, endMarker) {
  const start = html.indexOf(startMarker);
  const end = html.indexOf(endMarker, start);
  if (start < 0 || end < 0) throw new Error(`Missing: ${startMarker}`);
  return html.slice(start, end + endMarker.length);
}

const q2 = extractBlock(src, '<!--question-2-->', '<!--question-3-->');
const q6 = extractBlock(src, '<!--question-6-->', '<!--question-7-->');
const q7 = extractBlock(src, '<!--question-7-->', '<!--question-8-->');
const q10 = extractBlock(src, '<!--question-10-->', '<!--question-10_end-->');

let q1 = q2
  .replace(/<!--question-2-->/g, '<!--question-1-->')
  .replace(/id="question-2"/g, 'id="question-1"')
  .replace(/data-question="2"/g, 'data-question="1"')
  .replace(/class="question hair-question"/g, 'class="question hair-question step"')
  .replace(
    /<div class="row justify-content-center full-width question-female">[\s\S]*?<!--male-->/,
    '',
  )
  .replace(/<!--question-2-female_end-->/g, '<!--question-1_end-->');

let q2n = q6
  .replace(/<!--question-6-->/g, '<!--question-2-->')
  .replace(/id="question-6"/g, 'id="question-2"')
  .replace(/data-question="6"/g, 'data-question="2"')
  .replace(/<!--question-6_end-->/g, '<!--question-2_end-->');

let q3n = q7
  .replace(/<!--question-7-->/g, '<!--question-3-->')
  .replace(/id="question-7"/g, 'id="question-3"')
  .replace(/data-question="7"/g, 'data-question="3"')
  .replace(/<!--question-7_end-->/g, '<!--question-3_end-->');

let q4n = q10
  .replace(/<!--question-10-->/g, '<!--question-4-->')
  .replace(/id="question-10"/g, 'id="question-4"')
  .replace(/data-question="10"/g, 'data-question="4"')
  .replace(/<!--question-10_end-->/g, '<!--question-4_end-->');

// Shell matches full form (#onlineForm) so shared theme CSS applies.
const qContentOpen = src.indexOf('<div class="question-content">');
const shellEnd = qContentOpen + '<div class="question-content">'.length;
let shell = src.slice(0, shellEnd);

shell = shell.replace(
  /<div class="title-image">[\s\S]*?<\/div>\s*<\/div>\s*<div class="col-sm-7/,
  `<div class="title-image">
                                <img src="../assets/form/images/transparent/2.png" data-step="1" alt="step 1">
                                <img src="../assets/form/images/transparent/6.png" data-step="2" alt="step 2">
                                <img src="../assets/form/images/transparent/7.png" data-step="3" alt="step 3">
                                <img src="../assets/form/images/transparent/5.png" data-step="4" alt="step 4">
                            </div>
                        </div>
                        <div class="col-sm-7`,
);

shell = shell.replace(
  '<form enctype="multipart/form-data">',
  `<form enctype="multipart/form-data">
                    <input type="hidden" name="gender" value="male">
                    <input type="hidden" name="form_variant" value="short">`,
);

const footerPart = src.slice(
  src.indexOf('<div class="form-button-wrapper">'),
  src.indexOf('<!--footer-->'),
);

const endPart = src.slice(src.indexOf('<!--footer-->'), src.indexOf('<style>'));

let styles = src.slice(src.indexOf('<style>'), src.indexOf('<script>'));

// Mobile rules: hair step is #question-1, contact step is #question-4 (keep #onlineForm).
styles = styles
  .replace(/#question-2\b/g, '#question-1')
  .replace(/#question-10\b/g, '#question-4')
  .replace(/:not\(#question-10\)/g, ':not(#question-4)')
  .replace(/uniquera-step10-field/g, 'uniquera-step10-field');

const out = (
  shell +
  '\n' +
  q1 +
  '\n' +
  q2n +
  '\n' +
  q3n +
  '\n' +
  q4n +
  '\n' +
  footerPart +
  endPart +
  styles +
  '\n        </div>\n    </div>\n</div>\n'
)
  .replace(
    '<div id="uniquera-thankyou-screen" class="uniquera-thankyou-screen">',
    '<div id="uniquera-thankyou-screen-short" class="uniquera-thankyou-screen" hidden aria-hidden="true">',
  )
  .replace(
    /<\/div><!--question-4_end-->\s*<div class="form-button-wrapper">/,
    '</div><!--question-4_end-->\n\n\n\n                            <div class="form-button-wrapper">',
  );

fs.mkdirSync('uniquera-consultation-form-short/templates', { recursive: true });
fs.writeFileSync('uniquera-consultation-form-short/templates/form-fragment.html', out);
console.log('Written', out.length, 'chars');
