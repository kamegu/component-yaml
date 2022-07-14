import * as fs from 'fs'
import * as YAML from 'yaml'
import { Command } from 'commander';
const program = new Command();

import {ParsedYaml, ComponentYaml} from './ParsedYaml'
import {buildPuml} from './plantuml'

function parseRawYaml(rawYaml: any): ParsedYaml {
  // function parseElem(elem: string|object): ComponentElemYaml {
  //     if (typeof elem === 'string') {
  //         return {
  //             name: elem
  //         }
  //     }
  //     console.log(elem)
  //     return elem
  // }
  // function parseComponentYaml(componentYaml: any): ComponentYaml {
  //     const elems = new Array<ComponentElemYaml>();
  //     componentYaml.values.forEach((elem) => {
  //         elems.push(parseElem(elem))
  //     });
  //     return {
  //         type: componentYaml.type,
  //         values: elems
  //     }
  // }
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


function run(): void {
  program
    .option('--output', 'output file', 'components.puml')
  const options = program.opts();
  const outputFile = options.output

  const file = fs.readFileSync('./components.yaml', 'utf8')
  const raw = YAML.parse(file)

  console.log(raw.components)

  const parsed = parseRawYaml(raw)
  const uml = buildPuml(parsed)

  fs.writeFileSync(outputFile, uml)
  // console.log(parsed)
  //
  // parsed.components.forEach((value, key) => {
  //   value.values.forEach((v) => {
  //
  //     console.log(key + ":" + v)
  //   })
  // })
}

run()