import parsePath from 'history/lib/parsePath'

function replace(source, api, flavor) {
  const j = api.jscodeshift

  return j(source)
    .find(j.CallExpression, {
      callee: { property: { name: `${flavor}State` } } }
    )
    .forEach(p => {
      const [ stateArg, pathArg, queryArg ] = p.value.arguments
      const properties = []

      if (queryArg) {
        properties.push(j.property('init', j.identifier('query'), queryArg))
      }
      if (stateArg.type !== 'Literal' || stateArg.value != null) {
        properties.push(j.property('init', j.identifier('state'), stateArg))
      }

      let argument
      if (properties.length === 0) {
        argument = pathArg
      } else {
        if (pathArg.type === 'Literal' && pathArg.value) {
          const parsedPath = parsePath(pathArg.value)
          Object.keys(parsedPath).reverse().map(pathKey => {
            const pathValue = parsedPath[pathKey]
            if (pathValue) {
              properties.unshift(
                j.property('init', j.identifier(pathKey), j.literal(pathValue))
              )
            }
          })
        } else {
          properties.unshift(
            j.property('init', j.identifier('pathname'), pathArg)
          )
        }
        argument = j.objectExpression(properties)
      }

      j(p).replaceWith(j.callExpression(
        j.memberExpression(p.value.callee.object, j.identifier(flavor)),
        [ argument ]
      ))
    })
    .toSource()
}

export default (file, api) => {
  let { source } = file
  source = replace(source, api, 'push')
  source = replace(source, api, 'replace')

  return source
}
