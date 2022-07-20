import {ParsedYaml, ComponentYaml, ComponentElemYaml, RelationYaml, GroupYaml, Element} from './ParsedYaml'

function groupedBlock(type: string, compName: string, elems: Array<string|ComponentElemYaml>): string {
  const elements = new Array<Element>()
  const relations = new Array<string>()

  elems.forEach((e: string| ComponentElemYaml) => {
    const elem = new Element(e)
    const name = elem.refkey
    elements.push(elem)

    if (e !== null && typeof e === 'object') {
      if (e.input) {
        e.input.forEach((mapping: RelationYaml) => {
          relations.push(`${mapping.ref} --> ${name}`)
        })
      }
      if (e.output) {
        e.output.forEach((mapping: RelationYaml) => {
          relations.push(`${name} --> ${mapping.ref}`)
        })
      }
      if (e.use) {
        e.use.forEach((mapping: RelationYaml) => {
          relations.push(`${name} -.-> ${mapping.ref}`)
        })
      }
    }
  })

  const indent = "  "
  function shape(elem: Element) {
    const refkey = elem.refkey
    const elemName = elem.inner.name
    if (type === 'queue') {
      return `${refkey}>${elemName}]:::queueClass`
    }
    if (type === 'database') {
      return `${refkey}[(${elemName})]:::databaseClass`
    }
    if (refkey !== elemName) {
      return `${refkey}[${elemName}]`
    }
    return elemName
  }

  function subgraphs() {
    if (type !== 'queue') {
      const elementsBlock = elements.map((elem) => `${indent}${shape(elem)}`).join("\n")
      return wrapSubgraph(elementsBlock)
    } else {
      return elements.map((elem) => `${indent}subgraph ${compName}/${elem.inner.name}
${indent}${shape(elem)}
${indent}end
`)
        .join("\n")
    }
  }

  function wrapSubgraph(block: string) {
    return `${indent}subgraph ${compName}
${block}
${indent}end
`
  }

  // const elementsBlock = elements.map((elem) => `${indent}${shape(elem)}`).join("\n")
  const relationsBlock = relations.map((rel) => indent + rel).join("\n")

  return `
${subgraphs()}
${relationsBlock}
`
}

export function buildMermaid(parsedYaml: ParsedYaml): string {

  const components = new Array<string>()
  parsedYaml.components.forEach((component: ComponentYaml, name: string) => {
    const type = component.type

    const block = groupedBlock(type, name, component.elements)
    components.push(block);

    if (component.groups) {
      component.groups.forEach((group: GroupYaml) => {
        const block = groupedBlock(type, name + "/" + group.name, group.elements)
        components.push(block);
      })
    }
  })
  const componentsBlock = components.join("\n")

  const mermaidText = `
flowchart TD
  classDef queueClass fill:#bff,color:#333
  classDef databaseClass fill:#bff,color:#333

${componentsBlock}
`
  return "```mermaid\n" + mermaidText + "\n```\n"
}
