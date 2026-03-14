module.exports = {
  devServer: {
    port: 8081,
    host: '0.0.0.0',
    historyApiFallback: {
      rewrites: [
        { from: /^\/web\//, to: '/web/index.html' }
      ]
    }
  }
}
