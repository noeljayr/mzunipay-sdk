import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';

export default {
  input: 'index.ts', // Your entry file
  output: {
    file: 'dist/index.umd.js',
    format: 'umd',
    name: 'MzuniPay', // This is the global variable name
    sourcemap: true,
  },
  plugins: [
    resolve(),
    commonjs(),
    typescript(),
  ],
};

