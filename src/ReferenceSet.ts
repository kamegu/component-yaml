import {ComponentElemYaml, Element, GroupYaml, ParsedYaml} from "./ParsedYaml";

export class ReferenceSet {
  refMap: Map<string, Map<string, string>>
  appMap: Map<string, string> // refkey => component

  constructor(parsed: ParsedYaml) {
    this.refMap = new Map
    this.appMap = new Map
    parsed.components.forEach((comp, name) => {
      this.initElementRefs(name, comp.elements)
      if (comp.groups) {
        comp.groups.forEach((group: GroupYaml) => {
          this.initElementRefs(name, group.elements)
        })
      }
    })
  }

  private initElementRefs(name: string, elements: Array<string|ComponentElemYaml>) {
    elements.forEach((e) => {
      const elem = new Element(e)
      if (this.appMap.has(elem.refkey)) {
        console.error("duplicated key exists: " + elem.refkey)
        process.exit()
      }
      this.appMap.set(elem.refkey, name)
      if (e !== null && typeof e === 'object') {
        if (e.input) {
          e.input.forEach((relation) => {
            this.updateRefMap(elem.refkey, relation.ref, "input", "inputted")
          })
        }
        if (e.output) {
          e.output.forEach((relation) => {
            this.updateRefMap(elem.refkey, relation.ref, "output", "outputted")
          })
        }
        if (e.use) {
          e.use.forEach((relation) => {
            this.updateRefMap(elem.refkey, relation.ref, "use", "used")
          })
        }
      }
    })
  }
  private updateRefMap(id, refId, type, refType) {
    const forwardMap = this.refMap.get(id) || new Map<string, string>()
    forwardMap.set(refId, type)
    this.refMap.set(id, forwardMap)
    const backwardMap = this.refMap.get(refId) || new Map<string, string>()
    backwardMap.set(id, refType)
    this.refMap.set(refId, backwardMap)
  }

  referable(targets: Array<string>, distance: number = 2, ignores: Array<string>, ignoreUnknown: boolean) {
    const refIds = new Set<string>()
    targets.forEach((target) => {
      refIds.add(target)
      const refs = this.refMap.get(target)
      if (refs) {
        refs.forEach((type, relation) => {
          refIds.add(relation)
          const filterType = (type === "input" || type === "outputted")
            ? ["input", "outputted"]
            : ((type === "output" || type === "inputted")
              ? ["output", "inputted"]
              :[])
          this.referableSingle(relation, target, distance - 1, filterType).forEach((id) => {
            refIds.add(id)
          })
        })
      }
    })
    return Array.from(refIds).filter((refkey) => {
      if (this.appMap.has(refkey)) {
        return !ignores.includes(this.appMap.get(refkey))
      } else {
        return !ignoreUnknown
      }
    })
  }

  private referableSingle(target: string, srcElem: string, distance: number, filterType: Array<string>): Set<string> {
    const refIds = new Set<string>()
    if (distance <= 0) {
      return refIds
    }
    const refs = this.refMap.get(target)
    if (refs) {
      refs.forEach((type, relation) => {
        if (relation !== srcElem) { // avoid infinite loop
          // if (filterType.includes(type)) {
            refIds.add(relation)
            this.referableSingle(relation, target, distance - 1, filterType).forEach((id) => {
              refIds.add(id)
            })
          // }
        }
      })
    }

    return refIds
  }
}
