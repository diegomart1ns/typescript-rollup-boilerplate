import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import camelCase from 'lodash.camelcase'
import typescript from 'rollup-plugin-typescript2'
import json from 'rollup-plugin-json'
import replace from 'rollup-plugin-replace'
import compiler from '@ampproject/rollup-plugin-closure-compiler'

const canICompile = () => {
  const spawn = require('child_process').spawn('java', ['-version'])
  spawn.on('error', () => console.log('Error on spawn'))
  spawn.stderr.on('data', (data) => {
      data = data.toString().split('\n')[0]
      const javaVersion = new RegExp('java version').test(data) ? data.split(' ')[2].replace(/"/g, '') : false
      if (javaVersion != false) {
        return compiler()
      } else {
        console.log(
          '\x1b[1m\x1b[31m',
          'Java is not installed.',
          'Please do install it in order to run Google Closure Compiler.',
          'https://www.java.com/en/download/win10.jsp'
          )
        return null
      }
  })
}

/**
 * - Defining rollupPlugins
 * - Currently using:
 *  1. Replace (removing node environment things)
 *  2. Resolve (module resolution plugin)
 *  3. JSON (resolve JSON files)
 *  4. TypeScript (compile TS files)
 *  5. CommonJS (allow cjs understanding)
 *  6. Google Closure Compiler (it reduces the bundle size) 
 */
const rollupPlugins = [
  replace({
    'process.env.NODE_ENV': JSON.stringify('production')
  }),
  resolve({ jsnext: true, preferBuiltins: true, browser: true }),
  json(),
  // See more info about objectHashIgnoreUnknownHack at
  // https://github.com/ezolenko/rollup-plugin-typescript2#user-content-plugins-using-asyncawait
  typescript({ useTsconfigDeclarationDir: true, objectHashIgnoreUnknownHack: true }),
  commonjs(),
  canICompile(),
]

/**
 * - Available modules for exporting
 * - Currently available:
 *  1. All Modules under the name typescript-rollup-boilerplate-example.js
 */
const modulesConfig = {
  allModules: {
    name: 'typescript-rollup-boilerplate-example',
    file: 'src/example.ts',
    resolved: 'dist/typescript-rollup-boilerplate-example'
  },
  directModule: {
    name: 'typescript-rollup-boilerplate-direct-example',
    file: 'src/example-modules/index.ts',
    resolved: 'dist/typescript-rollup-boilerplate-direct-example'
  }
}

const allBundles = Object.keys(modulesConfig).map((key) => {
  const currentModule = modulesConfig[key];
  return {
    input: currentModule.file,
    output: [
      {
        file: `${currentModule.resolved}.js`,
        name: camelCase(currentModule.name),
        format: 'umd',
        sourcemap: true
      },
      { file: `${currentModule.resolved}.es5.js`, format: 'es', sourcemap: true }
    ],
    external: [],
    watch: {
      include: 'src/**'
    },
    plugins: rollupPlugins
  }
})

export default allBundles