var webpack = require('webpack');
var path = require('path');
let ExtractTextPlugin = require('extract-text-webpack-plugin');
let env = process.env.NODE_ENV === 'production' ? 'production': 'development';

let baseConfig = {
    plugins: [
        // new webpack.ProvidePlugin({
        //     riot: 'riot'
        // })
    ],
    resolve: {
        extensions: ['', '.js'],
        root: __dirname,
        alias: {
            'riot-form-mixin': '../../node_modules/riot-form-mixin/lib/validator',
            'riot-redux': '../../../client/framework/riot-redux',
            'moment': '../../../client/framwork/moment'
        }
    },
    module: {
        preLoaders: [
            {
                test: /\.html$/,
                exclude: /node_modules/,
                loader: 'riotjs-loader',
                query: { type: 'babel' , compact: true}
            }
        ],
        loaders: [
            {
                test: /\.tag$/,
                loader: 'html'
            },
            {
                test: /\.js$/,
                include: /client/,
                loader: 'babel',
                query: {compact: true}
            },
            { test: /\.css$/, loader: 'style-loader!css-loader' },
			{ test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: "file" },
			{ test: /\.(woff|woff2)$/, loader:"url?prefix=font/&limit=5000" },
			{ test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&mimetype=application/octet-stream" },
			{ test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&mimetype=image/svg+xml" }
        ]
    },
    node: {
        net: 'mock',
        dns: 'mock',
        fs: 'empty'
    }
};

let proConfig = {
    module: {
        loaders: [
            { 
                test: /\.scss$/i, 
                loader: ExtractTextPlugin.extract(['css','sass'])
            }
        ]
    },
    entry: [
        'babel-regenerator-runtime',
        'whatwg-fetch', 
        './client/app/main.js',
        './client/app/main.scss'
    ],
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('production'),
                CLIENT_SIDE: true
            }
        }),
        new ExtractTextPlugin("style.css"),
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.optimize.UglifyJsPlugin({
            compress: { warnings: false },
            comments: false,
            sourceMap: false,
            mangle: true,
            minimize: true
        }),
    ],
    output: {
        path: path.resolve(__dirname, './dist/client/app/'),
        filename: 'bundle.js'
    }
}

let devConfig = {
    entry: [
        'babel-regenerator-runtime',
        'webpack-dev-server/client?http://0.0.0.0:8080',
        'whatwg-fetch', 
        './client/app/main.js'
    ],
    module: {
        loaders: [
            { 
                test: /\.scss$/i, 
                loader: 'style!css!sass'
            }
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('development'),
                CLIENT_SIDE: true
            }
        })
    ],
    devtool: 'eval',
    output: {
        path: path.resolve(__dirname, './public/js'),
        filename: 'bundle.js',
        publicPath: 'http://0.0.0.0:8080/client/app/'
    },
    devServer: {
        host: '0.0.0.0',
        port: 8080,
        historyApiFallback: true,
        contentBase: './client',
        hot: false,
        quiet: false,
        noInfo: false,
        stats: { colors: true }
    }
}

module.exports = merge(baseConfig, env === 'production' ? proConfig : devConfig);
/**
 * Helper functions
 */
function merge(t, s){
    for(let p in s){
        if(t.hasOwnProperty(p)){
            if(Array.isArray(t[p])){
                t[p] = [...s[p], ...t[p]];
            }else if(typeof t[p] === 'object'){
                merge(t[p], s[p])
            }
        }else{
            t[p] = s[p];
        }
    }
    return t;
}
