# excel to json アプリ
macOSで開発している人用にコマンドを書きます。
* nodejs (v12.10.0)
* npm (6.10.3)
* node.js
* npm


## はじめ方

お好きなディレクトリにクローン
```
$ git clone git@github.com:satouyuuki/electron-csv.git
```
ディレクトリに移動
```
$ cd electron-csv
```
パッケージをインストール
```
$ npm install
```
* 開発モードで起動

```
$ npm run start
```

main.js9行目にある下の部分はコメントアウト外してください
```
// require('electron-reload')(__dirname, {
//     electron: require(`${__dirname}/node_modules/electron`)
// });
```

## アーカイブ化
main.js9行目にある下の部分はコメントアウトしてください
```
// require('electron-reload')(__dirname, {
//     electron: require(`${__dirname}/node_modules/electron`)
// });
```
macOS用にビルド
```
$ npm run build-mac
```

windows用にビルド
```
$ brew install wine
```
```
$ npm run build-win
```