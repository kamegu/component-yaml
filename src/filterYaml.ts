import {ParsedYaml, ComponentYaml, ComponentElemYaml, RelationYaml, GroupYaml, Element} from './ParsedYaml'

export function filterYaml(parsed: ParsedYaml, targets: Array<string>): ParsedYaml {
  if (!targets || targets.length === 0) {
    return parsed
  }

  const components = new Map<string, ComponentYaml>();

  parsed.components.forEach((comp, name) => {
    const filteredElements = filterElement(comp.elements, targets)
    const filteredGroups = filterGroups(comp.groups, targets)
    if (filteredElements.length > 0 || (filteredGroups && filteredGroups.length > 0)) {
      const filteredComponent = {
        type: comp.type,
        elements: filteredElements,
        groups: filteredGroups
      }
      components.set(name, filteredComponent)
    }
  })

  return {
    components: components
  }

}

function filterGroups(groups: Array<GroupYaml>|undefined, targets: Array<string>): Array<GroupYaml>|undefined {
  if (!groups) {
    return groups
  }
  const filtered = new Array<GroupYaml>()

  groups.forEach((group) => {
    const elems = filterElement(group.elements, targets)
    if (elems.length > 0) {
      filtered.push({
        name: group.name,
        elements: elems
      })
    }
  })

  if (filtered.length === 0) {
    return undefined
  }
  return filtered
}

function filterElement(elements: Array<string|ComponentElemYaml>, targets: Array<string>) {
  const filtered = new Array<string|ComponentElemYaml>()

  elements.forEach((e) => {
    const elem = new Element(e)
    const refkey = elem.refkey
    if (targets.includes(refkey)) {
      const el = elem.inner
      el.input = filterRelation(el.input, targets)
      el.output = filterRelation(el.output, targets)
      el.use = filterRelation(el.use, targets)
      filtered.push(el)
    }
  })

  return filtered
}

function filterRelation(relations: Array<RelationYaml>|undefined, targets: Array<string>) {
  if (!relations) {
    return relations
  }
  const filtered = relations.filter((relation) => targets.includes(relation.ref))
  if (filtered.length === 0) {
    return undefined
  }
  return filtered
}
