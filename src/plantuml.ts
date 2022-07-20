import {ParsedYaml, ComponentYaml, ComponentElemYaml, RelationYaml, GroupYaml, Element} from './ParsedYaml'

const queueColor = "#bff"

function plantumlType(type: string): string {
  if (type === "queue") {
    return "queue"
  }
  if (type === "database") {
    return "database"
  }
  if (type === "cloud") {
    return "cloud"
  }
  return "node"
}

function groupedBlock(type: string, compName: string, elems: Array<string|ComponentElemYaml>): string {
  const elements = new Array<Element>()
  const relations = new Array<string>()

  elems.forEach((e: string| ComponentElemYaml) => {
    const elem = new Element(compName, e)
    elements.push(elem)

    if (e !== null && typeof e === 'object') {
      if (e.input) {
        e.input.forEach((mapping: RelationYaml) => {
          const relation = mapping.relation ? ":" + mapping.relation : ""
          relations.push(`[${mapping.ref}] --> [${elem.refkey}]${relation}`)
        })
      }
      if (e.output) {
        e.output.forEach((mapping: RelationYaml) => {
          const relation = mapping.relation ? ":" + mapping.relation : ""
          relations.push(`[${elem.refkey}] --> [${mapping.ref}]${relation}`)
        })
      }
    }
  })

  if (type === "queue") {
    return elements.map((elem, idx) => {
      return `
${type} "${compName}/${elem.inner.name}"${queueColor} {
[${elem.refkey}]
}
`
    }).join("\n")
  }

  const elementsBlock = elements.map((elem) => `[${elem.refkey}]`).join("\n")
  const relationsBlock = relations.join("\n")
  return `
${type} "${compName}" {
${elementsBlock}
${relationsBlock}
}
`
}

export function buildPuml(parsedYaml: ParsedYaml): string {

  const components = new Array<string>()
  parsedYaml.components.forEach((component: ComponentYaml, name: string) => {
    const type = plantumlType(component.type)

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


  return `
@startuml
${componentsBlock}
@enduml
`


}
