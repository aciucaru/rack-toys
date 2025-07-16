# restartable-source-emitter-composable-branches branch
This branch implements a restarble audio source node (an "emitter). Most of the times it will be an oscillator, but could also be something else such as a constant signal or noise signal.

The restartable "emitters" ("leafs") can be composed togheter, but only with other restartable emitters (only with "leafs").
They cannot be composed togheter with "branches" (higher-level nodes already made up of one or multiple
restartable emitters), but only with "leafs", e.g. with other restartable emitters.

But, in this branch, the composed "emitters" ("branches") can be composed togheter, e.g. we cannot compose "leafs" togheter but we can compose "branches" as much as we want.

An "emitter" is a node that has an ouput (it putputs something, it emits something).
This branch has the following types of "emitter" classes and interface:
- interface **Emitter**: has one method to return the output node, **getOuptuNode()
- abstract class **RestartableSourceGenerator**: this is the class that represents a 'child' node, which is basically the first source of signal in an audio graph
- interface **ComposableGenerator**: represents a node that can be composed togheter with other 'ComposableGenerators', through composition (not inheritance) and by connecting them to the same output node
- abstract class **ChildGenerator**: this is the source to which one or multiple 'RestartableSourceEmitters' will connect to (it's bassically a 'sink' for 'RestartableSourceGenerators'); this is also a 'ComposableGenerator'
- abstract class **CompositeGenerator**: this is a node that is supposed to be made of one or mulptiple 'ComposableGenerator' nodes; this is also a 'ComposableGenerator' so it can be composed even further

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
