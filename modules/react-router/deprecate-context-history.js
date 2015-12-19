export default ({ source }, { jscodeshift: j }) => {
  const root = j(source)

  const classContextTypesHistory = root
    .find(j.ClassProperty, { key: { name: 'contextTypes' } })
    .find(j.Property, { key: { name: 'history' } })
  const constructorContextTypesHistory = root
    .find(
      j.AssignmentExpression, { left: { property: { name: 'contextTypes' } } }
    )
    .find(j.Property, { key: { name: 'history' } })
  const getContextTypesHistory = root
    .find(j.Property, { key: { name: 'getContextTypes' } })
    .find(j.Property, { key: { name: 'history' } })

  if (!(
    classContextTypesHistory.size() ||
    constructorContextTypesHistory.size() ||
    getContextTypesHistory.size())
  ) {
    return source
  }

  return root
    .find(j.Identifier, { name: 'history' })
    .replaceWith(() => j.identifier('router'))
    .toSource()
}
