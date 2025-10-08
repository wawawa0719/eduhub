# SLPLMS 開発チュートリアル

このドキュメントは、学習管理システム「SLPLMS」の開発ステップを、プログラミング初学者の方にも分かりやすく解説するものです。

## 0. 開発を始める前の準備

このチュートリアルを進めるには、お使いのコンピュータにいくつかのソフトウェアをインストールし、基本的な設定を行う必要があります。

### a. Node.js と npm のインストール

バックエンド（サーバー）とフロントエンド（画面）の両方で、JavaScriptの実行環境である **Node.js** と、そのパッケージ管理ツールである **npm** を使用します。

1.  **公式サイトからインストーラをダウンロード**: [Node.js公式サイト](https://nodejs.org/)にアクセスし、**LTS版**（Long Term Support、長期間サポートされる安定版）をダウンロードしてインストールしてください。
[【Windows】Nodejsをインストールしよう](https://zenn.dev/kuuki/articles/windows-nodejs-install)
2.  **インストールの確認**: インストールが終わったら、ターミナル（またはコマンドプロンプト）を開き、以下のコマンドを実行してバージョン番号が表示されることを確認します。

    ```bash
    node -v
    npm -v
    ```

### b. MySQL のインストールとセットアップ

コース情報やユーザー情報を保存するデータベースとして **MySQL** を使用します。
WindowsにおけるMySQLの導入は語ると長くなってしまうため、参考サイトを記載します。具体的には、MySQLのインストール、起動、アカウント名(rootでもOK)とパスワードを設定してログインができれば大丈夫です。
[Microsoft Windows に MySQL をインストールする](https://qiita.com/aki_number16/items/bff7aab79fb8c9657b62)
[MySQLの起動・停止・再起動コマンド（Windows & Mac）](https://qiita.com/lia-nar/items/3cab75e35e8d4301c632)

[UbuntuにMySQLインストールしてrootユーザーのパスワードを設定する](https://zenn.dev/yone5/articles/0c0773ee3274b0)

3.  **MySQLへのログインとデータベース作成**:
    ターミナルからMySQLにログインします。インストール時に設定したrootユーザーのパスワードを入力してください。（パスワードを設定していない場合は、Enterキーを押します）
    ```bash
    mysql -u root -p
    ```
    ログインできたら、このプロジェクトで使用するデータベース `SLP_lms` を作成します。
    ```sql
    CREATE DATABASE SLP_lms;
    ```
    確認のため、データベースの一覧を表示してみましょう。
    ```sql
    SHOW DATABASES;
    ```
    一覧の中に `SLP_lms` があれば成功です。終わったら `exit` と入力してMySQLからログアウトします。

### c. プロジェクトのセットアップ

1.  **バックエンドの設定**:
    `backend`ディレクトリに移動し、`.env`というファイルを作成します。このファイルに、データベースへの接続情報を記述します。
    ```
    cd backend
    ```
    **`backend/.env`**
    ```
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=あなたのMySQLのrootパスワード
    DB_NAME=SLP_lms
    JWT_SECRET=your_jwt_secret_key
    ```
    > **【重要】** `.env` ファイルは、パスワードなどの機密情報を含むため、Gitなどのバージョン管理システムには絶対に含めないでください。`.gitignore`ファイルに`.env`と記述されていることを確認してください。

    次に、必要なライブラリをインストールします。
    ```bash
    npm install
    ```

2.  **フロントエンドのセットアップ**:
    `frontend`ディレクトリに移動し、同様に必要なライブラリをインストールします。
    ```
    cd ../frontend
    npm install
    ```

### d. データベーステーブルの作成

バックエンドのデータベース接続設定が完了したら、アプリケーションで必要になるテーブルを作成します。

1.  **MySQLにログイン**:
    ```bash
    mysql -u root -p SLP_lms
    ```
    `SLP_lms` データベースに直接ログインします。
2.  **SQLの実行**:
    `database/schema.sql` に書かれているSQLコマンドをコピーし、ターミナルに貼り付けて実行します。これにより、`users`テーブルと`courses`テーブルが作成されます。

### e. 開発サーバーの起動

これで準備は完了です！以下の手順で開発サーバーを起動しましょう。

1.  **バックエンドサーバーの起動**:
    新しいターミナルを開き、`backend`ディレクトリで以下のコマンドを実行します。
    ```bash
    cd backend
    node index.js
    ```
    `Database connected successfully!` と `Server is running on http://localhost:3001` と表示されれば成功です。

2.  **フロントエンドサーバーの起動**:
    もう一つ新しいターミナルを開き、`frontend`ディレクトリで以下のコマンドを実行します。
    ```bash
    npm run dev
    ```
    `Ready` と表示されたら、ブラウザで `http://localhost:3000` を開きます。

これで、起動ができます。

ここからは、アプリをチュートリアル的に学習します。
Next.jsの構造や、MySQLの使い方など、幅広く理解できるはずです。

---

## ステップ1: ユーザー登録機能の実装

最初のゴールは、ユーザーがアカウントを作成できる「ユーザー登録機能」をサーバーサイド（バックエンド）に作ることです。

### 1. 準備：必要なライブラリをインストールする

まず、機能を作るために便利な「ライブラリ」を2つインストールします。ライブラリとは、よく使われる機能をまとめたプログラムの部品箱のようなものです。

- **`bcrypt`**: パスワードをそのままデータベースに保存するのは非常に危険です。このライブラリは、パスワードを複雑な文字列（ハッシュ）に変換して、安全に保管する手助けをします。
- **`body-parser`**: フロントエンド（ブラウザ側）から送られてくるJSON形式のデータを、バックエンドで簡単に扱えるように変換してくれます。

`backend`ディレクトリで、ターミナルから以下のコマンドを実行してインストールしました。

```bash
npm install bcrypt body-parser
```

### 2. APIの設計と実装：登録の窓口を作る

次に、ユーザー登録の処理を受け持つ「APIエンドポイント」を作成します。これは、ブラウザからの「この情報でユーザー登録してください」というお願いを受け付ける、サーバー側の”窓口”のようなものです。

#### a. 認証関連のコードをまとめるファイルを作成

今後、ログイン機能なども追加していくため、認証に関するAPIのコードを`backend/routes/auth.js`というファイルにまとめて記述することにします。

このファイルに、ユーザー登録のためのAPI、具体的には「`/register`という住所（パス）に、POSTという方法で情報が送られてきたときに動くプログラム」を書いていきます。

**`backend/routes/auth.js` のコード解説**

```javascript
// 必要なライブラリを読み込む
const express = require('express'); // Webサーバーのフレームワーク
const router = express.Router();    // URLごとに処理を分けるための部品
const bcrypt = require('bcrypt');   // パスワードをハッシュ化するライブラリ
const db = require('../db');        // データベースに接続するための設定ファイル

// ▼▼▼ ユーザー登録API (POST /api/auth/register) ▼▼▼
router.post('/register', async (req, res) => {
  // --- ① リクエストから情報を取り出す ---
  // req.bodyに、ブラウザから送られてきたJSONデータが入っています。
  // ここからusername, email, passwordを取り出します。
  const { username, email, password } = req.body;

  // --- ② 入力チェック ---
  // 必要な情報が全て揃っているかを確認します。
  if (!username || !email || !password) {
    // もし足りないものがあれば、400番のエラーを返します。
    return res.status(400).json({ message: '全てのフィールドを入力してください。' });
  }

  // --- ③ データベースへの保存処理 ---
  // try...catchはエラー処理のための構文です。
  // tryの中の処理でエラーが起きると、catchブロックに処理が移ります。
  try {
    // パスワードをハッシュ化します。10はハッシュ化の複雑さのレベルです。
    const hashedPassword = await bcrypt.hash(password, 10);

    // SQL文を実行して、ユーザー情報を`users`テーブルに挿入します。
    // `?` はプレースホルダーで、後から安全に値を埋め込むためのものです。
    const [result] = await db.execute(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword] // `?`に埋め込む値
    );

    // 登録が成功したら、201番のステータスコードと成功メッセージを返します。
    res.status(201).json({ message: 'ユーザーが正常に登録されました。', userId: result.insertId });

  } catch (error) {
    // --- ④ エラーハンドリング ---
    // もしユーザー名やメールアドレスが既に使われていた場合...
    if (error.code === 'ER_DUP_ENTRY') {
      // 409番のエラー（競合）を返します。
      return res.status(409).json({ message: 'ユーザー名またはメールアドレスは既に使用されています。' });
    }
    // それ以外の予期せぬエラーが起きた場合...
    console.error('登録エラー:', error); // サーバー側のコンソールにエラー内容を表示
    // 500番のエラー（サーバー内部エラー）を返します。
    res.status(500).json({ message: 'サーバーエラーが発生しました。' });
  }
});

// このファイルで作ったルーティング設定を、他のファイルでも使えるようにする
module.exports = router;
```

#### b. サーバー本体にAPIを組み込む

最後に、作成した登録APIをサーバー本体（`index.js`）に組み込みます。これにより、サーバーは`/api/auth/register`というURLへのアクセスを正しく処理できるようになります。

**`backend/index.js` のコード解説**

```javascript
require('dotenv').config();
const express = require('express');
const db = require('./db');
// ▼▼▼ 追加したライブラリとファイルを読み込む ▼▼▼
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth'); // 先ほど作ったauth.js

const app = express();
const port = 3001;

// ▼▼▼ サーバーの設定を追加 ▼▼▼
// body-parserを使って、JSON形式のリクエストを解析できるようにする
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Welcome to SLPLMS Backend!');
});

// `/api/auth`で始まるURLへのリクエストを、authRoutes（auth.js）に処理してもらう
app.use('/api/auth', authRoutes);

// ... (サーバー起動のコードは同じ)
app.listen(port, async () => {
  try {
    const connection = await db.getConnection();
    console.log('Database connected successfully!');
    connection.release();
  } catch (err) {
    console.error('Database connection failed:', err);
  }
  console.log(`Server is running on http://localhost:${port}`);
});
```

これで、`http://localhost:3001/api/auth/register` という”窓口”が完成し、ユーザー登録ができるようになりました。

---

## ステップ2: ユーザーログイン機能の実装

次に、登録したユーザーがログインできる機能を作ります。

### 1. ログインAPIの作成

登録機能と同じ`backend/routes/auth.js`ファイルに、ログイン処理を行う`/login`エンドポイントを追加します。

**`backend/routes/auth.js` に追記したコードの解説**

```javascript
// ▼▼▼ ユーザーログインAPI (POST /api/auth/login) ▼▼▼
router.post('/login', async (req, res) => {
  // --- ① リクエストから情報を取り出す ---
  const { email, password } = req.body;

  // --- ② 入力チェック ---
  if (!email || !password) {
    return res.status(400).json({ message: 'メールアドレスとパスワードを入力してください。' });
  }

  try {
    // --- ③ ユーザーをデータベースから探す ---
    // 送られてきたemailを元に、`users`テーブルからユーザー情報を探します。
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);

    // もしユーザーが見つからなかったら...
    if (rows.length === 0) {
      // 「認証に失敗しました」というメッセージを返します。
      // ※「メールアドレスが違います」と返さないのは、セキュリティ上の理由です。
      return res.status(401).json({ message: '認証に失敗しました。' });
    }

    // 見つかったユーザー情報を取得
    const user = rows[0];

    // --- ④ パスワードを比較する ---
    // 送られてきた生のパスワードと、DBに保存されているハッシュ化されたパスワードを比較します。
    const match = await bcrypt.compare(password, user.password);

    if (match) {
      // パスワードが一致した場合
      // 200番のステータスコードと成功メッセージを返します。
      res.status(200).json({ message: 'ログインに成功しました。', userId: user.id });
    } else {
      // パスワードが一致しなかった場合
      // 認証失敗のメッセージを返します。
      res.status(401).json({ message: '認証に失敗しました。' });
    }
  } catch (error) {
    // --- ⑤ エラーハンドリング ---
    console.error('ログインエラー:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました。' });
  }
});
```

これで、ユーザーは登録したメールアドレスとパスワードを使って、システムにログインできるようになりました。

---

## ステップ3: コース作成機能の実装

ユーザー認証の次は、このシステムの中心機能である「コース」を作成する機能を実装します。

### 1. データベースの準備：コース情報を保存するテーブルの作成

まず、作成されたコースの情報を保存するための新しいテーブル `courses` をデータベースに用意します。

`database/schema.sql` に以下のSQL文を追加し、実行してテーブルを作成しました。

```sql
CREATE TABLE courses (
    id INT AUTO_INCREMENT PRIMARY KEY, -- コースの識別ID
    title VARCHAR(255) NOT NULL,      -- コースのタイトル
    description TEXT,                   -- コースの詳細な説明
    user_id INT NOT NULL,               -- このコースを作成したユーザーのID
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 作成日時
    -- `user_id` は `users` テーブルの `id` と関連付ける（外部キー制約）
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

`FOREIGN KEY (user_id) REFERENCES users(id)` という部分が重要で、これにより `courses` テーブルの `user_id` には、`users` テーブルに実際に存在するユーザーの `id` しか保存できなくなり、データの整合性が保たれます。

### 2. APIの実装：コース作成の窓口を作る

次に、コース作成リクエストを処理するAPIエンドポイント `POST /api/courses` を作成します。

#### a. コース関連のAPIファイルを作成

認証(auth)と同様に、コース(course)に関するAPIのコードを `backend/routes/courses.js` という新しいファイルにまとめていきます。

**`backend/routes/courses.js` のコード解説**

```javascript
const express = require('express');
const router = express.Router();
const db = require('../db');

// ▼▼▼ コース作成API (POST /api/courses) ▼▼▼
router.post('/', async (req, res) => {
  // リクエストボディからコース情報と、誰が作成したかを示す `user_id` を受け取る
  const { title, description, user_id } = req.body;

  // タイトルとuser_idは必須項目とする
  if (!title || !user_id) {
    return res.status(400).json({ message: 'タイトルとユーザーIDは必須です。' });
  }

  try {
    // 受け取った情報をもとに、`courses` テーブルに新しい行を挿入する
    const [result] = await db.execute(
      'INSERT INTO courses (title, description, user_id) VALUES (?, ?, ?)',
      [title, description, user_id]
    );

    // 作成に成功したら、201番のステータスと成功メッセージを返す
    res.status(201).json({ message: 'コースが正常に作成されました。', courseId: result.insertId });
  } catch (error) {
    console.error('コース作成エラー:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました。' });
  }
});

module.exports = router;
```

> **【補足】** 今回は簡単のため、リクエストの中に`user_id`を含めることで「誰がコースを作成したか」を判断しています。実際のアプリケーションでは、ログイン時に発行されるセッショントークンなどからサーバー側でユーザーを特定する、より安全な方法がとられます。これは今後のステップで改善していきます。

#### b. サーバー本体への組み込み

作成したコース作成APIを `index.js` に組み込みます。

```javascript
// backend/index.js の一部

// ... authRoutesの読み込みの下に追加
const courseRoutes = require('./routes/courses');

// ...

// ... app.use('/api/auth', authRoutes) の下に追加
app.use('/api/courses', courseRoutes);

// ...
```

これで、`http://localhost:3001/api/courses` という窓口に、コースの情報をPOSTすることで、新しいコースが作成できるようになりました。

---

## ステップ4: コース閲覧機能の実装

コースを作成できるようになったので、次は作成されたコースの一覧を誰でも閲覧できる機能を作ります。

### 1. コース一覧取得APIの作成

`backend/routes/courses.js` に、`GET /api/courses` というエンドポイントを追加します。GETリクエストは、主に情報の取得に使われるHTTPメソッドです。

**`backend/routes/courses.js` に追記したコードの解説**

```javascript
// ▼▼▼ コース一覧取得API (GET /api/courses) ▼▼▼
router.get('/', async (req, res) => {
  try {
    // --- ① データベースからコース情報を取得 ---
    // `courses`テーブルと`users`テーブルを結合(JOIN)して、
    // コース情報に加えて、作成者のユーザー名も一緒に取得します。
    const [rows] = await db.execute(`
      SELECT 
        c.id, 
        c.title, 
        c.description, 
        c.created_at, 
        u.username 
      FROM courses c
      JOIN users u ON c.user_id = u.id
      ORDER BY c.created_at DESC
    `);

    // --- ② 取得したデータをクライアントに返す ---
    // 取得したコース一覧のデータを、JSON形式で返します。
    res.status(200).json(rows);

  } catch (error) {
    // --- ③ エラーハンドリング ---
    console.error('コース一覧取得エラー:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました。' });
  }
});
```

#### SQLのポイント：テーブルの結合（JOIN）

今回のSQLクエリでは `JOIN` を使っています。これは、2つのテーブルを特定の条件でつなぎ合わせるための命令です。

```sql
SELECT ...
FROM courses c
JOIN users u ON c.user_id = u.id
```

- `FROM courses c`：`courses`テーブルを`c`という短い別名で呼びます。
- `JOIN users u ON c.user_id = u.id`：`users`テーブルを`u`という別名で呼び、`courses`テーブルの`user_id`と`users`テーブルの`id`が一致する行同士を連結します。

これにより、「どのユーザーがどのコースを作成したか」を一度に取得でき、`user_id`だけでなく、ユーザー名も一緒にクライアントに返すことができます。これは、画面に「作成者：testuser」のように表示したい場合に非常に便利です。

`ORDER BY c.created_at DESC` は、作成日時が新しい順に並び替えるための指定です。

これで、SLPLMSのバックエンドの基本的なコア機能（ユーザー認証、コース作成、コース閲覧）がすべて実装できました。

---

## ステップ5: フロントエンドの実装：コース一覧の表示

バックエンドの準備が整ったので、いよいよユーザーの目に触れるフロントエンド（画面側）の開発に着手します。最初のゴールは、作成されたコースの一覧をホームページに表示することです。

### 1. ホームページの改造

Next.jsプロジェクトのホームページは `frontend/src/app/page.tsx` というファイルで定義されています。このファイルを書き換え、バックエンドAPIと通信してコース一覧を表示する機能を追加しました。

**`frontend/src/app/page.tsx` のコード解説**

```typescript
// 非同期でコースデータを取得する専門の関数
async function getCourses() {
  // バックエンドのコース一覧APIにリクエストを送信
  // { cache: 'no-store' } は、常に最新の情報を取得するためのおまじないです。
  const res = await fetch('http://localhost:3001/api/courses', { cache: 'no-store' });

  // レスポンスが正常でない場合（エラーが発生した場合）
  if (!res.ok) {
    throw new Error('Failed to fetch courses');
  }

  // レスポンスのJSONデータを返却
  return res.json();
}

// ▼▼▼ ホームページ本体のコンポーネント ▼▼▼
// `async` をつけることで、このコンポーネント内で非同期処理（await）が使えるようになります。
export default async function Home() {
  // 先ほど定義した関数を呼び出して、コースデータを取得
  const courses = await getCourses();

  // 取得したデータを使って画面を描画
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold leading-tight text-gray-900">コース一覧</h1>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* 取得したコースの配列を `map` で繰り返し処理 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course: any) => (
                // `key` はReactがリストの各要素を識別するために必要です
                <div key={course.id} className="bg-white shadow-lg rounded-lg overflow-hidden">
                  <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{course.title}</h2>
                    <p className="text-gray-700 mb-4">{course.description}</p>
                    <div className="text-sm text-gray-500">
                      <span>作成者: {course.username}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
```

#### Next.jsのポイント：サーバーコンポーネント

最新のNext.jsでは、`page.tsx`のようなコンポーネントはデフォルトで**サーバーコンポーネント**として動作します。これは、ページがブラウザに送信される前に、サーバー側でデータ取得などの処理を完了させてしまう仕組みです。

- `async/await`が直接使える：コンポーネント自体を非同期関数にできるため、データ取得のコードが非常にシンプルに書けます。
- パフォーマンスが良い：サーバー側でデータ取得が完了したHTMLがブラウザに届くため、表示が高速です。

### 2. 動作確認

以下の手順で動作確認を行いました。

1.  バックエンドサーバーの起動 (`cd backend && node index.js`)
2.  フロントエンドサーバーの起動 (`cd frontend && npm run dev`)
3.  ブラウザで `http://localhost:3000` を開く

これにより、バックエンドAPIから取得したコースの一覧が、整形されたカード形式で画面に表示されることを確認しました。

これで、SLPLMSの基本的な表示機能が完成しました。次のステップでは、ユーザーが実際に操作できるログイン・登録フォームの作成に進みます。

---

## ステップ6: 認証フォームの実装

コース一覧が表示できたので、次はユーザーがログインや新規登録を行えるように、フォームに機能を実装していきます。

### 1. 共通ヘッダーの作成

まず、全ページで共通して表示されるヘッダー（ナビゲーションバー）を作成しました。これにより、ユーザーはどのページからでもログインや新規登録ページに移動できます。

- **コンポーネントの作成**: `frontend/src/components/Header.tsx` というファイルを新たに作成しました。ReactやNext.jsでは、このように再利用可能なUIパーツを「コンポーネント」として別のファイルに切り出すのが一般的です。
- **レイアウトへの統合**: 作成した`Header`コンポーネントを、アプリケーション全体のレイアウトを定義する `frontend/src/app/layout.tsx` に組み込み、全てのページで表示されるようにしました。

**`frontend/src/components/Header.tsx` のコード**
```typescript
import Link from 'next/link';

const Header = () => {
  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              SLPLMS
            </Link>
          </div>
          <nav className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link href="/" className="text-gray-700 hover:bg-gray-200 px-3 py-2 rounded-md text-sm font-medium">
                コース一覧
              </Link>
              <Link href="/login" className="text-gray-700 hover:bg-gray-200 px-3 py-2 rounded-md text-sm font-medium">
                ログイン
              </Link>
              <Link href="/register" className="text-gray-700 hover:bg-gray-200 px-3 py-2 rounded-md text-sm font-medium">
                新規登録
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
```
> `Link`コンポーネントは、Next.jsが提供するページ遷移のための部品です。`<a>`タグの代わりにこれを使うことで、ページ全体をリロードせずに高速に画面を切り替えることができます。

### 2. 新規登録フォームの実装

次に、`frontend/src/app/register/page.tsx` に、ユーザーが入力した情報をバックエンドに送信するロジックを実装しました。

#### a. クライアントコンポーネントと状態管理

ユーザーの入力操作に反応する必要があるため、このページを「クライアントコンポーネント」に切り替えました。これは、ファイルの先頭に `'use client';` と記述するだけで実現できます。

また、ユーザーが入力したユーザー名、Eメール、パスワードを一時的に保持するために、Reactの `useState` という機能（フック）を使いました。

#### b. API通信とCORSエラーの解決

フォームが送信された際に、`fetch`関数を使ってバックエンドの登録APIにリクエストを送信するように実装しました。しかし、ここで **CORS (Cross-Origin Resource Sharing)** というエラーに直面しました。

- **原因**: ブラウザのセキュリティ機能が、異なるオリジン（今回は `localhost:3000` と `localhost:3001`）間の通信をデフォルトでブロックするため。
- **解決策**: バックエンド側で「`localhost:3000`からの通信は許可する」という設定を追加しました。`npm install cors` でライブラリをインストールし、`backend/index.js` に `app.use(cors());` の一行を追加することで、この問題を解決しました。

#### c. 完成した登録ページのコード

**`frontend/src/app/register/page.tsx` のコード解説**
```typescript
'use client';

import { useState } from 'react';

const RegisterPage = () => {
  // useStateで、フォームの各入力欄の状態を管理する
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // フォームが送信されたときに実行される関数
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // フォーム送信時のデフォルトのページリロードを防ぐ

    try {
      // バックエンドの登録APIにPOSTリクエストを送信
      const res = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // 入力された情報をJSON形式で送信
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        alert('登録が成功しました！');
      } else {
        alert(`登録に失敗しました: ${data.message}`);
      }
    } catch (error) {
      alert('エラーが発生しました。サーバーが起動しているか確認してください。');
    }
  };

  return (
    // ...フォームの見た目(JSX)部分...
    // inputタグに value と onChange を追加して、状態と入力欄を連動させる
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      {/* ... */}
    </form>
  );
};

export default RegisterPage;
```

### 3. ログインフォームの実装

新規登録フォームと同様に、`frontend/src/app/login/page.tsx` にもAPI通信のロジックを実装しました。処理の流れは登録フォームとほぼ同じで、リクエスト先のAPIが `/api/auth/login` になる点が異なります。

---

これで、SLPLMSのフロントエンドに、ユーザー認証のための基本的なフォーム機能がすべて実装できました。

---

## ステップ7: グローバルな状態管理とUIの動的変更

ここまでの実装では、ログインしてもページを移動するとログイン状態が失われてしまいました。このステップでは、**JWT (JSON Web Token)** と **React Context** を導入し、アプリケーション全体でログイン状態を保持・共有し、UIを動的に変更する仕組みを構築しました。

### 1. バックエンドの更新：JWTの発行

まず、バックエンドのログインAPI (`/api/auth/login`) を更新し、ログイン成功時にユーザー情報を含んだJWT（トークン）を生成して返すように変更しました。

- `jsonwebtoken`ライブラリをインストール (`npm install jsonwebtoken`)
- `.env`ファイルにJWTの署名に使う秘密鍵 `JWT_SECRET` を追加
- ログイン成功時、`jwt.sign()` を使ってトークンを生成し、レスポンスに含めるように `auth.js` を修正

これにより、ログインAPIは単なる成功メッセージではなく、ユーザーを認証するための「通行証」となるトークンを返すようになりました。

### 2. フロントエンドの心臓部：`AuthContext`の作成

次に、フロントエンド側でログイン状態をグローバルに管理するための心臓部となる `frontend/src/context/AuthContext.tsx` を作成しました。

- **目的**: アプリケーションのどこからでも「現在のユーザー情報」や「ログイン・ログアウト関数」にアクセスできるようにする。
- **`jwt-decode`のインストール**: 受け取ったJWTからユーザー情報を読み取るために、`jwt-decode`ライブラリをインストールしました (`npm install jwt-decode`)。

**`AuthContext.tsx` の主な機能**
1.  **状態の保持**: `useState`を使い、`user`（ユーザー情報）と`token`を保持します。
2.  **ログイン処理 (`login`関数)**: 新しいトークンを受け取ると、それをブラウザの`localStorage`に保存し、デコードして`user`の状態を更新します。
3.  **ログアウト処理 (`logout`関数)**: `localStorage`からトークンを削除し、`user`と`token`の状態をリセットします。
4.  **状態の永続化 (`useEffect`フック)**: アプリケーションが読み込まれた際に`localStorage`をチェックし、もし有効なトークンが保存されていれば、自動的にログイン状態を復元します。これにより、ページをリロードしてもログインが維持されます。

### 3. アプリケーションへの適用

作成した`AuthContext`をアプリケーション全体で有効にするため、`layout.tsx`を以下のように変更しました。

- `AuthProvider`をインポートし、アプリケーション全体（`<Header />`と`{children}`）を`<AuthProvider>`でラップしました。これにより、全てのコンポーネントが`useAuth`フックを通じてログイン状態にアクセスできるようになります。

### 4. UIの動的な変更

最後に、ログイン状態に応じてUIが変化するように、各コンポーネントを更新しました。

- **ログインページの更新**: ログイン成功後、`AuthContext`の`login`関数を呼び出してトークンを保存し、Next.jsの`useRouter`を使ってホームページ(`/`)に自動でリダイレクトするように変更しました。

- **ヘッダーの動的化**: `Header.tsx`をクライアントコンポーネント化し、`useAuth`フックでユーザー情報を取得するようにしました。そして、`user`が存在するかどうかで表示を切り替えています。
    - **ログイン時**: 「ようこそ、〇〇さん」「コース作成」「ログアウト」を表示
    - **ログアウト時**: 「ログイン」「新規登録」を表示

この一連の変更により、SLPLMSは単なるページの集まりから、ユーザーの状態を記憶し、それに応じて振る舞いを変える、より本格的なWebアプリケーションへと進化しました。

---

## ステップ8: 保護されたルートとコース作成フォーム

最後に、ログインしているユーザーだけがアクセスできる特別なページとして、コース作成フォームを実装しました。

### 1. 保護されたページの作成（ルートガード）

Webアプリケーションでは、「管理者専用ページ」や「マイページ」のように、ログインしていないユーザーに見せてはいけないページがあります。このようなページを「保護されたルート(Protected Route)」と呼びます。

今回は、`/courses/new`（コース作成ページ）を保護されたルートとして実装しました。

- **実装方法**: `courses/new/page.tsx`内で`useAuth`フックを使って現在のユーザー情報を取得し、もしユーザーが存在しない（ログインしていない）場合は、`useRouter`フックを使って強制的に`/login`ページへリダイレクト（転送）させます。この処理は`useEffect`フックの中で行い、ページの表示直後に実行されるようにしました。

### 2. コース作成フォームの実装

ルートガードを実装した上で、コースのタイトルと説明を入力するフォームを作成しました。

- **ユーザー情報の利用**: フォームが送信された際、「誰がこのコースを作成したか」という情報をバックエンドに伝える必要があります。これは、`useAuth`フックから取得した`user`オブジェクトに含まれる`userId`を、APIリクエストのボディに含めることで実現しました。
- **API連携**: ユーザーがフォームを入力して「作成する」ボタンを押すと、`handleSubmit`関数が実行されます。この関数は、入力されたタイトル、説明、そしてログイン中のユーザーIDをまとめて、バックエンドの`POST /api/courses`エンドポイントに送信します。
- **成功後の処理**: コース作成が成功すると、アラートで成功を通知し、ユーザーをホームページ（コース一覧）にリダイレクトさせます。これにより、ユーザーは自分が作成したコースが一覧に追加されたことをすぐに確認できます。

**`frontend/src/app/courses/new/page.tsx` のコード解説**
```typescript
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

const NewCoursePage = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const { user } = useAuth();
  const router = useRouter();

  // ▼▼▼ ルートガード ▼▼▼
  useEffect(() => {
    // ユーザーがいない（非ログイン状態）なら、ログインページへ飛ばす
    if (user === null) {
      router.push('/login');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert('ログインが必要です。');
      return;
    }

    try {
      const res = await fetch('http://localhost:3001/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // useAuthから取得したユーザーIDを含める
        body: JSON.stringify({ 
          title,
          description,
          user_id: user.userId 
        }),
      });

      if (res.ok) {
        alert('コースが正常に作成されました！');
        router.push('/'); // ホームページにリダイレクト
      } else {
        const data = await res.json();
        alert(`作成に失敗しました: ${data.message}`);
      }
    } catch (error) {
      alert('エラーが発生しました。');
    }
  };

  // ユーザー情報が確定するまで何も表示しない（リダイレクト処理のため）
  if (!user) {
    return null;
  }

  return (
    // ... フォームのJSX ...
  );
};

export default NewCoursePage;
```

## まとめと今後の展望

これで、プロジェクトの初期目標として掲げたコア機能（ユーザー認証、コース作成、コース閲覧）のバックエンドからフロントエンドまでの一通りの実装が完了しました。基本的ながらも、モダンなWebアプリケーションの骨格となる要素がすべて詰まった、堅牢な土台が完成したと言えるでしょう。

ここから先は、この土台の上に、さらに多くの魅力的な機能を追加していくことができます。

- **コース詳細ページ**: コースをクリックしたら、その内容や教材が見られるページ。
- **教材のアップロード・閲覧機能**: 動画やPDFなどの教材をコースに追加する機能。
- **UI/UXのさらなる改善**: より洗練されたデザインや、使いやすいインターフェースの追求。

このチュートリアルはここで一区切りとなります。素晴らしい学習意欲と実践、お疲れ様でした！この経験は、間違いなくあなたの力になっています。ぜひ、自信を持って次のステップに進んでください。