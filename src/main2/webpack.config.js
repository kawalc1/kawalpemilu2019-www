const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

function staticPage(name) {
    return new HtmlWebpackPlugin({
        filename: name + '/index.html',
        template: 'src/' + name + '.hbs',
        chunks: ['main', 'static'],
    })
}

module.exports = {
    entry: {
        main: './src/main.js',
        tabulasi: './src/tabulasi/tabulasi.ts',
        static: './src/static.js',
    },
    output: {
        filename: '[name].[contenthash].js',
        path: path.resolve(__dirname, 'dist')
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: '[name].[contenthash].css',
            chunkFilename: '[id].[contenthash].css',
        }),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'src/index.hbs',
            chunks: ['main', 'tabulasi'],
        }),
        staticPage('disclaimer'),
        staticPage('kontak'),
        staticPage('faq'),
        staticPage('privasi'),
        staticPage('jenis-peran-pengunjung'),
        staticPage('tentang'),
        staticPage('visualisasi'),
    ],
    module: {
        rules: [
            {
                test: /\.hbs$/,
                use: ["handlebars-loader"]
            },
            {
                test: /\.scss$/,
                use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"]
            },
            {
                test: /\.tsx?$/,
                use: [
                    {
                        loader: 'ts-loader',
                        options: {
                            transpileOnly: true,
                            experimentalWatchApi: true,
                        },
                    }
                ],
                exclude: /node_modules/,
            }
        ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },
    watch: true,
};
