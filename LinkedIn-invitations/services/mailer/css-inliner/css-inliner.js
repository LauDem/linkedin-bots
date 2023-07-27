const juice = require('juice');
const path = require("path");
const fs = require('fs');

fs.readFile(path.join(__dirname, '../template/intro-mailing.html'), 'utf8', (err, html) => {
    if (err) {
        throw err;
    }

    fs.readFile(path.join(__dirname, '../template/intro-mailing.css'), 'utf8', (err, css) => {
        if (err) {
            throw err;
        }

        const htmlWithCSS = `<style>${css}</style>` + html;
        const inlined = juice(htmlWithCSS);
        
        fs.writeFile(path.join(__dirname, 'output.html'), inlined, err => {
            if (err) {
                throw err;
            }
            console.log('The file has been saved with inline CSS!');
        });
    });
});
