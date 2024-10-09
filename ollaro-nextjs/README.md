In React, props (short for properties) are a way to pass data from one component to another. They are used to send information from a parent component to a child component, allowing the child to render dynamic content based on the data received.

Props are essentially read-only values, meaning they are immutable and cannot be modified by the child component that receives them. They make React components more reusable by allowing dynamic values to be passed in, enabling different rendering behaviors depending on what data is passed.

Key Points:
Props are passed from parent to child components.
They are read-only, meaning the child component cannot change the props directly.
Props make components dynamic by allowing them to receive external data.
Example of Using Props:
Here’s a basic example where a parent component passes props to a child component:

Parent Component (App.js):

```
import React from 'react';
import Greeting from './Greeting';

function App() {
  return (
    <div>
      <Greeting name="Alice" />
      <Greeting name="Bob" />
    </div>
  );
}

export default App;
```

Child Component (Greeting.js):
```
import React from 'react';

function Greeting(props) {
  return <h1>Hello, {props.name}!</h1>;
}

export default Greeting;
```
How It Works:
1. The parent component App renders the Greeting component twice.
2. It passes a name prop to the Greeting component (name="Alice" and name="Bob").
3. Inside the Greeting component, the prop props.name is used to dynamically render the name passed by the parent.
4. As a result, the output will be:

```
Hello, Alice!
Hello, Bob!

```

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
