export interface ParsedYaml {
  components: Map<string, ComponentYaml>
}

export interface ComponentYaml {
  type: string,
  url?: Array<string>
  description?: string
  elements: Array<string | ComponentElemYaml>,
  groups?: Array<GroupYaml>
}

export interface GroupYaml {
  name: string,
  elements: Array<string | ComponentElemYaml>
}

export interface ComponentElemYaml {
  name: string,
  id?: string
  description?: string
  input?: Array<RelationYaml>,
  output?: Array<RelationYaml>,
  use?: Array<RelationYaml>
}

export interface RelationYaml {
  ref: string,
  component?: string,
  relation?: string
}

export class Element {
  inner: ComponentElemYaml
  refkey: string

  constructor(src: string|ComponentElemYaml) {
    if (typeof src === 'string') {
      this.inner = {
        name: src
      }
      this.refkey = src
    } else {
      this.inner = src
      this.refkey = src.id || src.name
    }
  }
}

export function elemName(elem: string|ComponentElemYaml): string {
  if (typeof elem === 'string') {
    return elem
  } else {
    return elem.name
  }
}
