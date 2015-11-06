import babel from 'rollup-plugin-babel';
import npm from 'rollup-plugin-npm';

export default {
  entry: 'lib/editor.jsx',
  plugins: [
    npm({jsnext: true, main: true}),
    babel({
      // presets: ['react']
    })
  ],
  format: 'iife'
}
