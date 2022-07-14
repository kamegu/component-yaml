import {ParsedYaml, ComponentYaml, ComponentElemYaml, RelationYaml, GroupYaml, elemName} from './ParsedYaml'



function groupedBlock(type: string, compName: string, elems: Array<string|ComponentElemYaml>): string {
  const elements = new Array<string>()
  const relations = new Array<string>()

  elems.forEach((elem: string| ComponentElemYaml) => {
    const name = elemName(elem)
    elements.push(name)

    if (elem !== null && typeof elem === 'object') {
      if (elem.input) {
        elem.input.forEach((mapping: RelationYaml) => {
          relations.push(`${mapping.name} --> ${name}`)
        })
      }
      if (elem.output) {
        elem.output.forEach((mapping: RelationYaml) => {
          relations.push(`${name} --> ${mapping.name}`)
        })
      }
    }
  })

  const indent = "  "
  function shape(elem: string) {
    if (type === 'queue') {
      return `${elem}>${elem}]:::queueClass`
    }
    return elem
  }

  function subgraphs() {
    if (type === 'app') {
      const elementsBlock = elements.map((elem) => `${indent}${shape(elem)}`).join("\n")
      return wrapSubgraph(elementsBlock)
    } else {
      return elements.map((elem) => `${indent}subgraph ${compName}/${elem}
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

${componentsBlock}
`
  return "```mermaid\n" + mermaidText + "\n```\n"
}
