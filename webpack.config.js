const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {
	devServer: {
		port: 4000,
		historyApiFallback: true,
	},
	entry: {
		home: './pages/home/index.js',
		series: './pages/series/index.js',
	},
	output: {
		path: path.join(__dirname, '/build'),
		filename: '[name].min.js',
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: ['babel-loader'],
			},
			{
				test: /\.css$/, // Обработка CSS
				use: ['style-loader', 'css-loader'], // Загружаем стили
			},
		],
	},
	plugins: [
		new CleanWebpackPlugin(),
		new HtmlWebpackPlugin({
			template: './index.html',
		}),
	],
}
