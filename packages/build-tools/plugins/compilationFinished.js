module.exports = {
    apply(compiler) {
        compiler.plugin('done', function() {
            console.log('webpack:compiled');
        });
    }
}