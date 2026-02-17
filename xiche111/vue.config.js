module.exports = {
  devServer: {
    historyApiFallback: {
      rewrites: [
        { from: /^\/web\//, to: '/web/index.html' }
      ]
    }
  }
}
