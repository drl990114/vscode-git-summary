import ts from 'rollup-plugin-typescript2'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
export default {
  input: './src/extension.ts',
  output: [
    {
      file: 'out/extension.js',
      format: 'cjs',
      sourcemap: true,
    },
  ],
  plugins: [
    ts({ tsconfig: './tsconfig.json' }),
    resolve({ browser: true }),
    commonjs(),
  ],
}
