function isDeprecatedAttribute(attribute) {
  const { name } = attribute.name
  return [ 'query', 'hash', 'state' ].includes(name)
}

function getValueExpression(value) {
  if (value.type === 'Literal') {
    return value
  }

  return value.expression
}

function replace(source, j, componentName) {
  return j(source)
    .find(j.JSXOpeningElement, { name: { name: componentName } })
    .forEach(p => {
      const { name, attributes, selfClosing } = p.value

      const deprecatedAttributes = attributes.filter(isDeprecatedAttribute)
      if (!deprecatedAttributes.length) {
        return
      }

      const newAttributes = attributes
        .filter(attribute => !isDeprecatedAttribute(attribute))
        .map(attribute => {
          if (attribute.name.name !== 'to') {
            return attribute
          }

          const properties = [
            j.property(
              'init', j.identifier('pathname'),
              getValueExpression(attribute.value)
            )
          ]

          properties.push(...deprecatedAttributes.map(({ name, value }) => (
            j.property(
              'init', j.identifier(name.name),
              getValueExpression(value)
            )
          )))

          return j.jsxAttribute(
            j.jsxIdentifier('to'),
            j.jsxExpressionContainer(j.objectExpression(properties))
          )
        })

      j(p).replaceWith(j.jsxOpeningElement(name, newAttributes, selfClosing))
    })
    .toSource()
}

export default (file, { jscodeshift: j }) => {
  let { source } = file
  source = replace(source, j, 'Link')
  source = replace(source, j, 'IndexLink')

  return source
}
