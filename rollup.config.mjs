import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'index.ts',
  output: {
    file: 'dist/index.umd.js',
    format: 'umd',
    name: 'MzuniPay',
  },
  plugins: [typescript(), resolve(), commonjs()],
};
