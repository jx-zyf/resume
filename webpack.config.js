var webpack=require('webpack');
// var HtmlWebpackPlugin=require('html-webpack-plugin');
module.exports = {
    entry: './src/main.js',
    output: {
        filename: 'bundle.js',
        path: __dirname + '/dist'
    },
    module: {
        loaders: [
            {
                test: /\.css$/,
                loader: 'style-loader!css-loader'
            },
            {
                test: /\.(gif|jpe?g|png|svg)$/,
                loader: 'url-loader',
                options: {
                    limit: 128,
                    name: '[name].[ext]',
                    outputPath: '/images/',
                    publicPath: './dist'
                }
            },
            // {
            //     test:/\.html$/,
            //     loader:'html-loader',
            //     options:{
            //         attrs: [':data-src'],
            //         attrs=img:src
            //     }
            // }
        ]
    },
    // devServer:{
    //     inline:true
    // },
    // plugins:[
        // new webpack.optimize.UglifyJsPlugin({
        //     compress:{warnings:false}
        // })
        // new HtmlWebpackPlugin({title:'resume'}),
        // new webpack.HotModuleReplacementPlugin()
    // ]
}