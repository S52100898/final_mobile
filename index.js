const axios = require('axios');
const cheerio = require('cheerio');
const app = require('express')();
const PORT = 3000;
const base_url = 'https://blogtruyen.vn';

/*
Link: /list_chapters?url=link đến thông tin truyện (truyền vào)
Kết quả trả về: danh sách các chapter theo dạng {title: tên chap, url: link chap}
*/
app.get('/list_chapters', function(req, res) {
    const url = req.query.url;
    axios.get(url).then((response) => {
        let list_chapters_info = [];
        const $ = cheerio.load(response.data);
        // Lấy danh sách các chapters
        const list_chapters = $('#list-chapters');
        const chapters = list_chapters.find('p');
        for (let i = 0; i < chapters.length; i++) {
            const a = $(chapters[i]).find('a')[0];
            list_chapters_info.push({title: a.attribs.title, url: base_url + a.attribs.href})
        }
        return res.json({status: true, data: list_chapters_info});
    }).catch((err) => {
        return res.json({status: false, data: err.message});
    });
});

/*
Link: /chapter_images?url=link đến chap truyện (truyền vào)
Kết quả trả về: danh sách các url đến hình ảnh các trang truyện
*/
app.get('/chapter_images', function(req, res) {
    const url = req.query.url;
    axios.get(url).then((response) => {
        let img_urls = [];
        const $ = cheerio.load(response.data);
        // Lấy danh sách các trang của chapter
        const content = $('#content');
        const img_content = content.find('img');
        for (let i = 0; i < img_content.length; i++) {
            const src = img_content[i].attribs.src;
            if (src.indexOf('i8.') !== -1 && src.indexOf('.jpg') !== -1) {
                img_urls.push(src);
            }
        }
        return res.json({status: true, data: img_urls});
    }).catch((err) => {
        return res.json({status: false, data: err.message});
    });
});

app.use((req, res, next) => {
    res.json({status: false, data: 'Error 404'});
});

app.use((err, req, res, next) => {
    res.json({status: false, data: 'Error 500'});
});

app.listen(PORT, () => {
    console.log(`Server is starting at port ${PORT}, press Ctrl + C to terminate`);
});