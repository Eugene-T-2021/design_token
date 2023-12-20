const lodash = require('lodash');

const standalones = ['typography', 'boxShadow']
const boxShadowProps = ['x', 'y', 'blur', 'spread', 'color', 'type']

const mixinizeObj = (token) => {
  const stringifiedValues = Object.keys(token.value).map(k => `  ${k}: ${token.value[k]}`).join('\n')
  return `@mixin ${token.name} {\n${stringifiedValues}\n}`
}

module.exports = {
  source: [`input/**/*.json`],
  transform: {
    typoTransform: {
      type: 'value',
      name: 'typoTransform',
      matcher: (token) => {
        return token.type === 'typography'
      },
      transformer: (token) => {
        const transformedValue = {}
        Object.keys(token.value).forEach(k => {
          transformedValue[lodash.kebabCase(k)] = lodash.kebabCase(k) === 'font-family' ? `'${token.value[k]}'` : token.value[k]
        })
        return transformedValue
      }
    }
  },
 
  format: {
    typoFormat: ({dictionary}) => {
      return dictionary.allTokens.map(token => mixinizeObj(token)).join('\n\n')
    },
    boxShadowFormat: ({dictionary}) => {
      return dictionary.allTokens.map(token => {
        const values = token.value.map(v =>
            boxShadowProps.map(prop => {
                if (prop === 'type') {
                    return v[prop] === 'innerShadow' ? 'inset' : ''
                }
                return v[prop] ?? ''
            }).filter(item => item !== '').join(' ')
        ).join(', ')
        return `@mixin ${token.name} {\n  box-shadow: ${values}\n}`
      }).join('\n\n')
    },
  },
  platforms: {
    scss: {
      transforms: ['name/cti/kebab', 'typoTransform'],
      // transformGroup: 'scss',
      buildPath: 'build/scss/',
      files: [
        {
          destination: '_variables.scss',
          format:'scss/variables',
          filter: function (token) {
            return !standalones.includes(token.type)
          }
        },
        {
           destination: '_typo.scss',
           format: 'typoFormat',
           filter: function (token) {
             return token.type === 'typography'
           }
        },
        {
           destination: '_boxShadow.scss',
           format: 'boxShadowFormat',
           filter: function (token) {
             return token.type === 'boxShadow'
           }
        }
      ],
    },
  }
}
