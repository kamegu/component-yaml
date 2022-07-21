
export function parseRawYaml(rawYaml: any): ParsedYaml {
  const components = new Map<string, ComponentYaml>();

  if (rawYaml.components instanceof Object) {
    for (const key of Object.keys(rawYaml.components)) {
      components.set(key, rawYaml.components[key])
    }
  }
  return {
    components: components
  }
}

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
  url?: Array<string>
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

  constructor(name: string, src: string|ComponentElemYaml) {
    if (typeof src === 'string') {
      this.inner = {
        name: src
      }
      this.refkey = name + '//' + src
    } else {
      this.inner = src
      this.refkey = src.id || name + '//' + src.name
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
