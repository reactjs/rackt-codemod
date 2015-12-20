export default ({ source }, { jscodeshift: j }) => {
  return j(source)
    .find(j.CallExpression, { callee: { property: { name: 'isActive' } } })
    .forEach(p => {
      const [ pathnameArg, queryArg, indexOnlyArg ] = p.value.arguments

      let locationArg
      if (
        queryArg &&
        (queryArg.type !== 'Literal' || queryArg.value != null)
      ) {
        locationArg = j.objectExpression([
          j.property('init', j.identifier('pathname'), pathnameArg),
          j.property('init', j.identifier('query'), queryArg)
        ])
      } else {
        locationArg = pathnameArg
      }

      const newArguments = [ locationArg ]
      if (indexOnlyArg) {
        newArguments.push(indexOnlyArg)
      }

      j(p).replaceWith(j.callExpression(p.value.callee, newArguments))
    })
    .toSource()
}
