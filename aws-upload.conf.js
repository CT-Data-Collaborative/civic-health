module.exports = {
    credentials:"aws-credentials.json",
    bucketName:"civichealth.ctdata.org",
    patterns:[
        "static/dist/js/*.js",
        "static/dist/css/*.css",
        "static/dist/data/*.json",
        "static/dist/data/*.zip",
        "static/dist/templates/*.html",
        "static/dist/images/*",
        "static/dist/bower_components/**/*.*",
        "pdfs/*.pdf",
        "index.html"
    ]
}