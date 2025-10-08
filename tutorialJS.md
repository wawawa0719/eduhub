# JavaScript/React/Next.js 基本構文チュートリアル

このドキュメントは、Web開発で頻繁に使用されるJavaScript、React、Next.jsの基本的な構文や概念を、プログラミング初学者向けに解説するものです。

---

## 1. JavaScriptの基本

### `import` / `export` (ES Modules)

モダンなJavaScript開発では、コードを機能ごとにファイル分割（モジュール化）するのが一般的です。

- **`export`**: 他のファイルから利用できるように、関数、クラス、変数を公開します。
  ```javascript
  // my-module.js
  export const myVariable = 10;
  export function myFunction() {
    console.log('Hello!');
  }
  // デフォルトエクスポート（1ファイルに1つだけ）
  export default function() {
    console.log('Default export');
  }
  ```

- **`import`**: `export`された機能を取り込んで利用します。
  ```javascript
  // main.js
  import myDefaultFunction, { myVariable, myFunction } from './my-module.js';

  console.log(myVariable); // 10
  myFunction(); // Hello!
  myDefaultFunction(); // Default export
  ```

### `async` / `await`

非同期処理（完了までに時間がかかる処理、例: サーバーとの通信）を、あたかも同期処理（上から順に実行される処理）のように直感的に書くための構文です。

- **`async`**: 関数名の前に付けると、その関数が非同期関数であることを示します。この関数は常に`Promise`オブジェクトを返します。
- **`await`**: `async`関数内でのみ使えます。`Promise`が解決される（処理が完了する）まで、後続の処理を一時停止します。

```javascript
async function fetchData() {
  console.log('データを取得し始めます...');
  // fetchはサーバーからデータを取得する非同期関数
  const response = await fetch('https://api.example.com/data');
  const data = await response.json(); // レスポンスの変換も非同期
  console.log('データの取得が完了しました:', data);
  return data;
}
```

### `fetch()`

ブラウザに組み込まれている、サーバーとHTTP通信を行うためのAPIです。`Promise`を返すため、`async/await`と一緒に使われることが多いです。

```javascript
async function postData(url = '', data = {}) {
  const response = await fetch(url, {
    method: 'POST', // GET, POST, PUT, DELETEなど
    headers: {
      'Content-Type': 'application/json' // 送信するデータの種類
    },
    body: JSON.stringify(data) // 送信するデータをJSON文字列に変換
  });
  return response.json(); // レスポンスをJSONとして解析
}

postData('https://api.example.com/users', { name: 'John Doe' })
  .then(data => {
    console.log(data);
  });
```

### `try...catch`

エラーが発生する可能性のある処理を囲むための構文です。

- **`try`**: このブロック内のコードが実行されます。
- **`catch`**: `try`ブロック内でエラーが発生した場合、このブロック内のコードが実行されます。エラーオブジェクトを引数として受け取ります。

```javascript
async function safeFetch() {
  try {
    const response = await fetch('https://invalid-url');
    if (!response.ok) {
      throw new Error('ネットワークの応答が正しくありませんでした。');
    }
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error('データの取得中に問題が発生しました:', error);
  }
}
```

### 配列の `.map()` メソッド

配列の各要素に対して指定した関数を実行し、その結果からなる新しい配列を生成します。Reactでリスト（一覧）を表示する際によく使われます。

```javascript
const numbers = [1, 2, 3, 4];
const doubled = numbers.map(number => number * 2);
console.log(doubled); // [2, 4, 6, 8]

// Reactでの使用例
const userNames = ['Alice', 'Bob', 'Charlie'];
const userList = userNames.map(name => <li>{name}</li>);
// userList は [<li>Alice</li>, <li>Bob</li>, <li>Charlie</li>] となる
```

---

## 2. Reactの基本

Reactは、UI（ユーザーインターフェース）を構築するためのJavaScriptライブラリです。UIを「コンポーネント」と呼ばれる再利用可能な部品に分割して開発します。

### JSX (JavaScript XML)

JavaScriptのコード内に、HTMLに似た構文でUIの構造を記述できる拡張構文です。

