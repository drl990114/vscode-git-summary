import ts from 'rollup-plugin-typescript2'
import resolve from '@rollup/plugin-node-resolve'

export default {
  input: './src/extension.ts',
  output: [
    {
      file: 'out/extension.js',
      format: 'es',
      sourcemap: true,
    },
  ],
  plugins: [
    ts({ declaration: true, module: 'ES6' }),
    resolve(),
  ],
}
