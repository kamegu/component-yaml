import * as fs from 'fs'
import * as YAML from 'yaml'
import { Command } from 'commander';
const program = new Command();

import {ParsedYaml, ComponentYaml} from './ParsedYaml'
import {filterYaml} from "./filterYaml";
import {ReferenceSet} from "./ReferenceSet";
import {buildPuml} from './plantuml'
import {buildMermaid} from "./mermaid";

function parseRawYaml(rawYaml: any): ParsedYaml {
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
  function commaSeparatedList(value, dummyPrevious) {
    return value.split(',').filter(w => w.length > 0);
  }

  program
    .option('--format <str>', 'output format','puml')
    .option('--output-dir <str>', 'output directory', 'output')
    .option('--output <str>', 'output file', 'components')
    .option('--target <str>', 'target elements(comma-separated)', commaSeparatedList, [])
    .option('--distance <num>', 'distance from target', '3')

  program.parse()
  const options = program.opts();
  const format = options.format
  const extention = (format === "mermaid") ? ".md" : "." + format
  const outDir = options.outputDir
  const outputFile = options.output
  const outputFileName = outDir + (outDir.endsWith("/") ? "" : "/") + outputFile + (outputFile.endsWith(extention) ? "" : extention)

  const targets = options.target
  const distance = parseInt(options.distance, 10)

  const file = fs.readFileSync('./components.yaml', 'utf8')
  const raw = YAML.parse(file)

  console.log(raw.components)

  const parsed = parseRawYaml(raw)

  console.log({'targets': targets, 'distance': distance})
  const referenceSet = new ReferenceSet(parsed)
  const referable = referenceSet.referable(targets, distance)
  console.log(['referable', referable])

  const filtered = filterYaml(parsed, referable)

  if (!fs.existsSync(outDir)){
    fs.mkdirSync(outDir)
  }
  if (format === "puml") {
    const uml = buildPuml(filtered)

    fs.writeFileSync(outputFileName, uml)
  } else if (format === "mermaid") {
    const uml = buildMermaid(filtered)

    fs.writeFileSync(outputFileName, uml)
  }

  console.log("output: " + outputFileName)
}

run()