```jsx
const name = 'World';
// HTMLのように見えるが、これはJavaScript
const element = <h1>Hello, {name}!</h1>;

// classの代わりにclassNameを使うなど、一部HTMLと異なる点がある
const myComponent = (
  <div className="container">
    <p>これはJSXです。</p>
  </div>
);
```

### コンポーネント

UIの一部をカプセル化した、独立した再利用可能な部品です。関数またはクラスで定義します。関数コンポーネントが現在の主流です。

```jsx
// Greetingという名前の関数コンポーネント
function Greeting(props) {
  return <h1>Hello, {props.name}!</h1>;
}

// コンポーネントを使う
function App() {
  return (
    <div>
      <Greeting name="Alice" />
      <Greeting name="Bob" />
    </div>
  );
}
```

### フック (Hooks)

関数コンポーネントに、状態管理や副作用といったReactの機能を「接続する」ための関数です。`use`で始まる名前が特徴です。

#### `useState`

コンポーネントが独自の「状態（state）」を持つことを可能にするフックです。状態が変化すると、コンポーネントは自動的に再描画されます。

```jsx
import { useState } from 'react';

function Counter() {
  // countという状態変数と、それを更新するsetCount関数を宣言
  const [count, setCount] = useState(0); // 初期値は0

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
```

#### `useEffect`

コンポーネントの描画後（または特定の状態が変化した後）に、「副作用」（例: APIリクエスト、DOMの直接操作、タイマーの設定など）を実行するためのフックです。

```jsx
import { useState, useEffect } from 'react';

function UserData({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // この関数はコンポーネントが最初に描画された後に実行される
    fetch(`https://api.example.com/users/${userId}`)
      .then(res => res.json())
      .then(data => setUser(data));

    // 第2引数の配列に指定した値が変化したときだけ、副作用が再実行される
  }, [userId]); // userIdが変化するたびに新しいユーザーデータを取得

  if (!user) {
    return <p>Loading...</p>;
  }

  return <p>Name: {user.name}</p>;
}
```

### イベントハンドリング

`onClick`, `onChange` のように、ユーザーのアクションに応答する関数を定義します。

```jsx
function MyForm() {
  const [value, setValue] = useState('');

  // inputの値が変更されるたびに実行される
  const handleChange = (event) => {
    setValue(event.target.value);
  };

  return (
    <input type="text" value={value} onChange={handleChange} />
  );
}
```

---

## 3. Next.jsの基本

Next.jsは、Reactをベースにしたフレームワークで、サーバーサイドレンダリングや静的サイト生成など、本番環境向けの多くの機能を提供します。

### `'use client'`

Next.js 13以降のApp Routerでは、コンポーネントはデフォルトで**サーバーコンポーネント**として扱われます。サーバーコンポーネントは`useState`や`useEffect`などのフックを使えません。

ファイルの先頭に`'use client';`と記述することで、そのファイルを**クライアントコンポーネント**としてマークできます。クライアントコンポーネントでは、フックやイベントリスナーなど、ブラウザ側で動作するインタラクティブな機能が利用可能になります。

```jsx
'use client'; // このファイルはクライアントコンポーネントであることを示す

import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);
  return (
    // ...
  );
}
```

### `Link` コンポーネント

Next.jsでページ間を移動するためのコンポーネントです。HTMLの`<a>`タグの代わりに使います。

- **高速な遷移**: ページ全体をリロードするのではなく、必要な部分だけを読み込むため、非常に高速な画面遷移を実現します。
- **プリフェッチ**: 画面に表示されているリンク先のページをバックグラウンドで事前に読み込む機能があり、ユーザー体験を向上させます。

```jsx
import Link from 'next/link';

function Navigation() {
  return (
    <nav>
      <Link href="/">Home</Link>
      <Link href="/about">About</Link>
    </nav>
  );
}
```

### `useRouter` フック

プログラム的にページ遷移を行いたい場合（例: フォーム送信後やログイン成功後）に使用するフックです。

```jsx
'use client';

import { useRouter } from 'next/navigation';

function LoginButton() {
  const router = useRouter();

  const handleLogin = () => {
    // ログイン処理...
    // 成功したらダッシュボードページに遷移
    router.push('/dashboard');
  };

  return <button onClick={handleLogin}>Log in</button>;
}
```
