import {ParsedYaml, ComponentYaml, ComponentElemYaml, RelationYaml, GroupYaml, elemName} from './ParsedYaml'

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
  const elements = new Array<string>()
  const relations = new Array<string>()

  elems.forEach((elem: string| ComponentElemYaml) => {
    const name = elemName(elem)
    elements.push(name)

    if (elem !== null && typeof elem === 'object') {
      if (elem.input) {
        elem.input.forEach((mapping: RelationYaml) => {
          const relation = mapping.relation ? ":" + mapping.relation : ""
          relations.push(`[${mapping.ref}] --> [${name}]${relation}`)
        })
      }
      if (elem.output) {
        elem.output.forEach((mapping: RelationYaml) => {
          const relation = mapping.relation ? ":" + mapping.relation : ""
          relations.push(`[${name}] --> [${mapping.ref}]${relation}`)
        })
      }
    }
  })

  if (type === "queue") {
    return elements.map((elem, idx) => {
      return `
${type} "${compName}/${elem}"${queueColor} {
[${elem}]
}
`
    }).join("\n")
  }

  const elementsBlock = elements.map((elem) => `[${elem}]`).join("\n")
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
