# Jackson 4

ブラウザで遊ぶ4×4ボードゲームです。

## GitHubへアップロードするファイル

次のファイルとフォルダを、同じ構成のままアップロードします。

```text
jackson4/
├─ dist/
│  └─ index.html
├─ server.js
├─ package.json
└─ README.md
```

次のものはアップロード不要です。

```text
outputs/
work/
.DS_Store
.openai/hosting.json
```

## Windows Serverでの準備

### 1. GitHubから取得

リポジトリ画面で`Code`を押し、`Download ZIP`を選びます。Windows Server上でZIPを展開し、プロジェクトフォルダを例えば次の場所に置きます。

```text
C:\Jackson4\
```

`package.json`と`server.js`が、プロジェクトフォルダの直下に見えていることを確認してください。

### 2. Node.jsをインストール

Windows ServerにNode.jsのLTS版をインストールします。インストール後、PowerShellを開いて次を実行します。

```powershell
node -v
npm -v
```

バージョン番号が表示されれば、Node.jsの準備は完了です。

### 3. 依存パッケージをインストール

PowerShellでプロジェクトフォルダへ移動します。

```powershell
cd C:\Jackson4
npm install
```

`npm install`を実行すると、同じフォルダに`package-lock.json`が自動生成されます。

```powershell
C:\Jackson4\package-lock.json
```

### 4. サーバーを起動

```powershell
npm start
```

次のような表示が出れば起動成功です。

```text
Jackson 4 server: http://localhost:8080
WebSocket endpoint: ws://localhost:8080/ws
```

サーバーを停止するまで、PowerShellの画面は閉じないでください。

## 動作確認

サーバー起動後、Windows Server上のブラウザで次を開きます。

```text
http://localhost:8080
```

対戦用WebSocketの接続先は次のとおりです。

```text
ws://localhost:8080/ws
```

## 2人で対戦する場合

同じWindows Serverに接続しているAさん・Bさんが、それぞれのリモートデスクトップ画面で次を開きます。

```text
http://localhost:8080
```

2人のブラウザは同じ`server.js`へ接続します。現在の`server.js`は対戦通信の土台で、画面側の`index.html`との本格的な同期処理は次の実装段階で追加します。

## 注意

GitHub Pagesで実行できるのは、静的な`dist/index.html`だけです。`server.js`はGitHub Pages上では実行されません。

リアルタイム対戦を動かすときは、`server.js`をWindows Server上で起動してください。

