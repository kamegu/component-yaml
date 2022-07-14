export interface ParsedYaml {
  components: Map<string, ComponentYaml>
}

export interface ComponentYaml {
  type: string,
  elements: Array<string | ComponentElemYaml>,
  groups?: Array<GroupYaml>
}

export interface GroupYaml {
  name: string,
  elements: Array<string | ComponentElemYaml>
}

export interface ComponentElemYaml {
  name: string,
  input?: Array<RelationYaml>,
  output?: Array<RelationYaml>,
  use?: Array<RelationYaml>
}

export interface RelationYaml {
  name: string,
  component?: string,
  relation?: string
}

export function elemName(elem: string|ComponentElemYaml): string {
  if (typeof elem === 'string') {
    return elem
  } else {
    return elem.name
  }
}
