import parsePath from 'history/lib/parsePath'

function replace(source, j, methodName) {
  return j(source)
    .find(j.CallExpression, {
      callee: { property: { name: methodName } } }
    )
    .forEach(p => {
      const [ pathArg, queryArg ] = p.value.arguments
      if (!queryArg) {
        return
      }

      const properties = []

      if (pathArg.type === 'Literal' && pathArg.value) {
        const parsedPath = parsePath(pathArg.value)
        Object.keys(parsedPath).map(pathKey => {
          const pathValue = parsedPath[pathKey]
          if (pathValue) {
            properties.push(
              j.property('init', j.identifier(pathKey), j.literal(pathValue))
            )
          }
        })
      } else {
        properties.push(
          j.property('init', j.identifier('pathname'), pathArg)
        )
      }

      properties.push(j.property('init', j.identifier('query'), queryArg))

      j(p).replaceWith(j.callExpression(
        p.value.callee,
        [ j.objectExpression(properties) ]
      ))
    })
    .toSource()
}

export default (file, { jscodeshift: j }) => {
  let { source } = file
  source = replace(source, j, 'createPath')
  source = replace(source, j, 'createHref')

  return source
}
